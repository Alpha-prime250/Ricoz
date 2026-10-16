"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function LandingNav() {
  const { user, ready } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="lp-nav">
      <Link href="/" className="lp-brand">
        Ricoz<span>Recruit</span>
      </Link>
      <nav className="lp-links" aria-label="Sections">
        <a href="#lifecycle">How it works</a>
        <a href="#details">What&apos;s inside</a>
        <a href="#teams">Teams</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div className="lp-nav-actions">
        <button
          className="lp-icon-btn"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        {ready && user ? (
          <Link href="/dashboard" className="btn small">Open dashboard</Link>
        ) : (
          <>
            <Link href="/login" className="lp-signin">Sign in</Link>
            <Link href="/register" className="btn small">Create account</Link>
          </>
        )}
      </div>
    </header>
  );
}
