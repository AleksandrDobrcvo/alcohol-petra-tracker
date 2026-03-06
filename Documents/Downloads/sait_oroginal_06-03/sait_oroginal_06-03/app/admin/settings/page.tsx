import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/authOptions";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");
  
  const role = session.user?.role;
  if (role !== "LEADER" && role !== "DEPUTY") {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <AdminSettingsClient />
    </main>
  );
}
