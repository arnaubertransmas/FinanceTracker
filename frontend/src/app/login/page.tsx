"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { loginSchema } from "@/schemas/auth.schema";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/login", parsed.data);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 429 ? "Too many attempts. Try again later." : "Incorrect username or password");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4 bg-gradient-to-br from-base-200 via-base-200 to-primary/10 min-h-screen">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body items-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/15 text-primary mb-1">
            <Wallet size={28} strokeWidth={2.25} />
          </span>
          <h1 className="card-title text-2xl">FinanceTracker</h1>
          <p className="text-center text-sm opacity-70 mb-2">Sign in to manage your money</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-1 w-full">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Username</legend>
              <input
                id="email"
                type="text"
                required
                autoComplete="username"
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password</legend>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className="input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </fieldset>

            {error && (
              <div role="alert" className="alert alert-error py-2 text-sm">
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary mt-3" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
