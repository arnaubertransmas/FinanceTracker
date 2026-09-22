import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/serverApi";
import { AdminUsersView } from "./AdminUsersView";

export default async function AdminPage() {
  const user = await getSessionUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <AdminUsersView />;
}
