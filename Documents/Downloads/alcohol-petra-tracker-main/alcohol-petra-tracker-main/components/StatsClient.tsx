"use client";

import { motion } from "framer-motion";
import { Beer, Sprout, Trophy, Medal } from "lucide-react";

type StatItem = {
  submitterId: string;
  _sum: {
    quantity?: number | null;
    amount: number | null;
  };
};

type UserData = {
  [key: string]: string;
};

export function StatsClient({
  alcoStats,
  petraStats,
  topSubmitters,
  nameById,
}: {
  alcoStats: StatItem[];
  petraStats: StatItem[];
  topSubmitters: StatItem[];
  nameById: UserData;
}) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.section 
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
    >
      {/* Alcohol Top */}
      <motion.div variants={itemAnim} className="group relative rounded-[3rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-1">
        <div className="relative rounded-[2.9rem] bg-zinc-950/40 p-8 backdrop-blur-2xl h-full shadow-2xl transition-all duration-500 group-hover:bg-zinc-950/60">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-500 shadow-lg shadow-amber-500/10 group-hover:scale-110 transition-transform">
              <Beer className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">АЛКОГОЛЬ</h2>
              <p className="text-[10px] text-amber-500/60 uppercase tracking-widest font-black">Найбільше здано</p>
            </div>
          </div>

          <div className="space-y-4">
            {alcoStats.map((s, i) => (
              <motion.div 
                key={s.submitterId} 
                whileHover={{ x: 5 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group/row hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-black text-xs ${
                    i === 0 ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' : i === 1 ? 'bg-zinc-400 text-black' : i === 2 ? 'bg-orange-700 text-white' : 'bg-white/5 text-zinc-500'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="font-bold text-white truncate max-w-[120px]">
                    {nameById[s.submitterId] ?? "????"}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-white">{s._sum.quantity ?? 0} шт</div>
                  <div className="text-[10px] text-zinc-600 font-bold">{Number(s._sum.amount ?? 0).toFixed(0)} ₴</div>
                </div>
              </motion.div>
            ))}
            {alcoStats.length === 0 && <p className="text-center py-10 text-zinc-600 font-medium italic">Дані ще збираються...</p>}
          </div>
        </div>
      </motion.div>

      {/* Petra Top */}
      <motion.div variants={itemAnim} className="group relative rounded-[3rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-1">
        <div className="relative rounded-[2.9rem] bg-zinc-950/40 p-8 backdrop-blur-2xl h-full shadow-2xl transition-all duration-500 group-hover:bg-zinc-950/60">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 shadow-lg shadow-emerald-500/10 group-hover:scale-110 transition-transform">
              <Sprout className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">ПЕТРА</h2>
              <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest font-black">Найбільше внесків</p>
            </div>
          </div>

          <div className="space-y-4">
            {petraStats.map((s, i) => (
              <motion.div 
                key={s.submitterId} 
                whileHover={{ x: 5 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group/row hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-black text-xs ${
                    i === 0 ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : i === 1 ? 'bg-zinc-400 text-black' : i === 2 ? 'bg-orange-700 text-white' : 'bg-white/5 text-zinc-500'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="font-bold text-white truncate max-w-[120px]">
                    {nameById[s.submitterId] ?? "????"}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-white">{s._sum.quantity ?? 0} шт</div>
                  <div className="text-[10px] text-zinc-600 font-bold">{Number(s._sum.amount ?? 0).toFixed(0)} ₴</div>
                </div>
              </motion.div>
            ))}
            {petraStats.length === 0 && <p className="text-center py-10 text-zinc-600 font-medium italic">Дані ще збираються...</p>}
          </div>
        </div>
      </motion.div>

      {/* Global Wealth Top */}
      <motion.div variants={itemAnim} className="group relative rounded-[3rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-1">
        <div className="relative rounded-[2.9rem] bg-zinc-950/40 p-8 backdrop-blur-2xl h-full shadow-2xl transition-all duration-500 group-hover:bg-zinc-950/60">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-500 shadow-lg shadow-sky-500/10 group-hover:scale-110 transition-transform">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">ЗАРОБІТОК</h2>
              <p className="text-[10px] text-sky-500/60 uppercase tracking-widest font-black">Загальна сума</p>
            </div>
          </div>

          <div className="space-y-4">
            {topSubmitters.map((s, i) => (
              <motion.div 
                key={s.submitterId} 
                whileHover={{ x: 5 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10 group/row hover:bg-sky-500/10 transition-all shadow-lg shadow-sky-500/5"
              >
                <div className="flex items-center gap-3">
                  <Medal className={`w-6 h-6 ${i === 0 ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : i === 1 ? 'text-zinc-400' : 'text-orange-600'}`} />
                  <span className="font-black text-white truncate max-w-[120px]">
                    {nameById[s.submitterId] ?? "????"}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-white">{Number(s._sum.amount ?? 0).toFixed(0)} ₴</div>
                </div>
              </motion.div>
            ))}
            {topSubmitters.length === 0 && <p className="text-center py-10 text-zinc-600 font-medium italic">Статистика порожня</p>}
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
