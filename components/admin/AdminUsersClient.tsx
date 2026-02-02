"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MultiRoleBadges } from "../ui/RoleBadge";
import { Button } from "../ui/Button";
import RefreshSessionButton from "../RefreshSessionButton";

type User = {
  id: string;
  name: string;
  discordId: string;
  role: string;
  additionalRoles: string[];
  isApproved: boolean;
  isBlocked: boolean;
  createdAt: string;
  lastSeen: string | null;
};

export function AdminUsersClient() {
  const { data: session, status, update } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has required permissions
  const hasPermission = session?.user?.role === "LEADER" || 
                       session?.user?.role === "DEPUTY" || 
                       session?.user?.role === "SENIOR";

  useEffect(() => {
    if (!hasPermission) {
      setError("Insufficient role-based permissions");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users", { cache: "no-store" });
        const json = await res.json();
        
        if (!json.ok) {
          setError(json.error?.message || "Failed to fetch users");
          return;
        }
        
        setUsers(json.data.users || []);
      } catch (err) {
        setError("Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    if (hasPermission) {
      fetchUsers();
    }
  }, [hasPermission]);

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}/approve`, {
        method: currentStatus ? "DELETE" : "POST",
      });
      const json = await res.json();
      
      if (json.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isApproved: !currentStatus } : u
        ));
      } else {
        alert(json.error?.message || "Failed to update user approval");
      }
    } catch (err) {
      alert("Failed to update user approval");
    }
  };

  const toggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}/block`, {
        method: currentStatus ? "DELETE" : "POST",
      });
      const json = await res.json();
      
      if (json.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isBlocked: !currentStatus } : u
        ));
      } else {
        alert(json.error?.message || "Failed to update user block status");
      }
    } catch (err) {
      alert("Failed to update user block status");
    }
  };

  if (!hasPermission) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md w-full mx-auto">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white mb-2">Недостатньо прав</h2>
        <p className="text-zinc-400 mb-6">
          У вас недостатньо прав для доступу до цієї сторінки
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Повернутися назад
          </Button>
          <RefreshSessionButton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md w-full mx-auto">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Помилка</h2>
        <p className="text-zinc-400 mb-6">
          {error}
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="border-white/20 text-white hover:bg-white/10 w-full"
        >
          Спробувати ще раз
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Користувачі</h2>
          <p className="text-zinc-500">Усього: {users.length}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <div 
            key={user.id} 
            className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="font-bold text-white">{user.name}</span>
                <span className="text-xs text-zinc-500">ID: {user.discordId}</span>
              </div>
              <MultiRoleBadges 
                primaryRole={user.role} 
                additionalRoles={user.additionalRoles} 
                size="sm"
              />
              <div className="flex flex-col text-xs">
                <span className={`font-mono ${user.isApproved ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {user.isApproved ? '✅ Підтверджено' : '❌ Не підтверджено'}
                </span>
                <span className={`${user.isBlocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {user.isBlocked ? '🚫 Заблоковано' : '🟢 Активний'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={user.isApproved ? "outline" : "primary"}
                size="sm"
                onClick={() => toggleApproval(user.id, user.isApproved)}
                className={user.isApproved ? "text-rose-400 border-rose-400/30" : "text-emerald-400 border-emerald-400/30"}
              >
                {user.isApproved ? "Відхилити" : "Підтвердити"}
              </Button>
              <Button
                variant={user.isBlocked ? "primary" : "outline"}
                size="sm"
                onClick={() => toggleBlock(user.id, user.isBlocked)}
                className={user.isBlocked ? "text-emerald-400 border-emerald-400/30" : "text-rose-400 border-rose-400/30"}
              >
                {user.isBlocked ? "Розблокувати" : "Заблокувати"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}