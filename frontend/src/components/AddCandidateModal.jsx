"use client";

import { useState } from "react";
import api from "@/api/axios";
import Modal from "@/components/Modal";
import { Field } from "@/components/AuthParts";
import { EMAIL_RE } from "@/components/AuthParts";

const empty = {
  name: "", email: "", phone: "", source: "other", currentTitle: "", currentCompany: "",
  experienceYears: "", location: "", skills: "", resumeUrl: "",
};

// Design: Day 6 screen 2 "Add Candidate".
export default function AddCandidateModal({ onClose, onCreated }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const next = {};
    if (!form.name.trim()) next.name = "Full name is required";
    if (!EMAIL_RE.test(form.email)) next.email = "Enter a valid email address";
    if (!form.currentTitle.trim()) next.currentTitle = "Current job title is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const { data } = await api.post("/candidates", {
        ...form,
        name: form.name.trim(),
        experienceYears: form.experienceYears ? Number(form.experienceYears) : 0,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      });
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not add candidate");
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Add Candidate"
      onClose={onClose}
      width={560}
      footer={
        <>
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="add-candidate-form" className="btn" disabled={busy}>{busy ? "Saving..." : "Save Candidate"}</button>
        </>
      }
    >
      <form id="add-candidate-form" onSubmit={submit} noValidate>
        {error && <div className="rz-alert error">{error}</div>}
        <h4 style={{ margin: "4px 0 12px", fontSize: 13.5 }}>Personal Information</h4>
        <Field label="Full Name" required error={errors.name}><input value={form.name} onChange={update("name")} placeholder="Enter full name" /></Field>
        <Field label="Email" required error={errors.email}><input type="email" value={form.email} onChange={update("email")} placeholder="Enter email address" /></Field>
        <div className="rz-row2">
          <Field label="Phone"><input value={form.phone} onChange={update("phone")} placeholder="Enter phone number" /></Field>
          <Field label="Current Location"><input value={form.location} onChange={update("location")} placeholder="Enter current location" /></Field>
        </div>
        <h4 style={{ margin: "10px 0 12px", fontSize: 13.5 }}>Professional Information</h4>
        <div className="rz-row2">
          <Field label="Current Job Title" required error={errors.currentTitle}><input value={form.currentTitle} onChange={update("currentTitle")} placeholder="Enter current job title" /></Field>
          <Field label="Experience (years)"><input type="number" min="0" step="0.5" value={form.experienceYears} onChange={update("experienceYears")} placeholder="e.g. 3" /></Field>
        </div>
        <Field label="Current Company"><input value={form.currentCompany} onChange={update("currentCompany")} placeholder="Enter current company" /></Field>
        <Field label="Skills" hint="Separate skills with commas"><input value={form.skills} onChange={update("skills")} placeholder="Figma, React, Node.js" /></Field>
        <div className="rz-row2">
          <Field label="Resume link"><input value={form.resumeUrl} onChange={update("resumeUrl")} placeholder="https://..." /></Field>
          <Field label="Source">
            <select value={form.source} onChange={update("source")}>
              <option value="referral">Referral</option>
              <option value="job_board">Job Board</option>
              <option value="linkedin">LinkedIn</option>
              <option value="career_site">Career Site</option>
              <option value="agency">Agency</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>
      </form>
    </Modal>
  );
}
