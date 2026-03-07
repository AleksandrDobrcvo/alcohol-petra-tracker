"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function mapNextAuthError(errorCode: string | null): string | null {
  if (!errorCode) return null;
  switch (errorCode) {
    case "OAuthCallback":
      return "Не удалось завершить OAuth-поток. Проверьте Redirect URI в Discord Developer Portal.";
    case "AccessDenied":
      return "Отказано в доступе (вы могли отменить авторизацию).";
    case "Configuration":
      return "Ошибка конфигурации (проверьте DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET и NEXTAUTH_URL).";
    case "Verification":
      return "Не удалось проверить сессию. Попробуйте очистить cookies и повторить попытку.";
    case "Callback":
      return "Ошибка на сервере при обработке авторизации. Проверьте логи сервера.";
    default:
      return `Ошибка входа: ${errorCode}`;
  }
}

function SignInContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const { data: session, status } = useSession();
  const didRedirect = useRef(false);
  const redirectAttempts = useRef(0);

  const urlError = searchParams.get("error");

  useEffect(() => {
    if (urlError) {
      const mappedError = mapNextAuthError(urlError);
      setError(mappedError || `OAuth error: ${urlError}`);
      setDebugInfo(`Error code: ${urlError}`);
    }
  }, [urlError]);

  useEffect(() => {
    console.log("📍 SignIn page - status:", status, "session:", !!session);
    
    if (status === "loading") return;
    
    if (session) {
      console.log("✅ User is authenticated, redirecting to home");
      window.location.href = "/";
      return;
    }
    
    if (status === "unauthenticated" && !didRedirect.current) {
      redirectAttempts.current++;
      
      // Prevent infinite redirect loop
      if (redirectAttempts.current > 1) {
        console.error("❌ Too many redirect attempts, stopping");
        setError("Infinite redirect detected. Please clear cookies and try again.");
        setDebugInfo(`Redirect attempts: ${redirectAttempts.current}`);
        return;
      }
      
      didRedirect.current = true;
      console.log("🔐 Starting Discord signin...");
      
      signIn("discord", { callbackUrl: "/", redirect: true }).catch((e) => {
        console.error("❌ SignIn error:", e);
        setError(e instanceof Error ? e.message : "Unknown error during signin");
        didRedirect.current = false;
      });
    }
  }, [session, status]);

  const handleSignIn = () => {
    setError(null);
    setDebugInfo("Connecting to Discord...");
    redirectAttempts.current = 0;
    didRedirect.current = false;
    
    signIn("discord", { callbackUrl: "/", redirect: true }).catch((e) => {
      console.error("❌ Manual signin error:", e);
      setError(e instanceof Error ? e.message : "Unknown error");
    });
  };

  const handleClearCookies = async () => {
    setError(null);
    setDebugInfo("Clearing cookies...");
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    setDebugInfo("Cookies cleared. Refreshing page...");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-0px)] max-w-4xl flex-col items-center justify-center px-6 py-12 text-center">
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

      <div className="relative z-10 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="mx-auto w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
          🚀 Авторизація
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Відкриваємо Discord...
        </h1>
        <p className="mt-3 text-sm text-zinc-200/80 sm:text-base">
          {status === "loading" ? "Перевіряємо сесію..." : "Якщо нічого не відбулось — натисни кнопку нижче."}
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-left">
            <p className="text-sm font-medium text-red-400">⚠️ Помилка:</p>
            <p className="mt-1 text-sm text-red-300">{error}</p>
            {debugInfo && (
              <p className="mt-2 text-xs text-red-200/60">{debugInfo}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={handleSignIn}
            disabled={status === "loading"}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            🔁 Повторити вхід
          </button>
          
          {error && (
            <button
              onClick={handleClearCookies}
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-medium text-white hover:bg-orange-400"
            >
              🗑️ Очистити cookies
            </button>
          )}
          
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            href="/"
          >
            🏠 На головну
          </Link>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-left">
            <p className="text-sm font-medium text-red-400">⚠️ Помилка:</p>
            <p className="mt-1 text-sm text-red-300">{error}</p>
            {debugInfo && (
              <p className="mt-2 text-xs text-red-200/60">{debugInfo}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function SignInPageSkeleton() {
  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-0px)] max-w-4xl flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative z-10 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-tight">Загружаємо...</h1>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInPageSkeleton />}>
      <SignInContent />
    </Suspense>
  );
}
