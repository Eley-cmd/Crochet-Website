"use client";
/**
 * app/admin/login/page.tsx
 * Admin login page — uses Supabase Auth email/password sign-in.
 * On success, redirects to /admin dashboard.
 */
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    // Redirect to admin dashboard on successful login
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl text-matcha font-bold">
            Artrese&apos;
          </Link>
          <p className="text-sesame-muted text-sm mt-2">Admin Access</p>
        </div>

        {/* Login card */}
        <div className="card">
          <h1 className="font-serif text-xl text-matcha mb-6">Sign In</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-sesame-muted">
          <Link href="/" className="hover:text-matcha transition-colors underline underline-offset-2">
            Back to store
          </Link>
        </p>
      </div>
    </main>
  );
}
