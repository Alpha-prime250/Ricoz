"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/api/axios";
import { AuthCard, Field, PasswordInput, FormError } from "@/components/AuthParts";

export default function ResetPassword() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const next = {};
    if (password.length < 8) next.password = "Password must be at least 8 characters";
    if (confirm !== password) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Reset password" subtitle="Choose a new password for your account.">
      {done ? (
        <>
          <div className="rz-alert success">Password updated. You can now sign in.</div>
          <Link href="/login" className="btn block">Back to login</Link>
        </>
      ) : (
        <form onSubmit={submit} noValidate>
          {!token && <FormError>This reset link is missing its token. Request a new one.</FormError>}
          <FormError>{error}</FormError>
          <Field label="New password" error={errors.password} hint="Must be at least 8 characters">
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password" error={errors.confirm}>
            <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </Field>
          <button className="btn block" type="submit" disabled={loading || !token}>{loading ? "Updating..." : "Reset password"}</button>
          <p className="rz-auth-foot"><Link href="/login">Back to login</Link></p>
        </form>
      )}
    </AuthCard>
  );
}
