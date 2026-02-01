"use client";

import { motion } from "framer-motion";

export type RoleDef = {
  name: string;
  label: string;
  emoji: string;
  color: string;
  textColor: string;
  power: number;
};

// Default role definitions for fallback
const DEFAULT_ROLES: Record<string, RoleDef> = {
  LEADER: { name: "LEADER", label: "Лідер", emoji: "👑", color: "from-amber-500 to-yellow-500", textColor: "text-amber-400", power: 100 },
  DEPUTY: { name: "DEPUTY", label: "Заступник", emoji: "⭐", color: "from-amber-400 to-orange-400", textColor: "text-orange-400", power: 80 },
  SENIOR: { name: "SENIOR", label: "Старший", emoji: "🛡️", color: "from-amber-500/60 to-amber-600/60", textColor: "text-amber-300", power: 60 },
  ALCO_STAFF: { name: "ALCO_STAFF", label: "Алко", emoji: "🍺", color: "from-emerald-500/60 to-emerald-600/60", textColor: "text-emerald-400", power: 40 },
  PETRA_STAFF: { name: "PETRA_STAFF", label: "Петра", emoji: "🌿", color: "from-emerald-500/60 to-teal-600/60", textColor: "text-teal-400", power: 40 },
  MEMBER: { name: "MEMBER", label: "Учасник", emoji: "✅", color: "from-sky-500/60 to-sky-600/60", textColor: "text-sky-400", power: 20 },
};

interface RoleBadgeProps {
  roleName: string;
  roleDef?: RoleDef;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showLightning?: boolean;
}

export function RoleBadge({ 
  roleName, 
  roleDef, 
  size = "md", 
  animated = true,
  showLightning = false 
}: RoleBadgeProps) {
  const role = roleDef || DEFAULT_ROLES[roleName] || DEFAULT_ROLES.MEMBER;
  
  const sizeClasses = {
    sm: "text-[8px] px-2 py-0.5 gap-1",
    md: "text-[10px] px-3 py-1 gap-1.5",
    lg: "text-xs px-4 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <motion.div
      initial={animated ? { scale: 0.9, opacity: 0 } : {}}
      animate={animated ? { scale: 1, opacity: 1 } : {}}
      whileHover={animated ? { scale: 1.05 } : {}}
      className="relative inline-flex items-center"
    >
      {/* Lightning effect for special roles */}
      {showLightning && (role.power >= 80) && (
        <>
          {/* Lightning bolts */}
          <motion.div
            className="absolute -top-1 -left-1 text-amber-400 text-[8px] pointer-events-none"
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.8, 1.2, 0.8],
              rotate: [-15, 0, 15],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              delay: 0,
            }}
          >
            ⚡
          </motion.div>
          <motion.div
            className="absolute -top-1 -right-1 text-amber-400 text-[8px] pointer-events-none"
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.8, 1.2, 0.8],
              rotate: [15, 0, -15],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              delay: 0.5,
            }}
          >
            ⚡
          </motion.div>
        </>
      )}

      {/* Main badge */}
      <motion.span
        className={`
          relative overflow-hidden inline-flex items-center font-black uppercase tracking-wider
          rounded-full border backdrop-blur-md shadow-lg
          ${sizeClasses[size]}
          bg-gradient-to-r ${role.color}
          border-white/20
          ${role.textColor}
        `}
        animate={animated && role.power >= 80 ? {
          boxShadow: [
            "0 0 10px rgba(245,158,11,0.3)",
            "0 0 20px rgba(245,158,11,0.5)",
            "0 0 10px rgba(245,158,11,0.3)",
          ],
        } : {}}
        transition={animated ? { duration: 2, repeat: Infinity } : {}}
      >
        {/* Shimmer effect for high-power roles */}
        {role.power >= 60 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}

        <span className={`relative ${iconSizes[size]}`}>{role.emoji}</span>
        <span className="relative text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          {role.label}
        </span>
      </motion.span>
    </motion.div>
  );
}

interface MultiRoleBadgesProps {
  primaryRole: string;
  additionalRoles?: string[];
  roleDefs?: RoleDef[];
  size?: "sm" | "md" | "lg";
  maxVisible?: number;
}

export function MultiRoleBadges({
  primaryRole,
  additionalRoles = [],
  roleDefs = [],
  size = "md",
  maxVisible = 3,
}: MultiRoleBadgesProps) {
  const getRoleDef = (name: string): RoleDef | undefined => {
    return roleDefs.find(r => r.name === name) || DEFAULT_ROLES[name];
  };

  const allRoles = [primaryRole, ...additionalRoles].filter(Boolean);
  const visibleRoles = allRoles.slice(0, maxVisible);
  const hiddenCount = allRoles.length - maxVisible;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleRoles.map((roleName, index) => (
        <motion.div
          key={roleName}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <RoleBadge
            roleName={roleName}
            roleDef={getRoleDef(roleName)}
            size={size}
            animated={true}
            showLightning={index === 0} // Only primary role gets lightning
          />
        </motion.div>
      ))}
      
      {hiddenCount > 0 && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[10px] font-bold text-zinc-500 bg-white/5 rounded-full px-2 py-0.5 border border-white/10"
        >
          +{hiddenCount}
        </motion.span>
      )}
    </div>
  );
}
