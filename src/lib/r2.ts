import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "komikweeks";
const R2_PUBLIC_DOMAIN =
  process.env.R2_PUBLIC_DOMAIN?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_R2_URL?.replace(/\/$/, "");

let cachedClient: S3Client | null = null;

export function isR2Configured(): boolean {
  return Boolean(
    R2_ACCOUNT_ID &&
      R2_ACCESS_KEY_ID &&
      R2_SECRET_ACCESS_KEY &&
      R2_BUCKET_NAME,
  );
}

export function getR2Client(): S3Client {
  if (!isR2Configured()) {
    throw new Error(
      "Cloudflare R2 belum dikonfigurasi. Pastikan R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, dan R2_BUCKET_NAME telah diisi.",
    );
  }

  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  return cachedClient;
}

export interface PresignedUrlOptions {
  key: string;
  contentType: string;
  expiresIn?: number; // detik, default 300 (5 menit)
}

export interface PresignedUrlResult {
  presignedUrl: string;
  publicUrl: string;
  key: string;
  cacheControl: string;
}

/**
 * Membuat Presigned PUT URL untuk upload langsung dari browser ke Cloudflare R2
 * Header Cache-Control agresif (1 tahun + immutable) disematkan otomatis agar di-cache oleh Cloudflare Edge.
 */
export async function createPresignedUploadUrl({
  key,
  contentType,
  expiresIn = 300,
}: PresignedUrlOptions): Promise<PresignedUrlResult> {
  const s3 = getR2Client();
  const cacheControl = "public, max-age=31536000, immutable";

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    CacheControl: cacheControl,
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn });

  const publicUrl = R2_PUBLIC_DOMAIN
    ? `${R2_PUBLIC_DOMAIN}/${key}`
    : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

  return {
    presignedUrl,
    publicUrl,
    key,
    cacheControl,
  };
}
