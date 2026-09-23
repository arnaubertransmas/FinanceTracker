"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Wallet, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LogoutButton } from "./LogoutButton";

export function AppHeader({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const { t } = useLanguage();

  const navLinks = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/activities", label: t("nav.activity"), icon: ArrowLeftRight },
    { href: "/budgets", label: t("nav.budgets"), icon: PiggyBank },
    { href: "/wealth", label: t("nav.wealth"), icon: Wallet },
    ...(isAdmin ? [{ href: "/admin", label: t("nav.admin"), icon: ShieldCheck }] : []),
  ];

  return (
    <header className="navbar bg-base-100 shadow-sm px-4 sticky top-0 z-30">
      <div className="flex-1 flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center">
          <Image src="/logo.png" alt="FinanceTracker" width={1245} height={490} className="h-9 w-auto" priority />
        </Link>
        <nav className="hidden sm:flex gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="btn btn-ghost btn-md gap-1.5 font-normal text-base">
              <link.icon size={18} strokeWidth={2.25} />
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
