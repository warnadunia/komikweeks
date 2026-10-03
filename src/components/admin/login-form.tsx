"use client";

import { Loader2, LogIn, TriangleAlert } from "lucide-react";
import { useActionState } from "react";
import { loginAdmin, type FormState } from "@/lib/admin-actions";
import { Field, inputCls } from "@/components/admin/fields";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(loginAdmin, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field label="Username">
        <input
          name="username"
          required
          autoComplete="username"
          placeholder="admin"
          className={inputCls}
        />
      </Field>
      <Field label="Password">
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••••••"
          className={inputCls}
        />
      </Field>
      {state && !state.ok && (
        <p className="flex items-center gap-2 border-2 border-brand bg-brand/10 px-3 py-2.5 font-mono text-xs text-brand">
          <TriangleAlert className="size-4 shrink-0" />
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex cursor-pointer items-center justify-center gap-2 border-3 border-ink bg-acid px-5 py-3.5 font-display text-sm tracking-wide text-ink uppercase shadow-[5px_5px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#000] disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        {pending ? "Memeriksa..." : "Masuk Redaksi"}
      </button>
    </form>
  );
}
