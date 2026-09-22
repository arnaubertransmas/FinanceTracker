"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Tags, MoreHorizontal, Plus } from "lucide-react";
import { AddModal, type AddTab } from "@/components/add/AddModal";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Activity", icon: ArrowLeftRight },
];

const MORE_ITEMS = [{ href: "/categories", label: "Categories", icon: Tags }];

export function BottomDock() {
  const pathname = usePathname();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addTab, setAddTab] = useState<AddTab>("transaction");

  function openAdd(tab: AddTab) {
    setAddTab(tab);
    setIsAddOpen(true);
  }

  return (
    <>
      <div className="dock sm:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} aria-current={active} className={active ? "dock-active" : ""}>
              <Icon size={20} strokeWidth={2} />
              <span className="dock-label">{item.label}</span>
            </Link>
          );
        })}

        <button type="button" onClick={() => openAdd("transaction")} aria-label="Add">
          <span className="btn btn-primary btn-circle -mt-8 shadow-lg">
            <Plus size={24} />
          </span>
        </button>

        <Link
          href="/budgets"
          aria-current={pathname === "/budgets"}
          className={pathname === "/budgets" ? "dock-active" : ""}
        >
          <PiggyBank size={20} strokeWidth={2} />
          <span className="dock-label">Budgets</span>
        </Link>

        <div className="dropdown dropdown-top dropdown-end">
          <div tabIndex={0} role="button" className="w-full h-full flex flex-col items-center justify-center gap-px">
            <MoreHorizontal size={20} strokeWidth={2} />
            <span className="dock-label">More</span>
          </div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-50 w-48 p-2 shadow-lg mb-2">
            {MORE_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <item.icon size={16} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        aria-label="Add"
        onClick={() => openAdd("transaction")}
        className="hidden sm:inline-flex btn btn-primary btn-circle fixed bottom-6 right-6 h-16 w-16 shadow-lg z-40"
      >
        <Plus size={28} />
      </button>

      <AddModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} initialTab={addTab} />
    </>
  );
}
