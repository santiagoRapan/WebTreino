import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

let r2Client: S3Client | null = null

function getR2Client(): S3Client {
  if (r2Client) return r2Client

  const accessKeyId = requiredEnv("R2_ACCESS_KEY_ID")
  const secretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY")
  const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID
  const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined)

  if (!endpoint) {
    throw new Error(
      "Missing R2_ENDPOINT (or set R2_ACCOUNT_ID/CLOUDFLARE_ACCOUNT_ID to build the default endpoint)"
    )
  }

  r2Client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  })

  return r2Client
}

export async function createR2SignedGetUrl(params: {
  key: string
  expiresInSeconds?: number
}): Promise<string> {
  const bucket = requiredEnv("R2_BUCKET_NAME")

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: params.key,
  })

  return getSignedUrl(getR2Client(), command, {
    expiresIn: params.expiresInSeconds ?? 60,
  })
}
