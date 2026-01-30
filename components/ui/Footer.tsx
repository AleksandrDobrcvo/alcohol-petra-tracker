"use client";

export default function Footer() {
  return (
    <footer className="footer-animated relative mt-auto py-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          <span className="footer-brand font-medium bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            By Саня Космос
          </span>
          <span className="footer-emoji text-amber-400" aria-hidden>⚡</span>
          <span className="footer-dot text-zinc-400">•</span>
          <span className="footer-message text-zinc-400">
            Made with 💛 for the clan
          </span>
        </div>
        <div className="footer-icons mt-2 flex justify-center gap-4 text-xs text-zinc-600">
          <span className="footer-icon">🍺</span>
          <span className="footer-icon footer-icon-delay-1">🌿</span>
          <span className="footer-icon footer-icon-delay-2">⭐</span>
        </div>
      </div>
    </footer>
  );
}
