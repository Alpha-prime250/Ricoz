import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { initials } from "@/lib/format";

// "05 — Cards" from the Figma design system: candidate card, dark KPI card, job card.

export function CandidateCard({ id, name, role, status, statusLabel }) {
  return (
    <Link href={`/candidates/${id}`} className="rz-card rz-card-cand">
      <div className="rz-card-top">
        <span className="rz-card-avatar" aria-hidden="true">{initials(name) || "?"}</span>
        <div className="rz-card-id">
          <strong>{name}</strong>
          <span>{role || "—"}</span>
        </div>
      </div>
      {statusLabel && <span className={`rz-card-pill ${status || ""}`}>{statusLabel}</span>}
    </Link>
  );
}

export function KpiCard({ label, value, note }) {
  return (
    <div className="rz-card rz-card-kpi">
      <span className="rz-card-kpi-label">{label}</span>
      <b className="rz-card-kpi-value">{value}</b>
      {note && <span className="rz-card-kpi-note">{note}</span>}
    </div>
  );
}

export function JobCard({ id, title, location, type, applicants }) {
  return (
    <Link href={`/jobs/${id}`} className="rz-card rz-card-job">
      <strong>{title}</strong>
      <span className="rz-card-meta">{[location, type].filter(Boolean).join(" • ")}</span>
      <span className="rz-card-link">
        {applicants} applicant{applicants === 1 ? "" : "s"} <ArrowRight size={13} />
      </span>
    </Link>
  );
}
