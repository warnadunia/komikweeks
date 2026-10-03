import { cookies } from "next/headers";

export const VISITOR_COOKIE = "cw_visitor";

/** Read-only: returns the visitor key if the cookie exists. */
export async function getVisitorKey(): Promise<string | null> {
  const store = await cookies();
  return store.get(VISITOR_COOKIE)?.value ?? null;
}
