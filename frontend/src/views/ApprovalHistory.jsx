"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/api/axios";
import Spinner from "@/components/Spinner";
import Avatar from "@/components/Avatar";
import { fmtDateTime, jobStatusLabel, requisitionId } from "@/lib/format";

const ACTION = { submitted: "Submitted", approved: "Approved", rejected: "Rejected" };
const ROLE = { admin: "Admin", hiring_manager: "Hiring Manager", recruiter: "Recruiter" };

export default function ApprovalHistory() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  useEffect(() => { api.get(`/jobs/${id}`).then(({ data }) => setJob(data)); }, [id]);
  if (!job) return <Spinner label="Loading history..." />;

  // Seeded requisitions have no recorded history; reconstruct what we know from the job itself.
  const history = job.approvalHistory?.length
    ? job.approvalHistory
    : [
        { action: "submitted", by: job.requestedBy, role: "recruiter", comment: "", at: job.createdAt },
        ...(job.approvalStatus !== "pending"
          ? [{ action: job.approvalStatus, by: job.approvedBy, role: job.approvedBy?.role || "", comment: job.approvalNote, at: job.updatedAt }]
          : []),
      ];
  const st = jobStatusLabel(job);

  return (
    <div className="fade-in">
      <button className="rz-back" onClick={() => router.back()}>← Back</button>
      <div className="rz-title-row">
        <h2>Approval History — {job.title}</h2>
        <span className="muted">({requisitionId(job)})</span>
        <span className="rz-spacer" />
        <span className="muted">Current Status</span>
        <span className={`badge ${st.key}`}>{st.label}</span>
      </div>

      <div className="rz-detail-grid" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <div className="rz-panel" style={{ padding: 8 }}>
          <div className="table-wrap">
            <table className="rz-table rz-table-full rz-table-light">
              <thead><tr><th>Level</th><th>Approver</th><th>Role</th><th>Action</th><th>Comments</th><th>Date &amp; Time</th></tr></thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td><span className="rz-person"><Avatar name={h.by?.name} size={26} />{h.by?.name || "—"}</span></td>
                    <td>{ROLE[h.role] || h.role || "—"}</td>
                    <td><span className={`badge ${h.action === "submitted" ? "sent" : h.action}`}>{ACTION[h.action]}</span></td>
                    <td>{h.comment || "—"}</td>
                    <td>{fmtDateTime(h.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rz-panel">
          <div className="rz-panel-head"><h3>Timeline</h3></div>
          <ul className="rz-timeline">
            {history.map((h, i) => (
              <li key={i}>
                <span className={"pt " + (h.action === "approved" ? "green" : h.action === "rejected" ? "" : "gray")} />
                <strong>{ACTION[h.action]}{h.by?.name ? ` by ${h.by.name}` : ""}</strong>
                <small>{fmtDateTime(h.at)}</small>
              </li>
            ))}
            {job.approvalStatus === "pending" && (
              <li><span className="pt amber" /><strong>Pending approval</strong><small>Awaiting a hiring manager or admin</small></li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
