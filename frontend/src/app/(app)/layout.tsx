import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/serverApi";
import { AppHeader } from "@/components/ui/AppHeader";
import { BottomDock } from "@/components/ui/BottomDock";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <AppHeader email={user.email} isAdmin={user.role === "ADMIN"} />
      <main className="flex-1 p-4 pb-24 max-w-full">{children}</main>
      <BottomDock />
    </div>
  );
}
