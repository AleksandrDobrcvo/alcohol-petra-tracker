"use client";

import { useState } from "react";

export default function SeedOwnerPage() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function seed() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/dev/seed-owner", { method: "POST" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      setMessage(`✅ ${json.message}`);
    } catch (e) {
      setMessage(`❌ ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-12">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur text-center">
        <h1 className="text-2xl font-semibold mb-4">🛠️ Створити Dev Owner</h1>
        <p className="text-sm text-zinc-200/80 mb-6">
          Ця сторінка створить OWNER-акаунт для локальної розробки (тільки в dev-режимі).
        </p>
        <button
          onClick={seed}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {loading ? "Створення..." : "🚀 Створити OWNER"}
        </button>
        {message && (
          <div className="mt-4 text-sm text-zinc-200 whitespace-pre-wrap">{message}</div>
        )}
      </div>
    </main>
  );
}
