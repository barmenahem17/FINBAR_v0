"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">התנתקות</h2>
      <p className="text-sm text-zinc-500 mb-4">
        לחץ כאן כדי להתנתק מהמערכת
      </p>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {loading ? "מתנתק..." : "התנתק מהמערכת"}
      </button>
    </div>
  );
}

