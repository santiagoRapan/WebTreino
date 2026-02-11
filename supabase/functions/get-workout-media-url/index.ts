import { serve } from "https://deno.land/std/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { S3Client, GetObjectCommand } from "npm:@aws-sdk/client-s3"
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { mediaIds, expiresInSeconds } = await req.json()

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return new Response(JSON.stringify({ error: "Missing or invalid mediaIds array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const token = authHeader.replace("Bearer ", "")

    // Client for auth validation (uses anon key)
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    )

    // Client for database queries (uses service role to bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // 🔐 Validar usuario
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // 📸 Buscar media (multiple IDs)
    const { data: mediaRecords, error: mediaError } = await supabaseAdmin
      .from("workout_session_media")
      .select("id, session_id, r2_key, mime_type")
      .in("id", mediaIds)

    if (mediaError) {
      return new Response(JSON.stringify({ error: mediaError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    if (!mediaRecords || mediaRecords.length === 0) {
      return new Response(JSON.stringify({ media: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // 🔒 Verificar permisos - fetch related sessions to check if user has access
    const sessionIds = [...new Set(mediaRecords.map((m: any) => m.session_id))]

    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from("workout_session")
      .select("id, performer_id")
      .in("id", sessionIds)

    if (sessionsError) {
      return new Response(JSON.stringify({ error: sessionsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // Check if user is the performer or a trainer of the performer
    const performerIds = sessions.map((s: any) => s.performer_id)
    const isPerformer = performerIds.includes(user.id)

    let hasAccess = isPerformer

    if (!isPerformer) {
      // Check if user is a trainer of any of these performers
      const { data: trainerRelations } = await supabaseAdmin
        .from("trainer_student")
        .select("student_id")
        .eq("trainer_id", user.id)
        .in("student_id", performerIds)

      hasAccess = !!(trainerRelations && trainerRelations.length > 0)
    }

    if (!hasAccess) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // ☁️ Cliente R2
    const r2 = new S3Client({
      region: "auto",
      endpoint: Deno.env.get("R2_ENDPOINT"),
      credentials: {
        accessKeyId: Deno.env.get("R2_ACCESS_KEY")!,
        secretAccessKey: Deno.env.get("R2_SECRET_KEY")!,
      },
    })

    // Generate signed URLs for all media
    const expiresIn = expiresInSeconds && expiresInSeconds > 0 ? expiresInSeconds : 3600

    const mediaWithUrls = await Promise.all(
      mediaRecords.map(async (media: any) => {
        const command = new GetObjectCommand({
          Bucket: Deno.env.get("R2_BUCKET"),
          Key: media.r2_key,
        })

        const signedUrl = await getSignedUrl(r2, command, {
          expiresIn,
        })

        return {
          id: media.id,
          url: signedUrl,
          mime_type: media.mime_type
        }
      })
    )

    return new Response(JSON.stringify({ media: mediaWithUrls }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (err) {
    console.error("Error in get-workout-media-url:", err)
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
