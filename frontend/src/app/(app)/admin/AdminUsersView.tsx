"use client";

import { useState } from "react";
import { KeyRound, Trash2, ShieldCheck, UserPlus } from "lucide-react";
import { useAdminUsers, useCreateUser, useDeleteUser, useResetUserPassword, useUpdateUserRole } from "@/hooks/useUsers";
import { AdminUser, UserRole } from "@/schemas/user.schema";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function ResetPasswordForm({ user, onCancel, onDone }: { user: AdminUser; onCancel: () => void; onDone: () => void }) {
  const { t } = useLanguage();
  const resetPassword = useResetUserPassword();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!password) {
      setError("Password is required");
      return;
    }
    try {
      await resetPassword.mutateAsync({ id: user.id, password });
      onDone();
    } catch {
      setError("Could not reset the password");
    }
  }

  return (
    <div className="flex flex-col gap-2 py-3 bg-base-200/40 rounded-2xl px-3 -mx-3">
      <input
        type="text"
        className="input input-sm"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
      />
      {error && <span className="text-error text-xs">{error}</span>}
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={handleSave} disabled={resetPassword.isPending}>
          {t("common.save")}
        </button>
      </div>
    </div>
  );
}

function CreateUserForm() {
  const { t } = useLanguage();
  const createUser = useCreateUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Username and password are required");
      return;
    }
    try {
      await createUser.mutateAsync({ email: email.trim(), password, role });
      setEmail("");
      setPassword("");
      setRole("USER");
    } catch {
      setError("Could not create the user (username may already exist)");
    }
  }

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title">
          <UserPlus size={18} /> {t("admin.createUser")}
        </h2>
        <form onSubmit={handleCreate} className="flex gap-2 flex-wrap items-center">
          <input
            type="text"
            className="input input-sm flex-1 min-w-32"
            placeholder={t("login.username")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            className="input input-sm flex-1 min-w-32"
            placeholder={t("login.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select className="select select-sm" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="USER">{t("admin.roleUser")}</option>
            <option value="ADMIN">{t("admin.roleAdmin")}</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm" disabled={createUser.isPending}>
            {t("admin.create")}
          </button>
        </form>
        {error && (
          <div role="alert" className="alert alert-error py-2 text-sm mt-2">
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminUsersView({ currentUserId }: { currentUserId: string }) {
  const { t } = useLanguage();
  const { data: users = [], isLoading } = useAdminUsers();
  const deleteUser = useDeleteUser();
  const updateRole = useUpdateUserRole();
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(user: AdminUser) {
    if (!window.confirm(`Delete ${user.email} and all their data? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteUser.mutateAsync(user.id);
    } catch {
      setError("Could not delete this user");
    }
  }

  async function handleRoleChange(user: AdminUser, role: UserRole) {
    try {
      await updateRole.mutateAsync({ id: user.id, role });
    } catch {
      setError("Could not update this user's role");
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <CreateUserForm />

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">{t("admin.users")}</h2>
          {error && (
            <div role="alert" className="alert alert-error py-2 text-sm">
              <span>{error}</span>
            </div>
          )}
          {isLoading ? (
            <p className="opacity-60">{t("common.loading")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-base-200">
              {users.map((user) =>
                resettingId === user.id ? (
                  <li key={user.id}>
                    <ResetPasswordForm
                      user={user}
                      onCancel={() => setResettingId(null)}
                      onDone={() => setResettingId(null)}
                    />
                  </li>
                ) : (
                  <li key={user.id} className="flex items-center justify-between gap-2 py-3">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1.5 font-medium">
                        {user.email}
                        {user.role === "ADMIN" && <ShieldCheck size={14} className="text-primary" />}
                      </span>
                      <span className="text-xs opacity-60">
                        {user._count.transactions} transactions · {user._count.categories} categories ·{" "}
                        {user._count.budgets} budgets
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <select
                        className="select select-xs"
                        value={user.role}
                        disabled={user.id === currentUserId || updateRole.isPending}
                        onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                        aria-label={`Role for ${user.email}`}
                      >
                        <option value="USER">{t("admin.roleUser")}</option>
                        <option value="ADMIN">{t("admin.roleAdmin")}</option>
                      </select>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => setResettingId(user.id)}
                        aria-label={`Reset password for ${user.email}`}
                      >
                        <KeyRound size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => handleDelete(user)}
                        disabled={user.id === currentUserId}
                        aria-label={`Delete ${user.email}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
