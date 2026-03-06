import Link from "next/link";

async function getData(token: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/public/${token}/entries`, {
    cache: "no-store",
  });
  return (await res.json()) as { ok: boolean; data?: { entries: any[] }; error?: { message: string } };
}

export default async function PublicTokenPage({ params }: { params: { token: string } }) {
  const json = await getData(params.token);

  if (!json.ok) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-300">
          Ссылка недействительна или отозвана.
        </div>
      </main>
    );
  }

  const entries = json.data?.entries ?? [];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 pb-20">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Публичный просмотр</h1>
        <Link className="text-sm text-zinc-300 hover:text-zinc-100" href="/">
          На главную
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-900/60 text-zinc-300">
            <tr>
              <th className="px-3 py-2">Дата</th>
              <th className="px-3 py-2">Кто</th>
              <th className="px-3 py-2">Тип</th>
              <th className="px-3 py-2">⭐</th>
              <th className="px-3 py-2">Кол-во</th>
              <th className="px-3 py-2">Сумма</th>
              <th className="px-3 py-2">Выплата</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e: any) => (
              <tr key={e.id} className="border-t border-zinc-800">
                <td className="px-3 py-2 text-zinc-200">
                  {new Date(e.date).toLocaleString("ru-RU")}
                </td>
                <td className="px-3 py-2 text-zinc-200">{e.submitter?.name ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-200">{e.type === "ALCO" ? "Алко" : "Петра"}</td>
                <td className="px-3 py-2 text-zinc-200">{e.stars}</td>
                <td className="px-3 py-2 text-zinc-200">{e.quantity}</td>
                <td className="px-3 py-2 text-zinc-200">{e.amount}</td>
                <td className="px-3 py-2 text-zinc-200">{e.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

