"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // הודעה כללית כדי לא לחשוף פרטים מיותרים
        setError("לא הצלחנו ליצור חשבון. בדוק את הפרטים ונסה שוב.");
        return;
      }

      // ברירת מחדל: ברוב הפרויקטים אימות אימייל מופעל; נשלח את המשתמש להתחברות.
      router.replace("/login");
    } catch {
      setError("משהו השתבש. נסה שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">יצירת חשבון</h1>
          <p className="mt-1 text-sm text-zinc-600">צור משתמש חדש כדי להתחיל.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">אימייל</label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">סיסמה</label>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
              placeholder="לפחות 8 תווים"
            />
            <p className="mt-1 text-xs text-zinc-500">לפחות 8 תווים.</p>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "יוצר חשבון..." : "צור חשבון"}
          </button>
        </form>

        <div className="mt-6 text-sm text-zinc-700">
          כבר יש לך משתמש?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline">
            התחבר
          </Link>
        </div>
      </div>
    </main>
  );
}

