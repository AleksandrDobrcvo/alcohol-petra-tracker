import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminRequestsClient } from "@/components/admin/AdminRequestsClient";
import { requireSession } from "@/src/server/auth";
import { ApiError } from "@/src/server/errors";

export default async function AdminRequestsPage() {
  let authError: ApiError | null = null;

  try {
    const ctx = await requireSession();
    const allowed =
      ctx.role === "LEADER" || 
      ctx.role === "DEPUTY" || 
      ctx.role === "SENIOR" || 
      ctx.role === "ALCO_STAFF" || 
      ctx.role === "PETRA_STAFF" || 
      ctx.moderatesAlco || 
      ctx.moderatesPetra;
    if (!allowed) {
      throw new ApiError(403, "FORBIDDEN", "Недостатньо прав для перегляду заявок");
    }
  } catch (e) {
    authError = e instanceof ApiError ? e : new ApiError(500, "INTERNAL_ERROR", "Помилка");
  }

  if (authError) {
    return (
      <main className="relative mx-auto flex min-h-[calc(100vh-0px)] max-w-5xl flex-col items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-400/18 blur-3xl" />
          <div className="absolute -right-28 top-24 h-80 w-80 rounded-full bg-amber-400/18 blur-3xl" />
          <div className="absolute left-1/2 top-[55%] h-96 w-96 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <div className="mx-auto w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
            ✅ Заявки
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Доступ обмежено</h1>
          <p className="mt-3 text-sm text-zinc-200/80 sm:text-base">{authError.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 pb-20">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-16 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px] animate-blob" />
        <div className="absolute -right-28 top-24 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10">
        <AdminHeader 
          title="Заявки" 
          subtitle="Перевірка скріншотів та підтвердження виплат" 
        />
        <AdminRequestsClient />
      </div>
    </main>
  );
}
