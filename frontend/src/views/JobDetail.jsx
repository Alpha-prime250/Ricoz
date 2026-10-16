"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Hash, Building2, MapPin, Briefcase, Users, IndianRupee, Award, UserRound, KanbanSquare,
} from "lucide-react";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";
import Avatar from "@/components/Avatar";
import ReviewModal from "@/components/ReviewModal";
import { EMPLOYMENT_LABEL, jobStatusLabel, requisitionId, salaryRange } from "@/lib/format";

export default function JobDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [review, setReview] = useState(false);

  const load = () => api.get(`/jobs/${id}`).then(({ data }) => setJob(data)).catch((e) => setError(e.response?.data?.message || "Could not load job"));
  useEffect(() => { load(); }, [id]);

  if (error) return <div className="rz-alert error">{error}</div>;
  if (!job) return <Spinner label="Loading job..." />;

  const st = jobStatusLabel(job);
  const canApprove = ["admin", "hiring_manager"].includes(user?.role) && job.approvalStatus === "pending";
  const rows = [
    [Hash, "Job ID", requisitionId(job)],
    [Building2, "Department", job.department],
    [MapPin, "Location", job.location],
    [Briefcase, "Employment Type", EMPLOYMENT_LABEL[job.employmentType]],
    [Users, "Openings", job.openings],
    [IndianRupee, "Salary Range", salaryRange(job)],
    [Award, "Experience Required", job.experienceRequired || "—"],
  ];

  return (
    <div className="fade-in">
      <button className="rz-back" onClick={() => router.back()}>← Back</button>
      <div className="rz-title-row">
        <h2>{job.title}</h2>
        <span className={`badge ${st.key}`}>{st.label}</span>
        <span className="rz-spacer" />
        <Link href={`/pipeline?job=${job._id}`} className="btn secondary"><KanbanSquare size={14} /> Pipeline</Link>
        <Link href={`/jobs/${job._id}/edit`} className="btn secondary">Edit</Link>
        {canApprove && <button className="btn" onClick={() => setReview(true)}>Review</button>}
      </div>

      <div className="rz-detail-grid">
        <div>
          <div className="rz-panel" style={{ marginBottom: 16 }}>
            <ul className="rz-info-list">
              {rows.map(([Icon, k, v]) => (
                <li key={k}><Icon size={16} /><span className="k">{k}</span><span className="v">{v}</span></li>
              ))}
              <li>
                <UserRound size={16} /><span className="k">Hiring Manager</span>
                <span className="v" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {job.hiringManager ? <><Avatar name={job.hiringManager.name} size={24} />{job.hiringManager.name}</> : "—"}
                </span>
              </li>
            </ul>
          </div>

          <div className="rz-panel">
            <div className="rz-panel-head"><h3>Approval Status</h3></div>
            <span className={`badge ${st.key}`}>{st.label}</span>
            <p className="muted" style={{ margin: "10px 0" }}>
              {job.approvalStatus === "pending" && "This requisition is pending approval."}
              {job.approvalStatus === "approved" && `Approved${job.approvedBy ? ` by ${job.approvedBy.name}` : ""}.`}
              {job.approvalStatus === "rejected" && `Rejected${job.approvalNote ? `: ${job.approvalNote}` : "."}`}
            </p>
            <Link href={`/jobs/${job._id}/history`} className="rz-link">View Approval History →</Link>
          </div>
        </div>

        <div className="rz-panel">
          <div className="rz-panel-head"><h3>Job Description</h3></div>
          <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--text)", marginTop: 0, whiteSpace: "pre-line" }}>{job.description}</p>

          {job.requirements?.length > 0 && (
            <>
              <h3 style={{ marginTop: 22 }}>Requirements</h3>
              <ul className="rz-bullets">{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </>
          )}
          {job.skills?.length > 0 && (
            <>
              <h3 style={{ marginTop: 22 }}>Skills</h3>
              <div className="rz-chips-row">{job.skills.map((s) => <span className="rz-chip" key={s}>{s}</span>)}</div>
            </>
          )}
        </div>
      </div>

      {review && <ReviewModal job={job} onClose={() => setReview(false)} onDone={() => { setReview(false); load(); }} />}
    </div>
  );
}
