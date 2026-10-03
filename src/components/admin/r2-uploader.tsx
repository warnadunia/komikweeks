"use client";

import { CheckCircle2, CloudUpload, FileImage, Loader2, Sparkles, X } from "lucide-react";
import { useRef, useState } from "react";
import { formatBytes, uploadDirectToR2, type UploadSuccessResult } from "@/lib/image-optimizer";

export interface R2UploaderProps {
  folder: "covers" | "chapters" | "events" | "strips";
  seriesSlug?: string;
  chapterNumber?: number;
  label?: string;
  multiple?: boolean;
  onSuccess: (results: UploadSuccessResult[]) => void;
  className?: string;
}

interface UploadQueueItem {
  id: string;
  file: File;
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
  result?: UploadSuccessResult;
  error?: string;
}

export function R2Uploader({
  folder,
  seriesSlug,
  chapterNumber,
  label = "Unggah Gambar ke Cloudflare R2 (Otomatis WebP 80%)",
  multiple = false,
  onSuccess,
  className = "",
}: R2UploaderProps) {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    const newItems: UploadQueueItem[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      progress: 0,
      status: "idle",
    }));

    setQueue((prev) => (multiple ? [...prev, ...newItems] : newItems));
    setIsProcessing(true);

    const uploadedResults: UploadSuccessResult[] = [];

    for (const item of newItems) {
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading", progress: 5 } : q)),
      );

      try {
        const result = await uploadDirectToR2({
          file: item.file,
          folder,
          seriesSlug,
          chapterNumber,
          quality: 0.8,
          onProgress: (percent) => {
            setQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, progress: percent } : q)),
            );
          },
        });

        uploadedResults.push(result);

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "done", progress: 100, result } : q,
          ),
        );
      } catch (err) {
        const errorMsg = (err as Error).message || "Upload gagal";
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: "error", error: errorMsg } : q)),
        );
      }
    }

    setIsProcessing(false);
    if (uploadedResults.length > 0) {
      onSuccess(uploadedResults);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
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
            processFiles(Array.from(e.dataTransfer.files));
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
          Klik atau seret gambar ke sini • Otomatis WebP 80% (Bypass Limit 4.5MB Vercel)
        </p>

        <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-acid/90">
          <Sparkles className="size-3" />
          <span>Cache-Control: public, max-age=31536000, immutable</span>
        </div>
      </div>

      {/* Queue & Progress List */}
      {queue.length > 0 && (
        <div className="flex flex-col gap-2">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-1.5 border border-paper/20 bg-ink p-3 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <FileImage className="size-4 shrink-0 text-paper/60" />
                  <span className="truncate font-mono font-medium text-paper">
                    {item.file.name}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-paper/40">
                    ({formatBytes(item.file.size)})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === "uploading" && (
                    <span className="font-mono text-[11px] font-bold text-acid">
                      {item.progress}%
                    </span>
                  )}
                  {item.status === "done" && item.result && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-acid">
                      <CheckCircle2 className="size-3.5" />
                      Hemat {item.result.savingsPercent}% ({formatBytes(item.result.optimizedSize)})
                    </span>
                  )}
                  {item.status === "error" && (
                    <span className="font-mono text-[10px] text-red-400 truncate max-w-48">
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

              {/* Progress bar */}
              {item.status === "uploading" && (
                <div className="h-1.5 w-full overflow-hidden bg-paper/10">
                  <div
                    className="h-full bg-acid transition-all duration-200"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
