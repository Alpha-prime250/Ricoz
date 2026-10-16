"use client";

import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import Logo from "@/components/Logo";

export function AuthCard({ title, subtitle, children }) {
  return (
    <div className="rz-auth">
      <div className="rz-auth-card fade-in">
        <Logo size={30} />
        {title && <h2>{title}</h2>}
        {subtitle && <p className="sub">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export function Field({ label, error, hint, required, children }) {
  return (
    <div className={"rz-field" + (error ? " invalid" : "")}>
      {label && <label>{label}{required && <em> *</em>}</label>}
      {children}
      {error ? <span className="rz-err">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

export function PasswordInput({ value, onChange, autoComplete, placeholder, ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <div className="rz-input-wrap">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        {...rest}
      />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return <div className="rz-alert error"><AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{children}</div>;
}

export function SocialButtons() {
  return (
    <>
      <div className="rz-divider">or continue with</div>
      <div className="rz-social">
        <button type="button" className="btn secondary" disabled title="Coming soon">Google</button>
        <button type="button" className="btn secondary" disabled title="Coming soon">Microsoft</button>
      </div>
    </>
  );
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
