import type { Metadata } from "next";
import { KeyRound, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Masuk Admin — COMIC WEEK" };

export default async function AdminLoginPage() {
  const user = await getAdminUser();
  if (user) redirect("/admin");

  return (
    <div className="halftone-dark flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="inline-flex items-center gap-2 border-2 border-acid px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.3em] text-acid uppercase">
            <ShieldCheck className="size-3.5" /> Area Terbatas
          </p>
          <h1 className="mt-4 font-display text-4xl text-paper uppercase sm:text-5xl">
            CW <span className="text-hollow-accent">Admin</span>
          </h1>
          <p className="mt-2 font-mono text-xs tracking-wider text-paper/45 uppercase">
            Ruang redaksi Comic Week
          </p>
        </div>
        <div className="border-3 border-paper bg-ink-soft p-6 shadow-[8px_8px_0_#c9f73a] sm:p-8">
          <LoginForm />
          <div className="mt-6 flex items-start gap-2 border-t-2 border-dashed border-paper/20 pt-4">
            <KeyRound className="mt-0.5 size-3.5 shrink-0 text-paper/40" />
            <p className="font-mono text-[10px] leading-relaxed text-paper/40">
              Akun default pengembangan: <span className="text-acid">admin</span> /{" "}
              <span className="text-acid">comicweek123</span> — dapat diganti lewat env{" "}
              <span className="text-paper/60">ADMIN_USERNAME</span> &{" "}
              <span className="text-paper/60">ADMIN_PASSWORD</span> saat seeding.
            </p>
          </div>
        </div>
        <p className="mt-6 text-center">
          <Link href="/" className="font-mono text-[11px] tracking-widest text-paper/40 uppercase underline-offset-4 hover:text-acid">
            ← Kembali ke situs publik
          </Link>
        </p>
      </div>
    </div>
  );
}
