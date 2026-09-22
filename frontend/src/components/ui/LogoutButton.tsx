"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { api } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <button className="btn btn-ghost btn-sm gap-1.5" onClick={handleLogout} disabled={isLoggingOut}>
      <LogOut size={15} strokeWidth={2.25} />
      <span className="hidden sm:inline">Log out</span>
    </button>
  );
}
