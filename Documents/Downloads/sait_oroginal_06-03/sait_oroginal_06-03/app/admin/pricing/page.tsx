import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminPricingClient } from "@/components/admin/AdminPricingClient";

export default async function AdminPricingPage() {
  const ctx = await requireSession();
  assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

  return (
    <main className="relative mx-auto flex max-w-7xl flex-col px-6 py-10 pb-20">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-16 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px] animate-blob" />
        <div className="absolute -right-28 top-24 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10">
        <AdminHeader 
          title="Ціни" 
          subtitle="Налаштування виплат за зірки Алко та Петри" 
        />
        <AdminPricingClient />
      </div>
    </main>
  );
}
