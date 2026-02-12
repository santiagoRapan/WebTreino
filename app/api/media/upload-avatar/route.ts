import { NextRequest } from "next/server"
import { createAuthenticatedClient, supabaseServer } from "@/services/database/supabaseServer"
import { uploadToR2 } from "@/services/storage/r2"
import { checkRateLimit } from "@/lib/rate-limit"
import sharp from "sharp"
import { fileTypeFromBuffer } from "file-type"

export const runtime = "nodejs"

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const R2_PUBLIC_URL = "https://pub-fc13b59447f14c93b61dec3e45ace7e8.r2.dev"

export async function POST(req: NextRequest) {
  try {
    // 1. Extract and validate authorization token
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const accessToken = authHeader.replace("Bearer ", "")
    const supabase = createAuthenticatedClient(accessToken)

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const userId = user.id

    // 2. Check rate limit
    const rateLimitResult = checkRateLimit(userId, 5, 3600000) // 5 uploads per hour
    const rateLimitHeaders = {
      "X-RateLimit-Limit": "5",
      "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      "X-RateLimit-Reset": rateLimitResult.resetAt.toString(),
    }

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
            ...rateLimitHeaders,
          },
        }
      )
    }

    // 3. Parse multipart form data
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...rateLimitHeaders },
      })
    }

    // 4. Validate file type and size
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...rateLimitHeaders },
        }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          error: "File too large. Maximum size is 2MB.",
          details: { maxSize: MAX_FILE_SIZE, receivedSize: file.size },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...rateLimitHeaders },
        }
      )
    }

    // 5. Convert file to buffer and validate magic number
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const detectedType = await fileTypeFromBuffer(buffer)
    if (!detectedType || !["jpg", "png", "webp"].includes(detectedType.ext)) {
      return new Response(
        JSON.stringify({ error: "Invalid file format. File does not appear to be a valid image." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...rateLimitHeaders },
        }
      )
    }

    // 6. Process image with Sharp
    let processedBuffer: Buffer
    try {
      processedBuffer = await sharp(buffer)
        .resize(400, 400, {
          fit: "cover",
          position: "center",
        })
        .webp({
          quality: 80,
          effort: 4,
        })
        .toBuffer()
    } catch (error) {
      console.error("[upload-avatar] Image processing failed:", error)
      return new Response(
        JSON.stringify({ error: "Failed to process image. File may be corrupted." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...rateLimitHeaders },
        }
      )
    }

    // 7. Upload to R2
    const r2Key = `avatars/${userId}.webp`
    try {
      await uploadToR2({
        key: r2Key,
        body: processedBuffer,
        contentType: "image/webp",
      })
    } catch (error) {
      console.error("[upload-avatar] R2 upload failed:", error)
      return new Response(JSON.stringify({ error: "Failed to upload file to storage" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...rateLimitHeaders },
      })
    }

    // 8. Construct public URL
    const publicUrl = `${R2_PUBLIC_URL}/${r2Key}`

    console.log("[upload-avatar] Attempting to update user profile:", {
      userId,
      publicUrl,
      r2Key,
    })

    // 9. Update user profile in database (use service role to bypass RLS)
    const { data: updateData, error: updateError } = await supabaseServer
      .from("users")
      .update({ avatar_url: publicUrl })
      .eq("id", userId)
      .select()

    if (updateError) {
      console.error("[upload-avatar] Database update failed:", {
        error: updateError,
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
      })
      return new Response(
        JSON.stringify({
          error: "Failed to update user profile",
          details: updateError.message,
          code: updateError.code,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...rateLimitHeaders },
        }
      )
    }

    console.log("[upload-avatar] Database update successful:", updateData)

    // Verify the update by reading back the user data
    const { data: verifyData, error: verifyError } = await supabaseServer
      .from("users")
      .select("avatar_url")
      .eq("id", userId)
      .single()

    if (verifyError) {
      console.error("[upload-avatar] Verification failed:", verifyError)
    } else {
      console.log("[upload-avatar] Verified avatar_url in database:", verifyData?.avatar_url)
    }

    // 10. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        avatarUrl: publicUrl,
        message: "Avatar uploaded successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...rateLimitHeaders },
      }
    )
  } catch (error) {
    console.error("[upload-avatar] Unexpected error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
