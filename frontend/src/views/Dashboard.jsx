"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText, FileSearch, Users, UserCheck, ArrowUp, CalendarDays, Clock, Send,
  CheckCircle2, UserRound, Mail, UserPlus,
} from "lucide-react";
import api from "@/api/axios";
import Spinner from "@/components/Spinner";
import Avatar from "@/components/Avatar";
import PageHeader from "@/components/PageHeader";
import { STAGE_LABEL, STAGE_STATUS, fmtTime, relativeDay } from "@/lib/format";

const PERIODS = [
  { key: "month", label: "This Month", days: 30 },
  { key: "week", label: "Last 7 days", days: 7 },
  { key: "all", label: "All time", days: null },
];

// An application "reached" a funnel step if it is there now or ever passed through it.
const FUNNEL = [
  { key: "applications", label: "Applications", stages: null },
  { key: "screening", label: "Screening", stages: ["screening", "interview", "assessment", "offer", "hired"] },
  { key: "interviews", label: "Interviews", stages: ["interview", "assessment", "offer", "hired"] },
  { key: "offers", label: "Offers", stages: ["offer", "hired"] },
  { key: "hired", label: "Hired", stages: ["hired"] },
];

function reached(app, stages) {
  if (!stages) return true;
  if (stages.includes(app.stage)) return true;
  return (app.stageHistory || []).some((h) => stages.includes(h.stage));
}

const STATUS_ICON = { New: Clock, "In Review": Clock, Scheduled: CalendarDays, Sent: Send, Completed: CheckCircle2, Closed: Clock };

