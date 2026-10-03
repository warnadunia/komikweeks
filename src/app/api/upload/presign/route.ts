import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createPresignedUploadUrl, isR2Configured } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Verifikasi hak akses admin
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya admin yang diizinkan mengunggah." },
        { status: 401 },
      );
    }

    // 2. Cek apakah Cloudflare R2 sudah dikonfigurasi di environment
    if (!isR2Configured()) {
      return NextResponse.json(
        {
          error:
            "Cloudflare R2 belum dikonfigurasi. Harap lengkapi R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, dan R2_BUCKET_NAME.",
        },
        { status: 503 },
      );
    }

    const body = await req.json();
    const {
      filename,
      contentType = "image/webp",
      folder = "chapters",
      seriesSlug,
      chapterNumber,
    } = body;

    if (!filename) {
      return NextResponse.json(
        { error: "Nama file (filename) wajib diisi." },
        { status: 400 },
      );
    }

    // Bersihkan nama file dan ekstensi
    const ext = filename.split(".").pop()?.toLowerCase() || "webp";
    const cleanExt = contentType.includes("webp") ? "webp" : ext;
    const randomId = crypto.randomUUID().slice(0, 8);
    const timestamp = Date.now();

    // Susun struktur path di R2 yang terorganisir
    let key: string;
    if (folder === "chapters" && seriesSlug) {
      const chPart = chapterNumber !== undefined ? `ch-${chapterNumber}` : "general";
      key = `chapters/${seriesSlug}/${chPart}/${timestamp}-${randomId}.${cleanExt}`;
    } else if (folder === "covers") {
      key = `covers/${timestamp}-${randomId}.${cleanExt}`;
    } else {
      key = `${folder}/${timestamp}-${randomId}.${cleanExt}`;
    }

    // 3. Buat Presigned URL dengan cache header agresif
    const result = await createPresignedUploadUrl({
      key,
      contentType,
      expiresIn: 300, // 5 menit
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Presign URL error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Gagal membuat Presigned URL." },
      { status: 500 },
    );
  }
}
