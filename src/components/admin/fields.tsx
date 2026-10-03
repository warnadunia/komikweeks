import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputCls =
  "w-full border-2 border-paper/25 bg-ink px-3 py-2.5 font-mono text-sm text-paper outline-none transition-colors placeholder:text-paper/30 focus:border-acid";

export const labelCls =
  "mb-1.5 block font-mono text-[10px] font-bold tracking-[0.2em] text-paper/50 uppercase";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className={labelCls}>{label}</span>
      {children}
      {hint && <p className="mt-1 font-mono text-[10px] leading-relaxed text-paper/35">{hint}</p>}
    </div>
  );
}

export function CheckRow({
  name,
  label,
  defaultChecked,
  accent = "acid",
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  accent?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 border-2 border-paper/25 bg-ink px-3 py-2.5 transition-colors has-checked:border-acid">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className={cn(
          "size-4 shrink-0 cursor-pointer appearance-none border-2 border-paper/50 bg-ink transition-colors checked:bg-acid",
          accent === "brand" && "checked:bg-brand",
        )}
      />
      <span className="font-mono text-xs font-bold tracking-wider text-paper/80 uppercase">{label}</span>
    </label>
  );
}

export function SectionCard({
  title,
  desc,
  actions,
  children,
  accent = "#C9F73A",
}: {
  title: string;
  desc?: string;
  actions?: ReactNode;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <section className="border-3 border-paper/20 bg-ink-soft">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-paper/15 px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-display text-lg text-paper uppercase">
            <span className="mr-2 inline-block size-2.5" style={{ backgroundColor: accent }} />
            {title}
          </h2>
          {desc && <p className="mt-1 font-mono text-[10px] tracking-wider text-paper/45 uppercase">{desc}</p>}
        </div>
        {actions}
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    upcoming: { label: "Segera", cls: "border-sky/70 bg-sky/10 text-sky" },
    live: { label: "Live", cls: "border-brand/70 bg-brand/10 text-brand" },
    ended: { label: "Selesai", cls: "border-paper/30 bg-paper/5 text-paper/50" },
    ongoing: { label: "Berjalan", cls: "border-acid/70 bg-acid/10 text-acid" },
    completed: { label: "Tamat", cls: "border-vio/70 bg-vio/10 text-vio" },
  };
  const s = map[status] ?? { label: status, cls: "border-paper/30 text-paper/50" };
  return (
    <span className={cn("border-2 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase", s.cls)}>
      {s.label}
    </span>
  );
}
