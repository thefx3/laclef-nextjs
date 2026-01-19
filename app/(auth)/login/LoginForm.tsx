"use client";

import { supabase } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setPending(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/");
    router.refresh();
  }

    return (
        <div className="min-h-screen grid place-items-center bg-gray-50 p-6">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-sm"
        >
          <h1 className="text-xl font-semibold">Connexion</h1>
          <p className="mt-1 text-sm text-gray-600">La CLEF Dashboard</p>
  
          <div className="mt-6 space-y-3">
            <div className="space-y-1 mb-6">
              <label className="text-sm font-medium">Email</label>
              <input
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 mt-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
  
            <div className="space-y-1">
              <label className="text-sm font-medium">Mot de passe</label>
              <input
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 mt-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
  
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
  
            <button
              disabled={pending}
              className="font-bold mt-2 w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60 cursor-pointer"
              type="submit"
            >
              {pending ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </form>
      </div>
    )
}