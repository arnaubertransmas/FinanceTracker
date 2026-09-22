"use client";

import { useState } from "react";
import { KeyRound, Trash2, ShieldCheck } from "lucide-react";
import { useAdminUsers, useDeleteUser, useResetUserPassword } from "@/hooks/useUsers";
import { AdminUser } from "@/schemas/user.schema";

function ResetPasswordForm({ user, onCancel, onDone }: { user: AdminUser; onCancel: () => void; onDone: () => void }) {
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
          Cancel
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={handleSave} disabled={resetPassword.isPending}>
          Set password
        </button>
      </div>
    </div>
  );
}

export function AdminUsersView() {
  const { data: users = [], isLoading } = useAdminUsers();
  const deleteUser = useDeleteUser();
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

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Users</h2>
          {error && (
            <div role="alert" className="alert alert-error py-2 text-sm">
              <span>{error}</span>
            </div>
          )}
          {isLoading ? (
            <p className="opacity-60">Loading...</p>
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
                    <div className="flex gap-1">
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
