import Link from "next/link";
import { requireSession } from "@/src/server/auth";
import { assertOwner } from "@/src/server/rbac";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";

export default async function AdminUsersPage() {
  const ctx = await requireSession();
  assertOwner(ctx);

  return (
    <main className="relative mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-400/18 blur-3xl" />
        <div className="absolute -right-28 top-24 h-80 w-80 rounded-full bg-amber-400/18 blur-3xl" />
        <div className="absolute left-1/2 top-[55%] h-96 w-96 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-20 hidden w-[220px] select-none sm:block md:w-[280px]">
          <img className="float-petra opacity-90" src="/petra.png" alt="Петра" draggable={false} />
        </div>
        <div className="absolute right-0 top-28 hidden w-[220px] select-none sm:block md:w-[280px]">
          <img className="float-alco opacity-90" src="/alco.png" alt="Алко" draggable={false} />
        </div>
      </div>

      <div className="relative z-10">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">🛠️ Адмінка: користувачі</h1>
          <div className="flex items-center gap-3 text-sm">
            <Link className="text-zinc-300 hover:text-zinc-100" href="/entries">
              📒 Записи
            </Link>
            <Link className="text-zinc-300 hover:text-zinc-100" href="/">
              🏠 Головна
            </Link>
          </div>
        </header>
        <AdminUsersClient />
      </div>
    </main>
  );
}

