import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ExternalLink, LogOut, SquarePen } from "lucide-react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { logoutAdmin } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin — COMIC WEEK", template: "%s — CW Admin" },
  robots: { index: false },
};

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-ink lg:grid lg:grid-cols-[250px_1fr]">
      {/* sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r-3 border-paper/20 bg-ink-soft lg:flex">
        <Link href="/admin" className="flex items-center gap-3 border-b-2 border-paper/15 px-5 py-5">
          <div className="relative size-10 overflow-hidden border-2 border-paper bg-white shadow-[3px_3px_0_#f5f1e8] shrink-0">
            <img src="/logo.png" alt="KomikWeeks Logo" className="size-full object-contain" />
          </div>
          <span className="leading-none">
            <span className="block font-display text-sm text-paper">KOMIKWEEKS</span>
            <span className="mt-1 block font-mono text-[9px] tracking-[0.2em] text-paper/50 uppercase">
              Yogyakarta Komik Weeks
            </span>
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNav />
        </div>
        <div className="border-t-2 border-paper/15 p-3">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <span className="flex size-8 items-center justify-center border-2 border-paper bg-paper font-display text-xs text-ink">
              {(user.displayName ?? user.username).slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-bold text-paper">{user.displayName ?? user.username}</p>
              <p className="font-mono text-[9px] tracking-widest text-paper/40 uppercase">
                <SquarePen className="mr-1 inline size-2.5" />
                Editor
              </p>
            </div>
            <form action={logoutAdmin}>
              <button
                title="Keluar"
                className="flex size-8 cursor-pointer items-center justify-center border-2 border-paper/25 text-paper/60 transition-colors hover:border-brand hover:text-brand"
              >
                <LogOut className="size-3.5" />
              </button>
            </form>
          </div>
          <Link
            href="/"
            className="mt-2 flex items-center justify-center gap-2 border-2 border-paper/25 px-3 py-2.5 font-mono text-[10px] font-bold tracking-widest text-paper/60 uppercase transition-colors hover:border-acid hover:text-acid"
          >
            <ExternalLink className="size-3.5" /> Lihat Situs Publik
          </Link>
        </div>
      </aside>

      {/* header mobile */}
      <div className="sticky top-0 z-40 border-b-3 border-paper bg-ink/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center border-2 border-paper bg-acid font-display text-xs text-ink">
              CW
            </span>
            <span className="font-display text-sm text-paper">REDAKSI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex size-9 items-center justify-center border-2 border-paper/30 text-paper/60">
              <ExternalLink className="size-4" />
            </Link>
            <form action={logoutAdmin}>
              <button className="flex size-9 cursor-pointer items-center justify-center border-2 border-brand/60 text-brand">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
        <div className="border-t-2 border-paper/10 px-3 py-2">
          <AdminNav horizontal />
        </div>
      </div>

      <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
