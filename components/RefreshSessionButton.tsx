"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { RefreshCw } from "lucide-react";

export default function RefreshSessionButton() {
  const { update, data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Only show for unapproved users
  if (!session || session.user?.isApproved) {
    return null;
  }

  const handleRefresh = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await update(); // This triggers jwt callback with trigger="update"
      // Force page reload to get fresh server-side session
      window.location.reload();
    } catch (e) {
      setMessage("Помилка оновлення. Спробуй ще раз.");
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/30 transition-all disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? "Оновлюю..." : "🔄 Оновити статус"}
      </button>
      <p className="text-xs text-zinc-500">
        Натисни після підтвердження адміном
      </p>
      {message && (
        <p className="text-xs text-red-400">{message}</p>
      )}
    </div>
  );
}
