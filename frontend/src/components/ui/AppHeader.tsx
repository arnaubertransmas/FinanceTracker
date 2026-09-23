"use client";

import Link from "next/link";
import { LayoutDashboard, ArrowLeftRight, PiggyBank, TrendingUp, Wallet, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LogoutButton } from "./LogoutButton";

export function AppHeader({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const { t } = useLanguage();

  const navLinks = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/activities", label: t("nav.activity"), icon: ArrowLeftRight },
    { href: "/budgets", label: t("nav.budgets"), icon: PiggyBank },
    { href: "/investing", label: t("nav.investing"), icon: TrendingUp },
    ...(isAdmin ? [{ href: "/admin", label: t("nav.admin"), icon: ShieldCheck }] : []),
  ];

  return (
    <header className="navbar bg-base-100 shadow-sm px-4 sticky top-0 z-30">
      <div className="flex-1 flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 text-primary">
            <Wallet size={18} strokeWidth={2.25} />
          </span>
          FinanceTracker
        </Link>
        <nav className="hidden sm:flex gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="btn btn-ghost btn-sm gap-1.5 font-normal">
              <link.icon size={15} strokeWidth={2.25} />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-sm opacity-70">{email}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
