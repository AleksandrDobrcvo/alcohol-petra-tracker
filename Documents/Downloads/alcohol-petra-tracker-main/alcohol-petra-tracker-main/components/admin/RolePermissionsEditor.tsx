"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  User, 
  Settings, 
  Lock, 
  Unlock, 
  Save, 
  Plus, 
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type RoleDefinition = {
  id: string;
  name: string;
  label: string;
  emoji: string;
  color: string;
  textColor: string;
  power: number;
  desc?: string;
  permissions?: any;
  createdAt: string;
  updatedAt: string;
};

type Permission = {
  id: string;
  name: string;
  description: string;
};

const DEFAULT_PERMISSIONS: Permission[] = [
  { id: "manage_users", name: "Manage Users", description: "Add, edit, ban users" },
  { id: "manage_roles", name: "Manage Roles", description: "Create, edit, assign roles" },
  { id: "manage_requests", name: "Manage Requests", description: "Approve, reject, delete requests" },
  { id: "delete_entries", name: "Delete Entries", description: "Remove payment entries" },
  { id: "ban_users", name: "Ban Users", description: "Block users from accessing the system" },
  { id: "moderate_alco", name: "Moderate Alco", description: "Handle alcohol-related requests" },
  { id: "moderate_petra", name: "Moderate Petra", description: "Handle petra-related requests" },
  { id: "view_reports", name: "View Reports", description: "Access to analytics and reports" },
  { id: "manage_pricing", name: "Manage Pricing", description: "Set prices for resources" },
  { id: "view_audit_log", name: "View Audit Log", description: "See system activity logs" },
];

export function RolePermissionsEditor() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>(DEFAULT_PERMISSIONS);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/roles", { cache: "no-store" });
      const json = await res.json();
      
      if (!json.ok) throw new Error(json.error?.message || "Failed to load roles");
      
      setRoles(json.data.roles);
      if (json.data.roles.length > 0) {
        setSelectedRole(json.data.roles[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading roles");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (roleId: string, permissionId: string, checked: boolean) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const rolePerms = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions || {};
        const updatedPerms = { ...rolePerms, [permissionId]: checked };
        
        return {
          ...role,
          permissions: updatedPerms
        };
      }
      return role;
    }));
  };

  const saveRolePermissions = async () => {
    if (!selectedRole) return;
    
    const role = roles.find(r => r.id === selectedRole);
    if (!role) return;
    
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: role.name,
          label: role.label,
          emoji: role.emoji,
          color: role.color,
          textColor: role.textColor,
          power: role.power,
          desc: role.desc,
          permissions: role.permissions || {}
        })
      });
      
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed to save permissions");
      
      // Update the role in the local state with the saved permissions
      setRoles(prev => prev.map(r => r.id === selectedRole ? { ...r, permissions: role.permissions } : r));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error saving permissions");
    } finally {
      setSaving(false);
    }
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Ролі та Дозволи
          </h2>
          <p className="text-zinc-500 text-sm mt-1">Налаштуйте дозволи для кожної ролі</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Roles List */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Ролі
              </h3>
              <div className="space-y-2">
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full text-left rounded-xl px-4 py-3 text-sm transition-all flex items-center gap-2 ${
                      selectedRole === role.id
                        ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent text-zinc-300'
                    }`}
                  >
                    <span className="text-lg">{role.emoji}</span>
                    <span>{role.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Permissions Editor */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-xl text-white flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    {selectedRoleData ? `${selectedRoleData.emoji} ${selectedRoleData.label}` : 'Оберіть роль'}
                  </h3>
                  <p className="text-zinc-500 text-sm mt-1">Налаштуйте дозволи для цієї ролі</p>
                </div>
                
                <button
                  onClick={saveRolePermissions}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Збереження...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Зберегти
                    </>
                  )}
                </button>
              </div>

              {selectedRoleData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.map(permission => {
                    const rolePerms = typeof selectedRoleData.permissions === 'string' 
                      ? JSON.parse(selectedRoleData.permissions) 
                      : selectedRoleData.permissions || {};
                    const hasPermission = rolePerms[permission.id] === true;

                    return (
                      <motion.div
                        key={permission.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-start gap-3"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.1 }}
                      >
                        <input
                          type="checkbox"
                          id={permission.id}
                          checked={hasPermission}
                          onChange={(e) => handlePermissionChange(selectedRoleData.id, permission.id, e.target.checked)}
                          className="mt-0.5 h-5 w-5 rounded border-white/30 bg-white/10 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                        />
                        <div className="flex-1">
                          <label htmlFor={permission.id} className="font-bold text-white cursor-pointer">
                            {permission.name}
                          </label>
                          <p className="text-xs text-zinc-500 mt-1">{permission.description}</p>
                        </div>
                        <div className={`p-2 rounded-lg ${hasPermission ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/20 text-zinc-500'}`}>
                          {hasPermission ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}