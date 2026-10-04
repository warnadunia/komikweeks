"use client";

import { BookOpen, CalendarRange, LayoutDashboard, Newspaper, ReceiptText, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Edisi Event", icon: CalendarRange },
  { href: "/admin/series", label: "Seri & Chapter", icon: BookOpen },
  { href: "/admin/posts", label: "Blog & Kabar", icon: Newspaper },
  { href: "/admin/products", label: "Artshop & Merch", icon: ShoppingBag },
  { href: "/admin/purchases", label: "Transaksi Koin", icon: ReceiptText },
];

export function AdminNav({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={cn(horizontal ? "no-scrollbar flex gap-2 overflow-x-auto" : "flex flex-col gap-1.5")}>
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 border-2 px-3.5 py-2.5 font-mono text-[11px] font-bold tracking-widest uppercase transition-all",
              active
                ? "border-ink bg-acid text-ink shadow-[3px_3px_0_#000]"
                : "border-transparent text-paper/55 hover:border-paper/30 hover:text-paper",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
