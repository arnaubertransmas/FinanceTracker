"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Tags, Plus } from "lucide-react";
import { AddModal, type AddTab } from "@/components/add/AddModal";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/activities", label: "Activity", icon: ArrowLeftRight },
];

const RIGHT_NAV_ITEMS = [
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/categories", label: "Categories", icon: Tags },
];

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

        {RIGHT_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} aria-current={active} className={active ? "dock-active" : ""}>
              <Icon size={20} strokeWidth={2} />
              <span className="dock-label">{item.label}</span>
            </Link>
          );
        })}
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