function OverviewChart({ points }) {
  const W = 560, H = 250, L = 38, R = 16, T = 26, B = 36;
  const max = Math.max(10, Math.ceil(Math.max(...points.map((p) => p.value)) / 10) * 10);
  const x = (i) => L + (i * (W - L - R)) / (points.length - 1);
  const y = (v) => T + (1 - v / max) * (H - T - B);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${H - B} L${x(0)},${H - B} Z`;
  const ticks = [0, 1, 2, 3, 4, 5].map((i) => Math.round((max / 5) * i));
  return (
    <svg className="rz-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Hiring funnel by stage">
      <defs>
        <linearGradient id="rzArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e50f1a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e50f1a" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity="0.12" strokeDasharray="3 4" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end">{t}</text>
        </g>
      ))}
      <path d={area} fill="url(#rzArea)" />
      <path d={line} fill="none" stroke="#e50f1a" strokeWidth="2" />
      {points.map((p, i) => (
        <g key={p.label}>
          <circle cx={x(i)} cy={y(p.value)} r="4.5" fill="#fff" stroke="#e50f1a" strokeWidth="2" />
          <text className="val" x={x(i)} y={y(p.value) - 12} textAnchor="middle">{p.value}</text>
          <text x={x(i)} y={H - 12} textAnchor="middle">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    (async () => {
      try {
        const [interviewsRes, applicationsRes] = await Promise.all([
          api.get("/interviews"),
          api.get("/applications"),
        ]);
        setData({ interviews: interviewsRes.data, applications: applicationsRes.data });
      } catch (err) {
        setError(err.response?.data?.message || "Could not load the dashboard.");
      }
    })();
  }, []);

  const view = useMemo(() => {
    if (!data) return null;
    const { applications, interviews } = data;
    const p = PERIODS.find((x) => x.key === period);
    const since = p.days ? Date.now() - p.days * 86400000 : 0;
    const scoped = applications.filter((a) => new Date(a.createdAt).getTime() >= since);

    const counts = Object.fromEntries(FUNNEL.map((f) => [f.key, scoped.filter((a) => reached(a, f.stages)).length]));
    const total = counts.applications;

    const monthAgo = Date.now() - 30 * 86400000;
    const newThisMonth = (stages) =>
      applications.filter((a) => new Date(a.createdAt).getTime() >= monthAgo && reached(a, stages)).length;
    const allCounts = Object.fromEntries(FUNNEL.map((f) => [f.key, applications.filter((a) => reached(a, f.stages)).length]));

    const upcoming = interviews
      .filter((i) => i.status === "scheduled" && new Date(i.scheduledAt) >= new Date())
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    const recent = [...applications]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);

    return { counts, total, allCounts, newThisMonth, upcoming, recent };
  }, [data, period]);

  if (error) return <div className="rz-alert error">{error}</div>;
  if (!view) return <Spinner label="Loading overview..." />;

  const { counts, total, allCounts, newThisMonth, upcoming, recent } = view;

  const kpis = [
    { label: "Applications", icon: FileText, value: allCounts.applications, delta: newThisMonth(null), pct: true },
    { label: "Screening", icon: FileSearch, value: allCounts.screening, delta: newThisMonth(FUNNEL[1].stages), pct: true },
    { label: "Interviews", icon: Users, value: allCounts.interviews, delta: newThisMonth(FUNNEL[2].stages), pct: true },
    { label: "Hired", icon: UserCheck, value: allCounts.hired, delta: newThisMonth(FUNNEL[4].stages), pct: false },
  ];

  const pipeline = [
    { label: "Applied", icon: FileText, value: counts.applications },
    { label: "Screening", icon: FileSearch, value: counts.screening },
    { label: "Interview", icon: Users, value: counts.interviews },
    { label: "Offer", icon: Mail, value: counts.offers },
    { label: "Hired", icon: UserPlus, value: counts.hired },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Hiring Dashboard"
        subtitle="Full recruitment lifecycle at a glance"
        notifications={upcoming.length}
        action={{ href: "/candidates?add=1", label: "Add Candidate" }}
      />

      <div className="rz-kpis">
        {kpis.map((k) => {
          const Icon = k.icon;
          const pct = k.pct && k.value ? Math.round((k.delta / k.value) * 100) : null;
          return (
            <div className="rz-kpi" key={k.label}>
              <div className="rz-kpi-icon"><Icon size={22} /></div>
              <div>
                <div className="rz-kpi-label">{k.label}</div>
                <div className="rz-kpi-value">{k.value}</div>
                <div className="rz-kpi-delta">
                  <b><ArrowUp size={12} />{pct !== null ? `${pct}%` : k.delta}</b> this month
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rz-dash-row">
        <div className="rz-panel">
          <div className="rz-panel-head">
            <h3>Hiring Overview</h3>
            <select className="rz-select" value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Period">
              {PERIODS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </div>
          <OverviewChart points={FUNNEL.map((f) => ({ label: f.label, value: counts[f.key] }))} />
        </div>

        <div className="rz-panel">
          <div className="rz-panel-head"><h3>Hiring Pipeline</h3></div>
          {pipeline.map((s) => {
            const Icon = s.icon;
            const pct = total ? Math.round((s.value / total) * 100) : 0;
            return (
              <div className="rz-pipe-row" key={s.label}>
                <span className="rz-pipe-icon"><Icon size={14} /></span>
                <span className="rz-pipe-label">{s.label}</span>
                <div className="rz-pipe-track"><div className="rz-pipe-fill" style={{ width: `${pct}%` }} /></div>
                <span className="rz-pipe-count">{s.value}</span>
                <span className="rz-pipe-pct">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rz-dash-row bottom">
        <div className="rz-panel">
          <div className="rz-panel-head">
            <h3>Recent Candidates</h3>
            <Link href="/candidates" className="rz-link">View All</Link>
          </div>
          <div className="table-wrap">
            <table className="rz-table">
              <thead>
                <tr><th>Candidate</th><th>Position</th><th>Stage</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.map((a) => {
                  const status = STAGE_STATUS[a.stage];
                  const StatusIcon = STATUS_ICON[status] || Clock;
                  return (
                    <tr key={a._id}>
                      <td>
                        <Link href={`/candidates/${a.candidate?._id}`} className="rz-person" style={{ color: "inherit", textDecoration: "none" }}>
                          <Avatar name={a.candidate?.name} size={28} />
                          <span>{a.candidate?.name}</span>
                        </Link>
                      </td>
                      <td>{a.job?.title}</td>
                      <td><span className="rz-stage">{STAGE_LABEL[a.stage]}</span></td>
                      <td><span className="rz-status"><StatusIcon size={13} />{status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {recent.length === 0 && <p className="muted">No applications yet.</p>}
        </div>

        <div className="rz-panel">
          <div className="rz-panel-head">
            <h3>Upcoming Interviews</h3>
            <Link href="/interviews" className="rz-link">View All</Link>
          </div>
          <div className="rz-int-list">
            {upcoming.length === 0 && <p className="muted" style={{ padding: 14, margin: 0 }}>No interviews scheduled.</p>}
            {upcoming.slice(0, 3).map((i) => (
              <div className="rz-int" key={i._id}>
                <Avatar name={i.application?.candidate?.name} size={38} />
                <div className="rz-int-meta">
                  <strong>{i.application?.candidate?.name}</strong>
                  <span>{i.application?.job?.title || i.type?.replace("_", " ")}</span>
                </div>
                <div className="rz-int-when">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><CalendarDays size={12} />{relativeDay(i.scheduledAt)}</span>
                  <b>{fmtTime(i.scheduledAt)}</b>
                </div>
              </div>
            ))}
          </div>
          <Link href="/interviews" className="btn outline rz-wide-btn"><CalendarDays size={14} /> View Calendar</Link>
        </div>
      </div>
    </div>
  );
}
