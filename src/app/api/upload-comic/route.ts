import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validasi hak akses admin
        const admin = await getAdminUser();
        if (!admin) {
          throw new Error("Akses ditolak: Hanya admin yang diizinkan mengunggah.");
        }

        return {
          allowedContentTypes: [
            "image/webp",
            "image/jpeg",
            "image/png",
            "image/avif",
          ],
          maximumSizeInBytes: 25 * 1024 * 1024, // 25 MB max limit
          tokenPayload: JSON.stringify({
            adminId: admin.id,
            pathname,
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("File sukses terunggah di Vercel Blob:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Vercel Blob upload error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Gagal mengotorisasi upload ke Vercel Blob" },
      { status: 400 },
    );
  }
}
