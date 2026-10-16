"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Plus, Search, SlidersHorizontal, MoreHorizontal, UserCheck, CalendarCheck, Activity, X } from "lucide-react";
import api from "@/api/axios";
import Spinner from "@/components/Spinner";
import Avatar from "@/components/Avatar";
import Pagination from "@/components/Pagination";
import AddCandidateModal from "@/components/AddCandidateModal";
import { Field } from "@/components/AuthParts";
import { SOURCE_LABEL, STAGE_LABEL, fmtDate } from "@/lib/format";

const PAGE_SIZE = 8;
const emptyFilters = { q: "", stage: "", source: "", location: "", minExp: "", skill: "" };

export default function Candidates() {
  const params = useSearchParams();
  const router = useRouter();
  const [candidates, setCandidates] = useState(null);
  const [apps, setApps] = useState([]);
  const [filters, setFilters] = useState({ ...emptyFilters, q: params.get("q") || "" });
  const [panel, setPanel] = useState(false);
  const [adding, setAdding] = useState(params.get("add") === "1");
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState(null);
  const [selected, setSelected] = useState([]);

  const load = async () => {
    const [c, a] = await Promise.all([api.get("/candidates"), api.get("/applications")]);
    setCandidates(c.data);
    setApps(a.data);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => setPage(1), [filters]);
  useEffect(() => {
    const close = () => setMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // A candidate's status is the stage of their most recently updated application.
  const stageOf = useMemo(() => {
    const m = {};
    [...apps].sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)).forEach((a) => { m[a.candidate?._id] = a.stage; });
    return m;
  }, [apps]);

  const list = candidates || [];
  const locations = useMemo(() => [...new Set(list.map((c) => c.location).filter(Boolean))].sort(), [list]);
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  const filtered = list.filter((c) => {
    const q = filters.q.toLowerCase();
    if (q && ![c.name, c.email, c.currentTitle, ...(c.skills || [])].some((v) => v?.toLowerCase().includes(q))) return false;
    if (filters.stage && (stageOf[c._id] || "none") !== filters.stage) return false;
    if (filters.source && c.source !== filters.source) return false;
    if (filters.location && c.location !== filters.location) return false;
    if (filters.minExp && (c.experienceYears || 0) < Number(filters.minExp)) return false;
    if (filters.skill && !(c.skills || []).some((s) => s.toLowerCase().includes(filters.skill.toLowerCase()))) return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!candidates) return <Spinner label="Loading candidates..." />;

  const active = list.filter((c) => stageOf[c._id] && !["rejected", "hired"].includes(stageOf[c._id])).length;
  const interviewing = list.filter((c) => ["interview", "assessment"].includes(stageOf[c._id])).length;
  const hired = list.filter((c) => stageOf[c._id] === "hired").length;
  const stats = [
    { label: "Total Candidates", value: list.length, icon: Users },
    { label: "Active in Pipeline", value: active, icon: Activity },
    { label: "In Interview", value: interviewing, icon: CalendarCheck },
    { label: "Hired", value: hired, icon: UserCheck },
  ];

  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r._id));
  const toggleAll = () => setSelected(allChecked ? selected.filter((id) => !rows.some((r) => r._id === id)) : [...new Set([...selected, ...rows.map((r) => r._id)])]);

  const deleteCandidate = async (c) => {
    if (!window.confirm(`Delete ${c.name}? This cannot be undone.`)) return;
    await api.delete(`/candidates/${c._id}`);
    load();
  };

  return (
    <div className="fade-in">
      <div className="rz-head">
        <div><h2>Candidates</h2><p>Everyone sourced across your open roles</p></div>
        <div className="rz-head-tools">
          <button className="btn secondary" onClick={() => setPanel((p) => !p)}><SlidersHorizontal size={15} /> Filters</button>
          <button className="btn" onClick={() => setAdding(true)}><Plus size={15} /> Add Candidate</button>
        </div>
      </div>

      <div className="rz-stats">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div className="rz-stat" key={s.label}>
              <span className="rz-stat-icon"><Icon size={18} /></span>
              <div><b>{s.value}</b><span>{s.label}</span></div>
            </div>
          );
        })}
      </div>

      <div className="rz-with-panel">
        <div className="rz-grow">
          <div className="rz-toolbar">
            <div className="rz-search">
              <Search size={15} />
              <input placeholder="Search by name, email, job title, skills..." value={filters.q} onChange={set("q")} />
            </div>
            <select className="rz-select" value={filters.stage} onChange={set("stage")}>
              <option value="">All Status</option>
              {Object.entries(STAGE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              <option value="none">Not in a pipeline</option>
            </select>
            <select className="rz-select" value={filters.source} onChange={set("source")}>
              <option value="">All Sources</option>
              {Object.entries(SOURCE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            {JSON.stringify(filters) !== JSON.stringify(emptyFilters) && (
              <button className="rz-link" onClick={() => setFilters(emptyFilters)}>Clear</button>
            )}
          </div>

          <div className="rz-panel" style={{ padding: 8 }}>
            <div className="table-wrap">
              <table className="rz-table rz-table-full rz-table-light">
                <thead>
                  <tr>
                    <th className="check"><input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all" /></th>
                    <th>Candidate</th><th>Current Role</th><th>Experience</th><th>Location</th><th>Skills</th><th>Status</th><th>Added On</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => {
                    const stage = stageOf[c._id];
                    return (
                      <tr key={c._id}>
                        <td className="check"><input type="checkbox" checked={selected.includes(c._id)} onChange={() => setSelected(selected.includes(c._id) ? selected.filter((i) => i !== c._id) : [...selected, c._id])} aria-label={`Select ${c.name}`} /></td>
                        <td>
                          <Link href={`/candidates/${c._id}`} className="rz-person" style={{ textDecoration: "none" }}>
                            <Avatar name={c.name} size={32} />
                            <span><strong>{c.name}</strong><small>{c.email}</small></span>
                          </Link>
                        </td>
                        <td>{c.currentTitle || "—"}{c.currentCompany && <small className="muted" style={{ display: "block", fontSize: 11.5 }}>{c.currentCompany}</small>}</td>
                        <td>{c.experienceYears ?? 0} yrs</td>
                        <td>{c.location || "—"}</td>
                        <td><span className="rz-skill-dots">{(c.skills || []).slice(0, 2).map((s) => <span className="rz-skill" key={s}>{s}</span>)}{(c.skills || []).length > 2 && <span className="muted">+{c.skills.length - 2}</span>}</span></td>
                        <td>{stage ? <span className={`badge ${stage}`}>{STAGE_LABEL[stage]}</span> : <span className="muted">—</span>}</td>
                        <td>{fmtDate(c.createdAt, { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td>
                          <div className="rz-menu" onClick={(e) => e.stopPropagation()}>
                            <button className="rz-icon-btn" style={{ width: 30, height: 30 }} onClick={() => setMenu(menu === c._id ? null : c._id)} aria-label="Row actions"><MoreHorizontal size={15} /></button>
                            {menu === c._id && (
                              <div className="rz-menu-list">
                                <Link href={`/candidates/${c._id}`}>View profile</Link>
                                <button onClick={() => { setMenu(null); deleteCandidate(c); }}>Delete</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="empty-state" style={{ margin: 12 }}><Users size={28} /><div>{list.length ? "No candidates match these filters." : "No candidates sourced yet."}</div></div>
            )}
            <p className="muted" style={{ margin: "10px 12px 4px" }}>Showing {rows.length} of {filtered.length} candidates</p>
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>

        {panel && (
          <aside className="rz-filter-panel">
            <h4>Filters <button className="rz-icon-btn" style={{ width: 28, height: 28 }} onClick={() => setPanel(false)} aria-label="Close filters"><X size={14} /></button></h4>
            <Field label="Keywords"><input value={filters.q} onChange={set("q")} placeholder="Name, email, role, skill" /></Field>
            <Field label="Status">
              <select value={filters.stage} onChange={set("stage")}>
                <option value="">All</option>
                {Object.entries(STAGE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Min. experience (years)"><input type="number" min="0" value={filters.minExp} onChange={set("minExp")} /></Field>
            <Field label="Location">
              <select value={filters.location} onChange={set("location")}>
                <option value="">All</option>
                {locations.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Skill"><input value={filters.skill} onChange={set("skill")} placeholder="e.g. Figma" /></Field>
            <Field label="Source">
              <select value={filters.source} onChange={set("source")}>
                <option value="">All</option>
                {Object.entries(SOURCE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <div className="rz-filter-actions">
              <button className="btn secondary" onClick={() => setFilters(emptyFilters)}>Clear All</button>
              <button className="btn" onClick={() => setPanel(false)}>Done</button>
            </div>
          </aside>
        )}
      </div>

      {adding && (
        <AddCandidateModal
          onClose={() => { setAdding(false); if (params.get("add")) router.replace("/candidates"); }}
          onCreated={() => { setAdding(false); if (params.get("add")) router.replace("/candidates"); load(); }}
        />
      )}
    </div>
  );
}
