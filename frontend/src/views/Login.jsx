"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthCard, Field, PasswordInput, FormError, SocialButtons, EMAIL_RE } from "@/components/AuthParts";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@ricozrecruit.com");
  const [password, setPassword] = useState("password123");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const next = {};
    if (!EMAIL_RE.test(email)) next.email = "Please enter a valid email address";
    if (!password) next.password = "Please enter your password";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <form onSubmit={submit} noValidate>
        <FormError>{error}</FormError>
        <Field label="Email address" error={errors.email}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" placeholder="you@company.com" />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>
        <div className="rz-auth-meta">
          <label className="rz-check" style={{ textTransform: "none", fontSize: 13, color: "var(--text)", fontWeight: 400, letterSpacing: 0 }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
          </label>
          <Link href="/forgot-password" style={{ fontSize: 12.5 }}>Forgot password?</Link>
        </div>
        <button className="btn block" type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      </form>
      <SocialButtons />
      <p className="rz-auth-foot">Don&apos;t have an account? <Link href="/register">Register</Link></p>
    </AuthCard>
  );
}
