import { cn } from "@/lib/utils";

export function Marquee({
  items,
  className,
  fast = false,
  separator = "✦",
}: {
  items: string[];
  className?: string;
  fast?: boolean;
  separator?: string;
}) {
  const row = (
    <>
      {items.map((item, i) => (
        <span key={i} className="mx-6 inline-flex items-center gap-6 whitespace-nowrap">
          <span>{item}</span>
          <span aria-hidden>{separator}</span>
        </span>
      ))}
    </>
  );
  return (
    <div className={cn("relative flex w-full overflow-hidden py-3 font-mono text-sm font-bold tracking-[0.2em] uppercase", className)}>
      <div className={cn("flex w-max shrink-0 items-center", fast ? "animate-marquee-fast" : "animate-marquee")}>
        <div className="flex items-center">{row}</div>
        <div className="flex items-center" aria-hidden>{row}</div>
      </div>
    </div>
  );
}
