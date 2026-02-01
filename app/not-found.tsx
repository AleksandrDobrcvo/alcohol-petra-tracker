import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h1 className="text-6xl font-black text-white mb-4">404</h1>
      <p className="text-xl text-zinc-400 mb-8">Сторінку не знайдено</p>
      <Link 
        href="/"
        className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all"
      >
        🏠 На головну
      </Link>
    </div>
  );
}
