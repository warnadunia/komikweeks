import { BookOpen, CalendarDays, Menu, Newspaper, X } from "lucide-react";
import Link from "next/link";
import { getFeaturedEvent, getWallet } from "@/lib/queries";
import { getVisitorKey } from "@/lib/visitor";
import { ClaimWelcomeButton, WalletBadge } from "@/components/wallet-client";
import { NavMenuButton } from "@/components/nav-menu";

export function ComicWeekLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-2">
      <span className="flex size-9 items-center justify-center border-3 border-paper bg-acid font-display text-base text-ink shadow-[3px_3px_0_#f5f1e8] transition-transform group-hover:-rotate-6">
        CW
      </span>
      <span className="hidden flex-col leading-none sm:flex">
        <span className="font-display text-sm tracking-wide text-paper">COMIC WEEK</span>
        <span className="font-mono text-[9px] tracking-[0.3em] text-paper/60">FESTIVAL KOMIK TAHUNAN</span>
      </span>
    </Link>
  );
}

export async function SiteNav() {
  const [featured, visitorKey] = await Promise.all([getFeaturedEvent(), getVisitorKey()]);
  const wallet = visitorKey ? await getWallet(visitorKey) : null;

  const links = [
    { href: "/comics", label: "Baca Komik", icon: BookOpen },
    { href: "/blog", label: "Kabar", icon: Newspaper },
    ...(featured
      ? [{ href: `/events/${featured.slug}`, label: featured.name, icon: CalendarDays }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b-3 border-paper/90 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <ComicWeekLogo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group inline-flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold tracking-[0.15em] text-paper/80 uppercase transition-colors hover:text-acid"
            >
              <l.icon className="size-4 transition-transform group-hover:-translate-y-0.5" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {wallet && Number(wallet.coins) > 0 ? (
            <Link href="/comics">
              <WalletBadge coins={wallet.coins} />
            </Link>
          ) : (
            <ClaimWelcomeButton
              label="Klaim 100 Koin"
              className="hidden cursor-pointer items-center gap-2 border-2 border-ink bg-acid px-3 py-1.5 font-mono text-[11px] font-bold tracking-widest text-ink uppercase shadow-[3px_3px_0_#f5f1e8] transition-transform hover:-translate-y-0.5 sm:inline-flex"
            />
          )}
          <NavMenuButton links={links.map(({ href, label }) => ({ href, label }))} />
        </div>
      </div>
    </header>
  );
}
