"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthCard, Field, PasswordInput, FormError, SocialButtons, EMAIL_RE } from "@/components/AuthParts";

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "", role: "recruiter", department: "", agree: false,
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your full name";
    if (!EMAIL_RE.test(form.email)) next.email = "Please enter a valid work email";
    if (form.password.length < 8) next.password = "Password must be at least 8 characters";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match";
    if (!form.agree) next.agree = "Please accept the terms to continue";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email, password: form.password, role: form.role, department: form.department });
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <form onSubmit={submit} noValidate>
        <FormError>{error}</FormError>
        <Field label="Full name" error={errors.name}>
          <input value={form.name} onChange={update("name")} autoComplete="name" placeholder="Isha Gupta" />
        </Field>
        <Field label="Work email" error={errors.email}>
          <input value={form.email} onChange={update("email")} type="email" autoComplete="username" placeholder="you@company.com" />
        </Field>
        <div className="rz-row2">
          <Field label="Role">
            <select value={form.role} onChange={update("role")}>
              <option value="recruiter">Recruiter</option>
              <option value="hiring_manager">Hiring Manager</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label="Department">
            <input value={form.department} onChange={update("department")} placeholder="Optional" />
          </Field>
        </div>
        <Field label="Password" error={errors.password}>
          <PasswordInput value={form.password} onChange={update("password")} autoComplete="new-password" />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <PasswordInput value={form.confirm} onChange={update("confirm")} autoComplete="new-password" />
        </Field>
        <div className={"rz-field" + (errors.agree ? " invalid" : "")}>
          <label className="rz-check" style={{ textTransform: "none", fontWeight: 400, fontSize: 13 }}>
            <input type="checkbox" checked={form.agree} onChange={update("agree")} />
            <span>I agree to the <a href="#terms" onClick={(e) => e.preventDefault()}>Terms &amp; Conditions</a> and <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a></span>
          </label>
          {errors.agree && <span className="rz-err">{errors.agree}</span>}
        </div>
        <button className="btn block" type="submit" disabled={loading}>{loading ? "Creating..." : "Register"}</button>
      </form>
      <SocialButtons />
      <p className="rz-auth-foot">Already have an account? <Link href="/login">Login</Link></p>
    </AuthCard>
  );
}
