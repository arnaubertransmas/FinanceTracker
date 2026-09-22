import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export interface SessionUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    return null;
  }

  const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as { user: SessionUser };
  return data.user;
}
