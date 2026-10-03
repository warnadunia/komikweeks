/**
 * Utilitas Optimasi Gambar Komik di Sisi Browser (Client-side)
 * Mengonversi gambar (PNG/JPEG/dll) menjadi WebP dengan kualitas 80%
 * Menghemat 70-90% bandwidth dan storage R2 tanpa mengorbankan ketajaman komik.
 */

export interface OptimizeOptions {
  quality?: number; // 0.1 - 1.0 (default 0.80 = 80%)
  maxWidth?: number; // batas resolusi lebar (opsional)
}

export interface OptimizedImageResult {
  blob: Blob;
  file: File;
  width: number;
  height: number;
  aspectRatio: string;
  originalSize: number;
  optimizedSize: number;
  savingsPercent: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Mengonversi file gambar ke WebP 80% di memori browser pengguna sebelum upload.
 */
export async function convertToWebP(
  file: File,
  options: OptimizeOptions = {},
): Promise<OptimizedImageResult> {
  const quality = options.quality ?? 0.8;
  const maxWidth = options.maxWidth;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetWidth = img.naturalWidth;
      let targetHeight = img.naturalHeight;

      if (maxWidth && targetWidth > maxWidth) {
        const ratio = maxWidth / targetWidth;
        targetWidth = maxWidth;
        targetHeight = Math.round(targetHeight * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Gagal menginisialisasi HTML Canvas context"));
        return;
      }

      // Pastikan render halus untuk line art komik
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Gagal mengonversi gambar ke WebP"));
            return;
          }

          const originalBase = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          const webpFilename = `${originalBase}.webp`;
          const webpFile = new File([blob], webpFilename, { type: "image/webp" });

          const originalSize = file.size;
          const optimizedSize = blob.size;
          const savingsPercent = Math.max(
            0,
            Math.round(((originalSize - optimizedSize) / originalSize) * 100),
          );

          // Format aspect-ratio CSS (misal 768/1376)
          const aspectRatio = `${targetWidth}/${targetHeight}`;

          resolve({
            blob,
            file: webpFile,
            width: targetWidth,
            height: targetHeight,
            aspectRatio,
            originalSize,
            optimizedSize,
            savingsPercent,
          });
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("File bukan gambar yang valid atau gagal dibaca"));
    };

    img.src = objectUrl;
  });
}

export interface DirectUploadParams {
  file: File;
  folder: "covers" | "chapters" | "events" | "strips";
  seriesSlug?: string;
  chapterNumber?: number;
  quality?: number;
  maxWidth?: number;
  onProgress?: (progressPercent: number) => void;
}

export interface UploadSuccessResult {
  publicUrl: string;
  key: string;
  width: number;
  height: number;
  aspectRatio: string;
  originalSize: number;
  optimizedSize: number;
  savingsPercent: number;
}

/**
 * Alur Penuh Sesuai Best Practice:
 * 1. Kompresi gambar ke WebP 80% di browser
 * 2. Minta Presigned URL dari API Next.js (dengan header Cache-Control agresif)
 * 3. Kirim PUT langsung ke Cloudflare R2 (Bypass Vercel payload limit 4.5 MB)
 */
export async function uploadDirectToR2({
  file,
  folder,
  seriesSlug,
  chapterNumber,
  quality = 0.8,
  maxWidth,
  onProgress,
}: DirectUploadParams): Promise<UploadSuccessResult> {
  // 1. Optimasi ke WebP di browser
  const optimized = await convertToWebP(file, { quality, maxWidth });

  // 2. Minta Presigned URL
  const presignRes = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: optimized.file.name,
      contentType: "image/webp",
      folder,
      seriesSlug,
      chapterNumber,
    }),
  });

  if (!presignRes.ok) {
    const errorData = await presignRes.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal mendapatkan izin upload dari server.");
  }

  const { presignedUrl, publicUrl, key } = await presignRes.json();

  // 3. Upload langsung ke R2 via XMLHttpRequest (agar mendukung onProgress event)
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presignedUrl, true);
    xhr.setRequestHeader("Content-Type", "image/webp");
    xhr.setRequestHeader("Cache-Control", "public, max-age=31536000, immutable");

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new Error(`Upload ke R2 gagal dengan status HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Koneksi ke storage R2 gagal. Periksa koneksi internet atau CORS R2."));
    xhr.send(optimized.blob);
  });

  return {
    publicUrl,
    key,
    width: optimized.width,
    height: optimized.height,
    aspectRatio: optimized.aspectRatio,
    originalSize: optimized.originalSize,
    optimizedSize: optimized.optimizedSize,
    savingsPercent: optimized.savingsPercent,
  };
}
