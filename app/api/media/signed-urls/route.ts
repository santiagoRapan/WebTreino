import { z } from "zod"
import { createAuthenticatedClient } from "@/services/database/supabaseServer"
import { createR2SignedGetUrl } from "@/services/storage/r2"

export const runtime = "nodejs"

const bodySchema = z.object({
  accessToken: z.string().min(1),
  mediaIds: z.array(z.string().min(1)).min(1),
  expiresInSeconds: z.number().int().positive().max(24 * 60 * 60).optional(),
})

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { accessToken, mediaIds, expiresInSeconds } = parsed.data
    const supabase = createAuthenticatedClient(accessToken)

    const { data: rows, error } = await supabase
      .from("workout_session_media")
      .select("id, r2_key, mime_type")
      .in("id", mediaIds)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const media = await Promise.all(
      (rows || []).map(async (row: any) => {
        const url = await createR2SignedGetUrl({
          key: row.r2_key,
          expiresInSeconds: expiresInSeconds ?? 3600,
        })
        return { id: row.id, url, mime_type: row.mime_type ?? null }
      })
    )

    return new Response(JSON.stringify({ media }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
