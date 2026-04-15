"use client";

import { signOut } from "@radar-domace/api";
import { useRouter } from "next/navigation";
import { createWebBrowserSupabaseClient } from "../lib/supabase-browser";

export const SignOutButton = () => {
  const router = useRouter();

  return (
    <button
      className="ghost-button"
      onClick={async () => {
        const client = createWebBrowserSupabaseClient();
        await signOut(client);
        router.replace("/login");
        router.refresh();
      }}
      type="button"
    >
      Sign out
    </button>
  );
};
