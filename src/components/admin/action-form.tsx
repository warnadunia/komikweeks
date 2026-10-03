"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useTransition, type ReactNode } from "react";
import { CheckCircle2, Loader2, Trash2, TriangleAlert } from "lucide-react";
import type { FormState } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

export function ActionForm({
  action,
  children,
  submit = "Simpan",
  tone = "acid",
  resetOnSuccess = false,
  className,
  hideSubmit = false,
}: {
  action: Action;
  children: ReactNode;
  submit?: string;
  tone?: "acid" | "paper" | "brand";
  resetOnSuccess?: boolean;
  className?: string;
  hideSubmit?: boolean;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);
  const ref = useRef<HTMLFormElement>(null);
  const lastState = useRef<FormState>(null);

  useEffect(() => {
    if (state && state !== lastState.current) {
      lastState.current = state;
      if (state.ok) {
        if (resetOnSuccess) ref.current?.reset();
        router.refresh();
      }
    }
  }, [state, resetOnSuccess, router]);

  const tones = {
    acid: "border-ink bg-acid text-ink shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000]",
    paper: "border-paper bg-paper text-ink shadow-[3px_3px_0_var(--color-acid)] hover:shadow-[5px_5px_0_var(--color-acid)]",
    brand: "border-ink bg-brand text-paper shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000]",
  };

  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      {!hideSubmit && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 border-3 px-5 py-2.5 font-mono text-xs font-bold tracking-widest uppercase transition-all hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60",
              tones[tone],
            )}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {pending ? "Menyimpan..." : submit}
          </button>
          {state && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 border-2 px-2.5 py-1.5 font-mono text-[11px]",
                state.ok
                  ? "border-acid/60 bg-acid/10 text-acid"
                  : "border-brand/70 bg-brand/10 text-brand",
              )}
            >
              {state.ok ? <CheckCircle2 className="size-3.5" /> : <TriangleAlert className="size-3.5" />}
              {state.message}
            </span>
          )}
        </div>
      )}
    </form>
  );
}

export function DeleteButton({
  action,
  label,
  confirmText = "Yakin hapus item ini? Tindakan tidak bisa dibatalkan.",
}: {
  action: () => Promise<FormState>;
  label?: string;
  confirmText?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) {
          start(async () => {
            await action();
            router.refresh();
          });
        }
      }}
      className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-brand/60 bg-brand/10 px-3 py-2 font-mono text-[10px] font-bold tracking-widest text-brand uppercase transition-all hover:bg-brand hover:text-paper disabled:opacity-50"
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
      {label}
    </button>
  );
}
