"use client";

import { supabase } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await supabase.auth.signOut();
        router.replace("/login");
        router.refresh();
    }

    return (
        <button
          onClick={handleLogout}
          className="btn-primary"
        >
          Déconnexion
        </button>
      );
}
