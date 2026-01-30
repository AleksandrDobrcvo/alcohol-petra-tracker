import Link from "next/link";
import { requireSession } from "@/src/server/auth";
import { assertOwner } from "@/src/server/rbac";
import { AdminPublicLinkClient } from "@/components/admin/AdminPublicLinkClient";

export default async function AdminPublicLinkPage() {
  const ctx = await requireSession();
  assertOwner(ctx);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Админка: публичная ссылка</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link className="text-zinc-300 hover:text-zinc-100" href="/admin/users">
            Пользователи
          </Link>
          <Link className="text-zinc-300 hover:text-zinc-100" href="/admin/audit">
            Логи
          </Link>
        </div>
      </header>
      <AdminPublicLinkClient />
    </main>
  );
}

