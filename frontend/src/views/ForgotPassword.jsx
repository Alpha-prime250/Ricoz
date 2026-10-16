"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/api/axios";
import { AuthCard, Field, FormError, EMAIL_RE } from "@/components/AuthParts";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldError("");
    if (!EMAIL_RE.test(email)) return setFieldError("Please enter a valid work email");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send the reset link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPath = result?.resetToken ? `/reset-password?token=${result.resetToken}` : null;

  return (
    <AuthCard title="Forgot password?" subtitle="Enter your work email and we'll send you a reset link.">
      {result ? (
        <>
          <div className="rz-alert success">{result.message}</div>
          {resetPath && (
            <div className="rz-alert info">
              Demo mode (no mail server): <Link href={resetPath}>open your reset link</Link>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={submit} noValidate>
          <FormError>{error}</FormError>
          <Field label="Work email" error={fieldError}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="you@company.com" />
          </Field>
          <button className="btn block" type="submit" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
        </form>
      )}
      <p className="rz-auth-foot">Remember your password? <Link href="/login">Login</Link></p>
    </AuthCard>
  );
}
