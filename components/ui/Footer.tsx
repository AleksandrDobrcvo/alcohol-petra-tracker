"use client";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/5 bg-[#05080a] py-12 text-center overflow-hidden footer-animated">
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col items-center justify-center gap-4">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
          <div className="flex items-center gap-3 text-lg font-bold text-white tracking-widest">
            <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">🏰</span>
            <span className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent uppercase font-black">
              SOBRANIE
            </span>
          </div>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
            <span className="footer-message">Created for the elite</span>
            <span className="footer-emoji text-sm">❤️</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="footer-brand bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent font-black">
              By Саня Космос
            </span>
          </div>
          
          <div className="footer-icons flex gap-4 items-center bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
            <span className="footer-icon filter drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]">🍺</span>
            <span className="footer-icon footer-icon-delay-1 filter drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">🌿</span>
            <span className="footer-icon footer-icon-delay-2 filter drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]">⭐</span>
          </div>
        </div>
        
        <div className="mt-10">
          <div className="text-[8px] uppercase tracking-[0.4em] text-zinc-700 font-black">
            &copy; {new Date().getFullYear()} Sobranie Clan Tracker &bull; Digital Excellence
          </div>
        </div>
      </div>
    </footer>
  );
}
