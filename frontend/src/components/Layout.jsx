"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, Moon, Sun, RotateCcw, LogOut, LayoutDashboard, Users, Briefcase,
  KanbanSquare, CalendarCheck, FileText, ClipboardCheck,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import api from "@/api/axios";

const links = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, countKey: null },
  { to: "/candidates", label: "Candidates", icon: Users, countKey: "candidates" },
  { to: "/jobs", label: "Jobs", icon: Briefcase, countKey: "jobs" },
  { to: "/pipeline", label: "Hiring Pipeline", icon: KanbanSquare, countKey: null },
  { to: "/interviews", label: "Interviews", icon: CalendarCheck, countKey: "interviews" },
  { to: "/offers", label: "Offers", icon: FileText, countKey: "offers" },
  { to: "/approvals", label: "Approvals", icon: ClipboardCheck, countKey: null, roles: ["admin", "hiring_manager"] },
];

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({});
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [jobs, candidates, interviews, offers] = await Promise.all([
          api.get("/jobs"),
          api.get("/candidates"),
          api.get("/interviews"),
          api.get("/offers"),
        ]);
        setCounts({
          jobs: jobs.data.length,
          candidates: candidates.data.length,
          interviews: interviews.data.length,
          offers: offers.data.length,
        });
      } catch {
        /* sidebar counts are a nice-to-have, fail silently */
      }
    })();
  }, []);

  const resetData = async () => {
    if (!window.confirm("Reset all demo data? This wipes every job, candidate, interview and offer and reseeds fresh sample data. You'll be signed out and need to log back in with the reseeded accounts.")) return;
    setResetting(true);
    try {
      await api.post("/admin/reset-demo-data");
      logout();
      alert("Demo data reset. Sign back in with admin@ricozrecruit.com / password123 (or the other seeded accounts).");
      router.push("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Could not reset demo data.");
    } finally {
      setResetting(false);
    }
  };

  const sidebarContent = (
    <>
      <div className="brand">
        <Logo size={34} tagline />
      </div>

      {links.filter((l) => !l.roles || l.roles.includes(user?.role)).map((l) => {
        const Icon = l.icon;
        const isActive = pathname === l.to || pathname.startsWith(l.to + "/");
        return (
          <Link
            key={l.to}
            href={l.to}
            onClick={() => setOpen(false)}
            className={"nav-link" + (isActive ? " active" : "")}
          >
            <Icon size={18} />
            {l.label}
            {l.countKey && counts[l.countKey] !== undefined && (
              <span className="nav-count">{counts[l.countKey]}</span>
            )}
          </Link>
        );
      })}

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar">{initials(user?.name)}</div>
          <div className="user-meta">
            <strong>{user?.name}</strong>
            <span className="muted">{user?.role?.replace("_", " ")}</span>
          </div>
        </div>
        <button className="pill-btn" onClick={toggleTheme}>
          {theme === "dark" ? <Sun /> : <Moon />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        {user?.role === "admin" && (
          <button className="pill-btn" onClick={resetData} disabled={resetting}>
            <RotateCcw /> {resetting ? "Resetting..." : "Reset data"}
          </button>
        )}
        <button
          className="pill-btn"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          <LogOut /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <Logo size={26} />
        <div className="avatar">{initials(user?.name)}</div>
      </div>

      <div className={"drawer-backdrop" + (open ? " open" : "")} onClick={() => setOpen(false)} />

      <aside className={"sidebar" + (open ? " open" : "")}>
        <button
          className="hamburger-btn"
          style={{ display: open ? "flex" : "none", marginBottom: 12 }}
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>

      <main className="main fade-in">{children}</main>
    </div>
  );
}
