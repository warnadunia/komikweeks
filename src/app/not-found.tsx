import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="halftone-dark flex min-h-screen flex-col items-center justify-center bg-ink px-4 text-center">
      <p className="font-marker text-2xl text-acid">panel ini sengaja dikosongkan...</p>
      <h1 className="mt-4 font-display text-[10rem] leading-[0.8] text-hollow uppercase sm:text-[14rem]">404</h1>
      <p className="mt-6 max-w-sm font-mono text-xs leading-relaxed tracking-[0.25em] text-paper/50 uppercase">
        Halaman yang kamu cari belum digambar — atau microsite edisi itu belum dipublikasikan.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 border-3 border-ink bg-acid px-6 py-4 font-display text-sm tracking-wide text-ink uppercase shadow-[6px_6px_0_#f5f1e8] transition-all hover:-translate-y-1 hover:shadow-[9px_9px_0_#f5f1e8]"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Hub
      </Link>
    </div>
  );
}
