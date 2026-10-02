import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Spinner from "../components/Spinner";

const STAGE_LABELS = [
  { label: "Sourced", stages: ["applied"] },
  { label: "Screening", stages: ["screening"] },
  { label: "Interview", stages: ["interview", "assessment"] },
  { label: "Offer", stages: ["offer"] },
  { label: "Hired", stages: ["hired"] },
];

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function relativeDay(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((dOnly - nowOnly) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays === -1) return "Yesterday";
  return diffDays < 0 ? `${Math.abs(diffDays)} days ago` : "Soon";
}

function timeLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const [jobsRes, candidatesRes, interviewsRes, offersRes, applicationsRes] = await Promise.all([
        api.get("/jobs"),
        api.get("/candidates"),
        api.get("/interviews"),
        api.get("/offers"),
        api.get("/applications"),
      ]);
      setData({
        jobs: jobsRes.data,
        candidates: candidatesRes.data,
        interviews: interviewsRes.data,
        offers: offersRes.data,
        applications: applicationsRes.data,
      });
    })();
  }, []);

  if (!data) return <Spinner label="Loading overview..." />;

  const { jobs, candidates, interviews, offers, applications } = data;

  const openJobs = jobs.filter((j) => j.status === "open");
  const seatsToFill = openJobs.reduce((sum, j) => sum + (j.openings || 0), 0);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newlySourced = candidates.filter((c) => new Date(c.createdAt).getTime() >= weekAgo).length;

  const upcomingInterviews = interviews
    .filter((i) => i.status === "scheduled" && new Date(i.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const offersOut = offers.filter((o) => ["draft", "sent"].includes(o.status)).length;
  const offersAccepted = offers.filter((o) => o.status === "accepted").length;

  const stageCounts = STAGE_LABELS.map((s) => ({
    label: s.label,
    count: applications.filter((a) => s.stages.includes(a.stage)).length,
  }));
  const maxStage = Math.max(1, ...stageCounts.map((s) => s.count));

  const stats = [
    { value: openJobs.length, label: "Open requisitions", sub: `${seatsToFill} seat${seatsToFill === 1 ? "" : "s"} to fill` },
    { value: candidates.length, label: "Candidates in play", sub: `${newlySourced} newly sourced` },
    { value: upcomingInterviews.length, label: "Interviews ahead", sub: upcomingInterviews[0] ? `${relativeDay(upcomingInterviews[0].scheduledAt)} is next` : "Nothing scheduled" },
    { value: offersOut, label: "Offers out", sub: `${offersAccepted} accepted to date` },
  ];

  return (
    <div className="fade-in">
      <h2>Overview</h2>
      <p className="muted" style={{ marginBottom: 22 }}>Where every open role stands right now.</p>

      <div className="dash-grid">
        {stats.map((s) => (
          <div className="card stat-card" key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="dash-split">
        <div className="card">
          <div className="card-head">
            <h4>Pipeline by stage</h4>
            <Link to="/jobs">Open the board</Link>
          </div>
          {stageCounts.map((s) => (
            <div className="stage-row" key={s.label}>
              <div className="stage-label">{s.label}</div>
              <div className="stage-track">
                <div className="stage-fill" style={{ width: `${(s.count / maxStage) * 100}%` }} />
              </div>
              <div className="stage-count">{s.count}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-head">
            <h4>Next up</h4>
            <Link to="/interviews">All interviews</Link>
          </div>
          {upcomingInterviews.length === 0 && <p className="muted">No interviews scheduled.</p>}
          {upcomingInterviews.slice(0, 4).map((i) => (
            <div className="upnext-row" key={i._id}>
              <div className="avatar">{initials(i.application?.candidate?.name)}</div>
              <div className="upnext-meta">
                <strong>{i.application?.candidate?.name}</strong>
                <br />
                <span>{i.type.replace("_", " ")} · {i.interviewers?.[0]?.name || "Unassigned"}</span>
              </div>
              <div className="upnext-time">{relativeDay(i.scheduledAt)} · {timeLabel(i.scheduledAt)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h4>Open roles</h4>
          <Link to="/jobs">All requisitions</Link>
        </div>
        {openJobs.length === 0 && <p className="muted">No open roles right now.</p>}
        {openJobs.slice(0, 6).map((j) => {
          const hired = applications.filter((a) => a.job === j._id || a.job?._id === j._id).filter((a) => a.stage === "hired").length;
          return (
            <div className="role-row" key={j._id}>
              <div className="role-info">
                <strong>{j.title}</strong>{" "}
                <span>{j.department} · {j.location} · {j.employmentType.replace("_", " ")}</span>
              </div>
              <div className="role-tags">
                <span className="tag-pill">{j.openings} active</span>
                <span className="tag-pill">{hired}/{j.openings} filled</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
