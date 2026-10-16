"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, Plus, Search, MoreHorizontal, CheckCircle2, Clock, Lock } from "lucide-react";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";
import Pagination from "@/components/Pagination";
import ReviewModal from "@/components/ReviewModal";
import { EMPLOYMENT_LABEL, fmtDate, jobStatusLabel } from "@/lib/format";

const PAGE_SIZE = 8;

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [loc, setLoc] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState(null);
  const [review, setReview] = useState(null);

  const canApprove = ["admin", "hiring_manager"].includes(user?.role);

  const load = async () => {
    const { data } = await api.get("/jobs");
    setJobs(data);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => setPage(1), [q, dept, loc, status]);
  useEffect(() => {
    const close = () => setMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const list = jobs || [];
  const departments = useMemo(() => [...new Set(list.map((j) => j.department))].sort(), [list]);
  const locations = useMemo(() => [...new Set(list.map((j) => j.location))].sort(), [list]);

  const filtered = list.filter((j) => {
    if (q && !j.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (dept && j.department !== dept) return false;
    if (loc && j.location !== loc) return false;
    if (status && jobStatusLabel(j).key !== status) return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!jobs) return <Spinner label="Loading jobs..." />;

  const stats = [
    { label: "Total Jobs", value: list.length, icon: Briefcase },
    { label: "Open Jobs", value: list.filter((j) => jobStatusLabel(j).key === "open").length, icon: CheckCircle2 },
    { label: "Pending Approval", value: list.filter((j) => j.approvalStatus === "pending").length, icon: Clock },
    { label: "Closed Jobs", value: list.filter((j) => j.status === "closed").length, icon: Lock },
  ];

  return (
    <div className="fade-in">
      <div className="rz-head">
        <div><h2>Jobs</h2><p>Requisitions from request to approval</p></div>
        <div className="rz-head-tools">
          <Link href="/jobs/new" className="btn"><Plus size={15} /> Create Requisition</Link>
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

      <div className="rz-toolbar">
        <div className="rz-search"><Search size={15} /><input placeholder="Search jobs..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="rz-select" value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="rz-select" value={loc} onChange={(e) => setLoc(e.target.value)}>
          <option value="">All Locations</option>
          {locations.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="rz-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="pending">Pending Approval</option>
          <option value="rejected">Rejected</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      <div className="rz-panel" style={{ padding: 8 }}>
        <div className="table-wrap">
          <table className="rz-table rz-table-full rz-table-light">
            <thead>
              <tr>
                <th>Job Title</th><th>Department</th><th>Location</th><th>Employment Type</th>
                <th>Openings</th><th>Status</th><th>Posted On</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => {
                const st = jobStatusLabel(j);
                return (
                  <tr key={j._id}>
                    <td><Link href={`/jobs/${j._id}`} style={{ fontWeight: 600 }}>{j.title}</Link></td>
                    <td>{j.department}</td>
                    <td>{j.location}</td>
                    <td>{EMPLOYMENT_LABEL[j.employmentType]}</td>
                    <td>{j.openings}</td>
                    <td><span className={`badge ${st.key}`}>{st.label}</span></td>
                    <td>{fmtDate(j.createdAt, { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td>
                      <div className="rz-menu" onClick={(e) => e.stopPropagation()}>
                        <button className="rz-icon-btn" style={{ width: 30, height: 30 }} onClick={() => setMenu(menu === j._id ? null : j._id)} aria-label="Row actions">
                          <MoreHorizontal size={15} />
                        </button>
                        {menu === j._id && (
                          <div className="rz-menu-list">
                            <Link href={`/jobs/${j._id}`}>View details</Link>
                            <Link href={`/jobs/${j._id}/edit`}>Edit</Link>
                            <Link href={`/jobs/${j._id}/history`}>Approval history</Link>
                            <Link href={`/pipeline?job=${j._id}`}>View pipeline</Link>
                            {canApprove && j.approvalStatus === "pending" && (
                              <button onClick={() => { setReview(j); setMenu(null); }}>Review…</button>
                            )}
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
          <div className="empty-state" style={{ margin: 12 }}>
            <Briefcase size={28} />
            <div>{list.length ? "No jobs match these filters." : "No job requisitions yet."}</div>
          </div>
        )}
      </div>
      <Pagination page={page} pages={pages} onChange={setPage} />

      {review && <ReviewModal job={review} onClose={() => setReview(null)} onDone={() => { setReview(null); load(); }} />}
    </div>
  );
}
