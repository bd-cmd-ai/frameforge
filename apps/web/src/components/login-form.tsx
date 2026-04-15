"use client";

import { signIn, signUp, getCurrentProfile } from "@radar-domace/api";
import type { AppRole } from "@radar-domace/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createWebBrowserSupabaseClient } from "../lib/supabase-browser";

const roleRedirect = (role: AppRole) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "provider") return "/dashboard";
  return "/";
};

export const LoginForm = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "provider" as AppRole,
  });

  const handleSubmit = () => {
    startTransition(async () => {
      setError(null);
      const client = createWebBrowserSupabaseClient();

      const result =
        mode === "sign-in"
          ? await signIn(client, { email: form.email, password: form.password })
          : await signUp(client, {
              email: form.email,
              password: form.password,
              fullName: form.fullName,
              role: form.role,
            });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      const profile = await getCurrentProfile(client);
      if (profile) {
        router.replace(roleRedirect(profile.role));
        router.refresh();
      }
    });
  };

  return (
    <div className="auth-card">
      <p className="page-eyebrow">Supabase authentication</p>
      <h1>{mode === "sign-in" ? "Sign in" : "Create account"}</h1>
      <p className="muted">
        Roles are resolved from the `profiles` table. Use provider or admin accounts to access protected web areas.
      </p>
      <div className="auth-actions" style={{ marginBottom: 18 }}>
        <button className={mode === "sign-in" ? "primary-button" : "ghost-button"} onClick={() => setMode("sign-in")} type="button">
          Sign in
        </button>
        <button className={mode === "sign-up" ? "primary-button" : "ghost-button"} onClick={() => setMode("sign-up")} type="button">
          Sign up
        </button>
      </div>
      <div className="form-grid">
        {mode === "sign-up" ? (
          <div className="field full">
            <label>Full name</label>
            <input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
          </div>
        ) : null}
        <div className="field full">
          <label>Email</label>
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            type="email"
          />
        </div>
        <div className="field full">
          <label>Password</label>
          <input
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            type="password"
          />
        </div>
        {mode === "sign-up" ? (
          <div className="field full">
            <label>Role</label>
            <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as AppRole }))}>
              <option value="consumer">Consumer</option>
              <option value="provider">Provider</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ) : null}
      </div>
      {error ? <p className="note" style={{ marginTop: 16 }}>{error}</p> : null}
      <div className="auth-actions">
        <button className="primary-button" onClick={handleSubmit} type="button" disabled={isPending}>
          {isPending ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
};
