"use client";

export default function FastFooter() {
  return (
    <footer className="relative mt-auto py-6 text-center">
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          <span className="font-medium bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            By Саня Космос
          </span>
          
          <span className="text-amber-400">⚡</span>
          
          <span className="text-zinc-400">•</span>
          
          <span className="text-zinc-400">
            Made with 💛 for the clan
          </span>
        </div>
        
        <div className="mt-2 flex justify-center gap-4 text-xs text-zinc-600">
          <span>🍺</span>
          <span>🌿</span>
          <span>⭐</span>
        </div>
      </div>
    </footer>
  );
}
