"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ClipboardCheck } from "lucide-react";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";
import Pagination from "@/components/Pagination";
import ReviewModal from "@/components/ReviewModal";
import { fmtDate, requisitionId } from "@/lib/format";

const PAGE_SIZE = 8;

export default function Approvals() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [review, setReview] = useState(null);

  const canApprove = ["admin", "hiring_manager"].includes(user?.role);
  const load = () => api.get("/jobs", { params: { approvalStatus: "pending" } }).then(({ data }) => setJobs(data));
  useEffect(() => { load(); }, []);
  useEffect(() => setPage(1), [q]);

  if (!canApprove) return <div className="empty-state">Only admins and hiring managers can review requisitions.</div>;
  if (!jobs) return <Spinner label="Loading approvals..." />;

  const filtered = jobs.filter((j) => !q || j.title.toLowerCase().includes(q.toLowerCase()) || j.department.toLowerCase().includes(q.toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="fade-in">
      <div className="rz-head">
        <div><h2>Pending Approvals</h2><p>{jobs.length} requisition{jobs.length === 1 ? "" : "s"} waiting for a decision</p></div>
        <div className="rz-head-tools">
          <div className="rz-search"><Search size={15} /><input placeholder="Search requisitions..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
      </div>

      <div className="rz-panel" style={{ padding: 8 }}>
        <div className="table-wrap">
          <table className="rz-table rz-table-full rz-table-light">
            <thead>
              <tr><th>Job Title</th><th>Requested By</th><th>Department</th><th>Requested On</th><th>Openings</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((j) => (
                <tr key={j._id}>
                  <td><Link href={`/jobs/${j._id}`} style={{ fontWeight: 600 }}>{j.title}</Link><div className="muted" style={{ fontSize: 11.5 }}>{requisitionId(j)}</div></td>
                  <td>{j.requestedBy?.name || "—"}</td>
                  <td>{j.department}</td>
                  <td>{fmtDate(j.createdAt)}</td>
                  <td>{j.openings}</td>
                  <td><button className="btn small" onClick={() => setReview(j)}>Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state" style={{ margin: 12 }}><ClipboardCheck size={28} /><div>Nothing waiting for approval.</div></div>
        )}
      </div>
      <Pagination page={page} pages={pages} onChange={setPage} />

      {review && <ReviewModal job={review} onClose={() => setReview(null)} onDone={() => { setReview(null); load(); }} />}
    </div>
  );
}
