"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, SlidersHorizontal, CalendarDays, X } from "lucide-react";
import api from "@/api/axios";
import Spinner from "@/components/Spinner";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import { Field } from "@/components/AuthParts";
import { STAGES, STAGE_LABEL, SOURCE_LABEL, fmtDate, fmtDateTime } from "@/lib/format";

const DOT = {
  applied: "#3b82f6", screening: "#ffa629", interview: "#9747ff", assessment: "#ff7a2f",
  offer: "#14b8a6", hired: "#14ae5c", rejected: "#e50f1a",
};

export default function Pipeline() {
  const params = useSearchParams();
  const router = useRouter();
  const [apps, setApps] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [job, setJob] = useState(params.get("job") || "");
  const [q, setQ] = useState("");
  const [source, setSource] = useState("");
  const [view, setView] = useState("kanban");
  const [panel, setPanel] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [overStage, setOverStage] = useState(null);
  const [confirm, setConfirm] = useState(null); // { app, to }
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState(null);
  const [adding, setAdding] = useState(null); // stage
  const [addForm, setAddForm] = useState({ job: "", candidate: "" });
  const [error, setError] = useState("");

  const load = async () => {
    const [a, j, c] = await Promise.all([api.get("/applications"), api.get("/jobs", { params: { status: "open" } }), api.get("/candidates")]);
    setApps(a.data);
    setJobs(j.data);
    setCandidates(c.data);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => (apps || []).filter((a) => {
    if (job && a.job?._id !== job) return false;
    if (q) {
      const s = q.toLowerCase();
      if (![a.candidate?.name, a.candidate?.email, a.candidate?.currentTitle, a.job?.title].some((v) => v?.toLowerCase().includes(s))) return false;
    }
    if (source && a.candidate?.source !== source) return false;
    return true;
  }), [apps, job, q, source]);

  if (!apps) return <Spinner label="Loading pipeline..." />;

  const byStage = Object.fromEntries(STAGES.map((s) => [s, filtered.filter((a) => a.stage === s)]));

  const requestMove = (app, to) => {
    if (!app || app.stage === to) return;
    setConfirm({ app, to });
    setNote("");
    setReason("");
    setError("");
  };

  const doMove = async () => {
    try {
      await api.put(`/applications/${confirm.app._id}/stage`, {
        stage: confirm.to, note,
        ...(confirm.to === "rejected" ? { rejectionReason: reason || note } : {}),
      });
      setConfirm(null);
      setDetail(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not move candidate");
    }
  };

  const doAdd = async () => {
    setError("");
    try {
      const { data } = await api.post("/applications", { job: addForm.job || job, candidate: addForm.candidate });
      if (adding && adding !== "applied") await api.put(`/applications/${data._id}/stage`, { stage: adding, note: "Added directly to stage" });
      setAdding(null);
      setAddForm({ job: "", candidate: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add candidate");
    }
  };

  const onDrop = (stage) => {
    const app = apps.find((a) => a._id === dragId);
    setDragId(null);
    setOverStage(null);
    requestMove(app, stage);
  };

  const filtersActive = job || q || source;
  const total = filtered.length;

  const card = (a) => (
    <div
      key={a._id}
      className={"rz-card" + (dragId === a._id ? " dragging" : "")}
      draggable
      onDragStart={() => setDragId(a._id)}
      onDragEnd={() => { setDragId(null); setOverStage(null); }}
      onClick={() => setDetail(a)}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Avatar name={a.candidate?.name} size={32} />
        <div style={{ minWidth: 0 }}>
          <strong>{a.candidate?.name}</strong>
          <div className="sub">{a.candidate?.currentTitle || "—"}</div>
        </div>
      </div>
      <div className="rz-card-foot">
        <span className="rz-chip" style={{ margin: 0, fontSize: 10.5 }}>{a.job?.title}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><CalendarDays size={11} />{fmtDate(a.updatedAt, { month: "short", day: "numeric" })}</span>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="rz-head">
        <div><h2>Pipeline</h2><p>Drag candidates between stages to move them forward</p></div>
        <div className="rz-head-tools">
          <div className="rz-seg">
            <button className={view === "kanban" ? "active" : ""} onClick={() => setView("kanban")}>Kanban View</button>
            <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>List View</button>
          </div>
          <button className="btn secondary" onClick={() => setPanel((p) => !p)}><SlidersHorizontal size={15} /> Filters</button>
          <button className="btn" onClick={() => { setAdding("applied"); setError(""); }}><Plus size={15} /> Add Candidate</button>
        </div>
      </div>

      <div className="rz-toolbar">
        <div className="rz-search"><Search size={15} /><input placeholder="Search name, email, job…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="rz-select" value={job} onChange={(e) => { setJob(e.target.value); router.replace(e.target.value ? `/pipeline?job=${e.target.value}` : "/pipeline"); }}>
          <option value="">All Jobs</option>
          {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
        </select>
        {filtersActive && <button className="rz-link" onClick={() => { setJob(""); setQ(""); setSource(""); router.replace("/pipeline"); }}>Clear</button>}
      </div>

      <div className="rz-with-panel">
        <div className="rz-grow">
          {view === "kanban" ? (
            <>
              <div className="rz-board">
                {STAGES.map((stage) => (
                  <div
                    key={stage}
                    data-stage={stage}
                    className={"rz-col" + (overStage === stage ? " over" : "")}
                    onDragOver={(e) => { e.preventDefault(); setOverStage(stage); }}
                    onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
                    onDrop={() => onDrop(stage)}
                  >
                    <div className="rz-col-head">{STAGE_LABEL[stage]}<span>{byStage[stage].length}</span></div>
                    {byStage[stage].map(card)}
                    <button className="rz-add-col" onClick={() => { setAdding(stage); setError(""); }}>+ Add Candidate</button>
                  </div>
                ))}
              </div>
              <p className="rz-drag-hint">↳ Drag &amp; drop a candidate to move stage</p>
            </>
          ) : (
            <div className="rz-panel" style={{ padding: 8 }}>
              <div className="table-wrap">
                <table className="rz-table rz-table-full rz-table-light">
                  <thead><tr><th>Candidate</th><th>Job</th><th>Stage</th><th>Updated</th><th>Move to</th></tr></thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a._id}>
                        <td><Link href={`/candidates/${a.candidate?._id}`} className="rz-person" style={{ textDecoration: "none" }}><Avatar name={a.candidate?.name} size={28} /><span><strong>{a.candidate?.name}</strong><small>{a.candidate?.currentTitle}</small></span></Link></td>
                        <td>{a.job?.title}</td>
                        <td><span className={`badge ${a.stage}`}>{STAGE_LABEL[a.stage]}</span></td>
                        <td>{fmtDate(a.updatedAt)}</td>
                        <td>
                          <select className="rz-select" style={{ height: 32 }} value={a.stage} onChange={(e) => requestMove(a, e.target.value)}>
                            {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && <div className="empty-state" style={{ margin: 12 }}>No candidates in this pipeline.</div>}
            </div>
          )}

          <div className="rz-panel" style={{ marginTop: 16, maxWidth: 420 }}>
            <div className="rz-panel-head"><h3>Pipeline Summary</h3><span className="muted">{total} total</span></div>
            {STAGES.map((s) => (
              <div className="rz-summary-row" key={s}>
                <i style={{ background: DOT[s] }} /><span>{STAGE_LABEL[s]}</span>
                <span>{byStage[s].length} ({total ? Math.round((byStage[s].length / total) * 100) : 0}%)</span>
              </div>
            ))}
            <p className="muted" style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>Every stage change is recorded with a timestamp and the user who made it.</p>
          </div>
        </div>

        {panel && (
          <aside className="rz-filter-panel">
            <h4>Filters <button className="rz-icon-btn" style={{ width: 28, height: 28 }} onClick={() => setPanel(false)} aria-label="Close filters"><X size={14} /></button></h4>
            <Field label="Search"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, job" /></Field>
            <Field label="Job">
              <select value={job} onChange={(e) => setJob(e.target.value)}>
                <option value="">All Jobs</option>
                {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
            </Field>
            <Field label="Source">
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="">All Sources</option>
                {Object.entries(SOURCE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <div className="rz-filter-actions">
              <button className="btn secondary" onClick={() => { setJob(""); setQ(""); setSource(""); }}>Reset</button>
              <button className="btn" onClick={() => setPanel(false)}>Apply</button>
            </div>
          </aside>
        )}
      </div>

      {confirm && (
        <Modal
          title="Move candidate"
          onClose={() => setConfirm(null)}
          width={440}
          footer={<><button className="btn secondary" onClick={() => setConfirm(null)}>Cancel</button><button className="btn" onClick={doMove}>Confirm Move</button></>}
        >
          <p className="muted" style={{ marginTop: 0 }}>You are about to move</p>
          <div className="rz-person" style={{ marginBottom: 14 }}>
            <Avatar name={confirm.app.candidate?.name} size={34} />
            <span><strong>{confirm.app.candidate?.name}</strong><small>{confirm.app.job?.title}</small></span>
          </div>
          <p style={{ fontSize: 13.5 }}>
            from <span className={`badge ${confirm.app.stage}`}>{STAGE_LABEL[confirm.app.stage]}</span>{" "}
            to <span className={`badge ${confirm.to}`}>{STAGE_LABEL[confirm.to]}</span>
          </p>
          {error && <div className="rz-alert error">{error}</div>}
          {confirm.to === "rejected" && (
            <Field label="Reason for rejection">
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="">Select a reason</option>
                <option>Skills mismatch for the role</option>
                <option>Experience level mismatch</option>
                <option>Salary expectations too high</option>
                <option>Candidate withdrew</option>
                <option>Other</option>
              </select>
            </Field>
          )}
          <Field label="Note (optional)"><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note about this stage change…" /></Field>
        </Modal>
      )}

      {adding && (
        <Modal
          title={`Add candidate to ${STAGE_LABEL[adding]}`}
          onClose={() => setAdding(null)}
          width={440}
          footer={<><button className="btn secondary" onClick={() => setAdding(null)}>Cancel</button><button className="btn" disabled={!(addForm.job || job) || !addForm.candidate} onClick={doAdd}>Add</button></>}
        >
          {error && <div className="rz-alert error">{error}</div>}
          <Field label="Job">
            <select value={addForm.job || job} onChange={(e) => setAddForm({ ...addForm, job: e.target.value })}>
              <option value="">Select an open job</option>
              {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
          </Field>
          <Field label="Candidate">
            <select value={addForm.candidate} onChange={(e) => setAddForm({ ...addForm, candidate: e.target.value })}>
              <option value="">Select a candidate</option>
              {candidates.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.currentTitle || "N/A"}</option>)}
            </select>
          </Field>
        </Modal>
      )}

      {detail && (
        <>
          <div className="rz-modal-backdrop" style={{ background: "rgba(0,0,0,0.45)", zIndex: 80 }} onClick={() => setDetail(null)} />
          <aside className="rz-drawer">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Candidate</h3>
              <button className="rz-icon-btn" onClick={() => setDetail(null)} aria-label="Close"><X size={16} /></button>
            </div>
            <div className="rz-person" style={{ marginBottom: 14 }}>
              <Avatar name={detail.candidate?.name} size={52} />
              <span><strong style={{ fontSize: 16 }}>{detail.candidate?.name}</strong><small>{detail.candidate?.currentTitle}</small><small>{detail.candidate?.email}</small></span>
            </div>
            <dl className="rz-kv">
              <dt>Job</dt><dd>{detail.job?.title}</dd>
              <dt>Stage</dt><dd><span className={`badge ${detail.stage}`}>{STAGE_LABEL[detail.stage]}</span></dd>
              <dt>Applied</dt><dd>{fmtDate(detail.createdAt)}</dd>
              <dt>Experience</dt><dd>{detail.candidate?.experienceYears ?? 0} yrs</dd>
            </dl>
            <Field label="Move to stage">
              <select value={detail.stage} onChange={(e) => requestMove(detail, e.target.value)}>
                {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
              </select>
            </Field>
            <h4 style={{ margin: "18px 0 10px" }}>Stage history</h4>
            <ul className="rz-timeline">
              {[...(detail.stageHistory || [])].reverse().map((h, i) => (
                <li key={i}>
                  <span className="pt" style={{ background: DOT[h.stage] }} />
                  <strong>{STAGE_LABEL[h.stage]}</strong>
                  <small>{fmtDateTime(h.changedAt)}{h.note ? ` · ${h.note}` : ""}</small>
                </li>
              ))}
            </ul>
            <Link href={`/candidates/${detail.candidate?._id}`} className="btn secondary block" style={{ marginTop: 10 }}>View full profile</Link>
          </aside>
        </>
      )}
    </div>
  );
}
