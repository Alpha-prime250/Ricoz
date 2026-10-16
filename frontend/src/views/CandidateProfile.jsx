"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Mail, Phone, MapPin, FileText, Plus } from "lucide-react";
import api from "@/api/axios";
import Spinner from "@/components/Spinner";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import { Field } from "@/components/AuthParts";
import { SOURCE_LABEL, STAGE_LABEL, fmtDate, fmtDateTime } from "@/lib/format";

const TABS = ["Profile", "Applications", "Notes", "Documents", "Activity Timeline"];

export default function CandidateProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState(null);
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [tab, setTab] = useState("Profile");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);
  const [jobId, setJobId] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [c, a, j] = await Promise.all([
      api.get(`/candidates/${id}`),
      api.get("/applications", { params: { candidate: id } }),
      api.get("/jobs", { params: { status: "open" } }),
    ]);
    setCandidate(c.data);
    setNotes(c.data.notes || "");
    setApps(a.data);
    setJobs(j.data);
  };
  useEffect(() => { load().catch((e) => setError(e.response?.data?.message || "Could not load candidate")); }, [id]);

  if (error) return <div className="rz-alert error">{error}</div>;
  if (!candidate) return <Spinner label="Loading candidate..." />;

  const latest = [...apps].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
  const available = jobs.filter((j) => !apps.some((a) => a.job?._id === j._id));

  const saveNotes = async () => {
    await api.put(`/candidates/${id}`, { notes });
    setCandidate({ ...candidate, notes });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const addToJob = async () => {
    setError("");
    try {
      await api.post("/applications", { job: jobId, candidate: id });
      setAdding(false);
      setJobId("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add to job");
    }
  };

  const events = apps
    .flatMap((a) => (a.stageHistory || []).map((h) => ({ ...h, job: a.job?.title })))
    .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));

  return (
    <div className="fade-in">
      <button className="rz-back" onClick={() => router.back()}>← Back</button>

      <div className="rz-panel" style={{ marginBottom: 16 }}>
        <div className="rz-profile-top">
          <Avatar name={candidate.name} size={84} />
          <div className="rz-profile-meta">
            <h2>{candidate.name}</h2>{" "}
            {latest && <span className={`badge ${latest.stage}`} style={{ verticalAlign: "middle", marginLeft: 8 }}>{STAGE_LABEL[latest.stage]}</span>}
            <p>{candidate.currentTitle || "—"}{candidate.currentCompany && ` · ${candidate.currentCompany}`}</p>
            <p><MapPin size={13} />{candidate.location || "—"}</p>
            <p><Mail size={13} /><a href={`mailto:${candidate.email}`}>{candidate.email}</a></p>
            {candidate.phone && <p><Phone size={13} />{candidate.phone}</p>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => setAdding(true)}><Plus size={14} /> Add to Job</button>
          </div>
        </div>
        <div className="rz-mini-stats">
          <div><span>Experience</span><b>{candidate.experienceYears ?? 0} Years</b></div>
          <div><span>Current Company</span><b>{candidate.currentCompany || "—"}</b></div>
          <div><span>Current Title</span><b>{candidate.currentTitle || "—"}</b></div>
          <div><span>Total Applications</span><b>{apps.length}</b></div>
        </div>
      </div>

      <div className="rz-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t}{t === "Applications" ? ` (${apps.length})` : ""}
          </button>
        ))}
      </div>

      {tab === "Profile" && (
        <div className="rz-three">
          <div className="rz-panel">
            <div className="rz-panel-head"><h3>Personal Information</h3></div>
            <ul className="rz-info-list">
              <li><span className="k">Full Name</span><span className="v">{candidate.name}</span></li>
              <li><span className="k">Email</span><span className="v">{candidate.email}</span></li>
              <li><span className="k">Phone</span><span className="v">{candidate.phone || "—"}</span></li>
              <li><span className="k">Location</span><span className="v">{candidate.location || "—"}</span></li>
            </ul>
          </div>
          <div className="rz-panel">
            <div className="rz-panel-head"><h3>Professional Information</h3></div>
            <ul className="rz-info-list">
              <li><span className="k">Current Role</span><span className="v">{candidate.currentTitle || "—"}</span></li>
              <li><span className="k">Company</span><span className="v">{candidate.currentCompany || "—"}</span></li>
              <li><span className="k">Experience</span><span className="v">{candidate.experienceYears ?? 0} years</span></li>
              <li><span className="k">Source</span><span className="v">{SOURCE_LABEL[candidate.source]}</span></li>
            </ul>
          </div>
          <div className="rz-panel">
            <div className="rz-panel-head"><h3>Skills</h3></div>
            <div className="rz-chips-row">
              {(candidate.skills || []).length ? candidate.skills.map((s) => <span className="rz-chip" key={s}>{s}</span>) : <span className="muted">No skills listed.</span>}
            </div>
            <p className="muted" style={{ marginTop: 14 }}>Added on {fmtDate(candidate.createdAt)} · Updated {fmtDate(candidate.updatedAt)}</p>
          </div>
        </div>
      )}

      {tab === "Applications" && (
        <div className="rz-panel" style={{ padding: 8 }}>
          <div className="table-wrap">
            <table className="rz-table rz-table-full rz-table-light">
              <thead><tr><th>Job Title</th><th>Department</th><th>Applied On</th><th>Current Stage</th><th>Actions</th></tr></thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a._id}>
                    <td><Link href={`/jobs/${a.job?._id}`} style={{ fontWeight: 600 }}>{a.job?.title}</Link></td>
                    <td>{a.job?.department}</td>
                    <td>{fmtDate(a.createdAt)}</td>
                    <td><span className={`badge ${a.stage}`}>{STAGE_LABEL[a.stage]}</span></td>
                    <td><Link href={`/pipeline?job=${a.job?._id}`} className="btn small secondary">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {apps.length === 0 && <div className="empty-state" style={{ margin: 12 }}>No applications yet. Use “Add to Job” to start one.</div>}
        </div>
      )}

      {tab === "Notes" && (
        <div className="rz-panel">
          <Field label="Recruiter notes"><textarea rows={8} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this candidate…" /></Field>
          <button className="btn" onClick={saveNotes} disabled={notes === (candidate.notes || "")}>{saved ? "Saved ✓" : "Save notes"}</button>
        </div>
      )}

      {tab === "Documents" && (
        <div className="rz-panel">
          {candidate.resumeUrl ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FileText size={20} color="var(--primary)" />
              <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">Resume</a>
              <span className="muted">{candidate.resumeUrl}</span>
            </div>
          ) : (
            <div className="empty-state">No documents attached.</div>
          )}
        </div>
      )}

      {tab === "Activity Timeline" && (
        <div className="rz-panel">
          {events.length === 0 && <p className="muted">No activity yet.</p>}
          <ul className="rz-timeline">
            {events.map((e, i) => (
              <li key={i}>
                <span className={"pt " + (e.stage === "hired" ? "green" : e.stage === "rejected" ? "" : e.stage === "applied" ? "gray" : "amber")} />
                <strong>{e.stage === "applied" ? "Applied" : `Moved to ${STAGE_LABEL[e.stage]}`}{e.job ? ` — ${e.job}` : ""}</strong>
                <small>{fmtDateTime(e.changedAt)}{e.note ? ` · ${e.note}` : ""}</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {adding && (
        <Modal
          title="Add to Job"
          onClose={() => setAdding(false)}
          footer={<><button className="btn secondary" onClick={() => setAdding(false)}>Cancel</button><button className="btn" disabled={!jobId} onClick={addToJob}>Add</button></>}
        >
          <Field label="Open job">
            <select value={jobId} onChange={(e) => setJobId(e.target.value)}>
              <option value="">Select a job</option>
              {available.map((j) => <option key={j._id} value={j._id}>{j.title} — {j.department}</option>)}
            </select>
          </Field>
          {available.length === 0 && <p className="muted">This candidate is already in every open job.</p>}
        </Modal>
      )}
    </div>
  );
}
