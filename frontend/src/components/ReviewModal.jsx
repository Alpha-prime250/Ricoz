"use client";

import { useState } from "react";
import api from "@/api/axios";
import Modal from "@/components/Modal";
import { Field } from "@/components/AuthParts";
import { requisitionId, fmtDate } from "@/lib/format";

const REJECT_REASONS = [
  "Budget not available",
  "Headcount already filled",
  "Role requirements unclear",
  "Needs department head sign-off",
  "Other",
];

// Approve / reject a pending requisition (design: Day 5 screens 6 and 7).
export default function ReviewModal({ job, onClose, onDone }) {
  const [mode, setMode] = useState("approve");
  const [comment, setComment] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (mode === "reject" && !reason) return setError("Please select a reason for rejection.");
    setBusy(true);
    try {
      const note = mode === "reject" ? [reason, comment].filter(Boolean).join(" — ") : comment;
      await api.put(`/jobs/${job._id}/approval`, { decision: mode === "approve" ? "approved" : "rejected", note });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save your decision.");
      setBusy(false);
    }
  };

  return (
    <Modal
      title={mode === "approve" ? "Approve Requisition" : "Reject Requisition"}
      onClose={onClose}
      footer={
        <>
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          {mode === "approve" ? (
            <>
              <button className="btn outline" onClick={() => setMode("reject")}>Reject…</button>
              <button className="btn" style={{ background: "#14ae5c" }} onClick={submit} disabled={busy}>{busy ? "Saving..." : "Approve"}</button>
            </>
          ) : (
            <>
              <button className="btn outline" onClick={() => setMode("approve")}>Back</button>
              <button className="btn" onClick={submit} disabled={busy}>{busy ? "Saving..." : "Reject"}</button>
            </>
          )}
        </>
      }
    >
      <p className="muted" style={{ marginTop: 0 }}>
        You are about to {mode === "approve" ? "approve" : "reject"} the following requisition.
      </p>
      <dl className="rz-kv">
        <dt>Job Title</dt><dd>{job.title}</dd>
        <dt>Department</dt><dd>{job.department}</dd>
        <dt>Location</dt><dd>{job.location}</dd>
        <dt>Openings</dt><dd>{job.openings}</dd>
        <dt>Requested by</dt><dd>{job.requestedBy?.name || "—"}</dd>
        <dt>Requisition</dt><dd>{requisitionId(job)} · {fmtDate(job.createdAt)}</dd>
      </dl>
      {error && <div className="rz-alert error">{error}</div>}
      {mode === "reject" && (
        <Field label="Reason for rejection" required>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">Select a reason</option>
            {REJECT_REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
      )}
      <Field label={mode === "reject" ? "Additional comments" : "Add a comment (optional)"}>
        <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={mode === "approve" ? "Looks good. Approving this requisition." : "Please update the job description and skills."} />
      </Field>
    </Modal>
  );
}
