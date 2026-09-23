"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } finally {
      queryClient.clear();
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <button className="btn btn-ghost btn-sm gap-1.5" onClick={handleLogout} disabled={isLoggingOut}>
      <LogOut size={15} strokeWidth={2.25} />
      <span className="hidden sm:inline">{t("common.signOut")}</span>
    </button>
  );
}
