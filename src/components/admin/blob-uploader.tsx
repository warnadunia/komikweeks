"use client";

import { CheckCircle2, CloudUpload, FileImage, Loader2, Sparkles, X } from "lucide-react";
import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

export interface BlobUploadResult {
  url: string;
  filename: string;
  width: number;
  height: number;
  aspectRatio: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
}

export interface BlobUploaderProps {
  folder: "comics" | "covers" | "events";
  seriesSlug?: string;
  chapterNumber?: number;
  label?: string;
  multiple?: boolean;
  onSuccess: (results: BlobUploadResult[]) => void;
  className?: string;
}

interface UploadQueueItem {
  id: string;
  file: File;
  progressText: string;
  status: "idle" | "compressing" | "uploading" | "done" | "error";
  result?: BlobUploadResult;
  error?: string;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function getImageDimensions(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 1200, height: 1600 });
    };
    img.src = url;
  });
}

export function BlobUploader({
  folder,
  seriesSlug = "series",
  chapterNumber = 1,
  label = "Upload ke Vercel Blob (Client Upload + WebP 80%)",
  multiple = true,
  onSuccess,
  className = "",
}: BlobUploaderProps) {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalStatus, setGlobalStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processBatchUpload = async (fileList: File[]) => {
    if (fileList.length === 0) return;

    // 1. Urutkan file secara natural numeric (01, 02, 10)
    const sortedFiles = Array.from(fileList).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }),
    );

    const newItems: UploadQueueItem[] = sortedFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      progressText: "Menunggu antrean...",
      status: "idle",
    }));

    setQueue((prev) => (multiple ? [...prev, ...newItems] : newItems));
    setIsProcessing(true);

    const compressionOptions = {
      maxWidthOrHeight: 1400, // Resolusi ideal untuk komik smartphone & desktop
      maxSizeMB: 0.3, // Target ~300 KB
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.8, // 80% WebP
    };

    const uploadedResults: BlobUploadResult[] = [];

    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      const pageIndex = i + 1;

      // Update status: mengompresi
      setGlobalStatus(`Mengompresi halaman ${pageIndex} dari ${newItems.length}...`);
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: "compressing", progressText: "Mengompresi ke WebP 80%..." } : q,
        ),
      );

      try {
        // 2. Kompresi gambar di browser pengguna
        const imageCompression = (await import("browser-image-compression")).default;
        const compressedFile = await imageCompression(item.file, compressionOptions);

        // Ambil dimensi asli untuk kalkulasi aspek rasio komik
        const { width, height } = await getImageDimensions(compressedFile);
        const aspectRatio = `${width}/${height}`;

        // Update status: mengunggah ke Vercel Blob
        setGlobalStatus(`Mengunggah halaman ${pageIndex} dari ${newItems.length} ke Vercel Blob...`);
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "uploading", progressText: "Mengunggah langsung ke Vercel Blob..." } : q,
          ),
        );

        // Buat pathname yang teratur
        const baseName = item.file.name.substring(0, item.file.name.lastIndexOf(".")) || `page-${pageIndex}`;
        const sanitizedName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_");
        const pathname =
          folder === "comics"
            ? `comics/${seriesSlug}/ch-${chapterNumber}/${pageIndex.toString().padStart(2, "0")}_${sanitizedName}.webp`
            : `${folder}/${seriesSlug}/${Date.now()}_${sanitizedName}.webp`;

        // 3. Upload langsung dari browser ke Vercel Blob (Bypass limit 4.5 MB Vercel)
        const newBlob = await upload(pathname, compressedFile, {
          access: "public",
          handleUploadUrl: "/api/upload-comic",
        });

        const originalSize = item.file.size;
        const compressedSize = compressedFile.size;
        const savingsPercent = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

        const result: BlobUploadResult = {
          url: newBlob.url,
          filename: item.file.name,
          width,
          height,
          aspectRatio,
          originalSize,
          compressedSize,
          savingsPercent,
        };

        uploadedResults.push(result);

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: "done",
                  progressText: `Selesai (-${savingsPercent}%)`,
                  result,
                }
              : q,
          ),
        );
      } catch (err) {
        console.error("Gagal mengunggah item:", err);
        const errorMsg = (err as Error).message || "Upload gagal";
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "error", error: errorMsg, progressText: "Gagal" } : q,
          ),
        );
      }
    }

    setGlobalStatus(
      uploadedResults.length > 0
        ? `Sukses mengunggah ${uploadedResults.length} halaman ke Vercel Blob!`
        : "",
    );
    setIsProcessing(false);

    if (uploadedResults.length > 0) {
      onSuccess(uploadedResults);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processBatchUpload(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            processBatchUpload(Array.from(e.dataTransfer.files));
          }
        }}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-6 text-center transition-all ${
          isDragging
            ? "border-acid bg-acid/10"
            : "border-paper/30 bg-ink-soft/80 hover:border-acid hover:bg-ink-soft"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="flex size-12 items-center justify-center rounded-full border-2 border-paper/20 bg-ink transition-transform group-hover:scale-105 group-hover:border-acid">
          {isProcessing ? (
            <Loader2 className="size-6 animate-spin text-acid" />
          ) : (
            <CloudUpload className="size-6 text-paper/70 group-hover:text-acid" />
          )}
        </div>

        <p className="mt-3 font-display text-sm tracking-wide text-paper uppercase group-hover:text-acid">
          {label}
        </p>

        <p className="mt-1 font-mono text-[11px] text-paper/50">
          Klik atau seret file ke sini • Otomatis sort angka (01, 02) & WebP 80% (Bypass Limit 4.5MB Vercel)
        </p>

        <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-acid/90">
          <Sparkles className="size-3" />
          <span>Vercel Blob Client Upload • Edge Global CDN Cache</span>
        </div>
      </div>

      {globalStatus && (
        <div className="border border-acid/30 bg-acid/10 px-3 py-2 font-mono text-xs text-acid">
          {globalStatus}
        </div>
      )}

      {/* Queue items */}
      {queue.length > 0 && (
        <div className="flex max-h-60 flex-col gap-1.5 overflow-y-auto pr-1">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 border border-paper/15 bg-ink p-2 text-xs"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileImage className="size-3.5 shrink-0 text-paper/50" />
                <span className="truncate font-mono font-medium text-paper">
                  {item.file.name}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-paper/40">
                  ({formatBytes(item.file.size)})
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {item.status === "compressing" && (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-sky-400">
                    <Loader2 className="size-3 animate-spin" /> Kompresi...
                  </span>
                )}
                {item.status === "uploading" && (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-acid">
                    <Loader2 className="size-3 animate-spin" /> Mengunggah...
                  </span>
                )}
                {item.status === "done" && item.result && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-acid">
                    <CheckCircle2 className="size-3.5" />
                    Hemat {item.result.savingsPercent}% ({formatBytes(item.result.compressedSize)})
                  </span>
                )}
                {item.status === "error" && (
                  <span className="font-mono text-[10px] text-red-400 truncate max-w-40">
                    {item.error}
                  </span>
                )}
                {!isProcessing && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="cursor-pointer text-paper/40 hover:text-paper"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
