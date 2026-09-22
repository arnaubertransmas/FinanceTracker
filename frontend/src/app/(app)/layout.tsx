import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Tags, PiggyBank, Wallet } from "lucide-react";
import { getSessionUser } from "@/lib/serverApi";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { BottomDock } from "@/components/ui/BottomDock";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/activities", label: "Activity", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/categories", label: "Categories", icon: Tags },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="navbar bg-base-100 shadow-sm px-4 sticky top-0 z-30">
        <div className="flex-1 flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 text-primary">
              <Wallet size={18} strokeWidth={2.25} />
            </span>
            FinanceTracker
          </Link>
          <nav className="hidden sm:flex gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="btn btn-ghost btn-sm gap-1.5 font-normal"
              >
                <link.icon size={15} strokeWidth={2.25} />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm opacity-70">{user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 p-4 pb-24 max-w-full">{children}</main>
      <BottomDock />
    </div>
  );
}
