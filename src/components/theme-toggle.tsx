"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className, showLabel = false }: { className?: string; showLabel?: boolean }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isLight =
      document.documentElement.classList.contains("light") ||
      document.documentElement.getAttribute("data-theme") === "light";
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
      try {
        localStorage.setItem("theme", "light");
      } catch (_) {}
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.setAttribute("data-theme", "dark");
      try {
        localStorage.setItem("theme", "dark");
      } catch (_) {}
    }
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex size-10 items-center justify-center border-2 border-paper/30 bg-ink opacity-60",
          className,
        )}
      />
    );
  }

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isLight ? "Ganti ke Mode Gelap (Dark Mode)" : "Ganti ke Mode Terang (Light Mode)"}
      aria-label="Toggle tema terang dan gelap"
      className={cn(
        "group relative flex cursor-pointer items-center gap-2 border-2 border-paper px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase transition-all duration-200 hover:-translate-y-0.5",
        isLight
          ? "bg-paper text-ink shadow-[2px_2px_0_#121218] hover:shadow-[4px_4px_0_#121218]"
          : "bg-ink text-paper shadow-[2px_2px_0_#c9f73a] hover:shadow-[4px_4px_0_#c9f73a]",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        {isLight ? (
          <Sun className="size-4 text-brand animate-spin-slow transition-transform group-hover:rotate-45" />
        ) : (
          <Moon className="size-4 text-acid transition-transform group-hover:-rotate-12" />
        )}
      </div>

      {showLabel ? (
        <span className="tracking-widest">
          {isLight ? "Light Mode" : "Dark Mode"}
        </span>
      ) : (
        <span className="hidden sm:inline font-mono text-[10px] tracking-widest">
          {isLight ? "LIGHT" : "DARK"}
        </span>
      )}
    </button>
  );
}
