"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/api/axios";
import { Field } from "@/components/AuthParts";
import { requisitionId } from "@/lib/format";

const EXPERIENCE = ["0 - 1 years", "1 - 3 years", "2 - 4 years", "3 - 5 years", "5 - 8 years", "8+ years"];

const empty = {
  title: "", department: "", location: "", employmentType: "full_time", openings: 1,
  minSalary: "", maxSalary: "", description: "", requirements: "", skills: "",
  hiringManager: "", experienceRequired: "",
};

// Shared by "Create Job Requisition" and "Edit Job Requisition" (design: Day 5 screens 2 and 4).
export default function JobForm({ job }) {
  const router = useRouter();
  const editing = Boolean(job);
  const [form, setForm] = useState(empty);
  const [managers, setManagers] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/users").then(({ data }) => setManagers(data.filter((u) => ["hiring_manager", "admin"].includes(u.role)))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!job) return;
    setForm({
      title: job.title, department: job.department, location: job.location,
      employmentType: job.employmentType, openings: job.openings,
      minSalary: job.minSalary ?? "", maxSalary: job.maxSalary ?? "",
      description: job.description, requirements: (job.requirements || []).join("\n"),
      skills: (job.skills || []).join(", "),
      hiringManager: job.hiringManager?._id || "", experienceRequired: job.experienceRequired || "",
    });
  }, [job]);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const next = {};
    if (!form.title.trim()) next.title = "Job title is required";
    if (!form.department.trim()) next.department = "Department is required";
    if (!form.location.trim()) next.location = "Location is required";
    if (!form.description.trim()) next.description = "Add a job description";
    if (form.minSalary && form.maxSalary && Number(form.minSalary) > Number(form.maxSalary)) next.salary = "Min salary can't exceed max salary";
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = {
      title: form.title.trim(), department: form.department.trim(), location: form.location.trim(),
      employmentType: form.employmentType, openings: Number(form.openings) || 1,
      minSalary: form.minSalary ? Number(form.minSalary) : undefined,
      maxSalary: form.maxSalary ? Number(form.maxSalary) : undefined,
      description: form.description,
      requirements: form.requirements.split("\n").map((s) => s.trim()).filter(Boolean),
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      experienceRequired: form.experienceRequired,
      ...(form.hiringManager ? { hiringManager: form.hiringManager } : {}),
    };
    setBusy(true);
    try {
      if (editing) {
        await api.put(`/jobs/${job._id}`, payload);
        router.push(`/jobs/${job._id}`);
      } else {
        await api.post("/jobs", payload);
        router.push("/jobs");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the requisition");
      setBusy(false);
    }
  };

  return (
    <div className="fade-in">
      <button className="rz-back" onClick={() => router.back()}>← Back</button>
      <div className="rz-head"><div><h2>{editing ? "Edit Job Requisition" : "Create Job Requisition"}</h2></div></div>

      <form className="rz-panel rz-form-card" onSubmit={submit} noValidate>
        {error && <div className="rz-alert error">{error}</div>}
        <div className="rz-row2">
          <Field label="Job Title" required error={errors.title}>
            <input value={form.title} onChange={update("title")} placeholder="e.g. Senior UI/UX Designer" />
          </Field>
          <Field label="Requisition ID">
            <input value={editing ? requisitionId(job) : "Auto-generated"} disabled readOnly />
          </Field>
          <Field label="Department" required error={errors.department}>
            <input value={form.department} onChange={update("department")} placeholder="e.g. Design" />
          </Field>
          <Field label="Hiring Manager">
            <select value={form.hiringManager} onChange={update("hiringManager")}>
              <option value="">Select hiring manager</option>
              {managers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Location" required error={errors.location}>
            <input value={form.location} onChange={update("location")} placeholder="e.g. Bangalore, India" />
          </Field>
          <Field label="Employment Type">
            <select value={form.employmentType} onChange={update("employmentType")}>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </Field>
          <Field label="Number of Openings">
            <input type="number" min="1" value={form.openings} onChange={update("openings")} />
          </Field>
          <Field label="Experience Required">
            <select value={form.experienceRequired} onChange={update("experienceRequired")}>
              <option value="">Select experience</option>
              {EXPERIENCE.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Salary Range (INR)" error={errors.salary}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="number" placeholder="Min salary" value={form.minSalary} onChange={update("minSalary")} />
            <span className="muted">to</span>
            <input type="number" placeholder="Max salary" value={form.maxSalary} onChange={update("maxSalary")} />
          </div>
        </Field>

        <Field label="Job Description" required error={errors.description}>
          <div className="rz-rte">
            <div className="rz-rte-bar"><span>B</span><span style={{ fontStyle: "italic" }}>I</span><span style={{ textDecoration: "underline" }}>U</span></div>
            <textarea rows={5} value={form.description} onChange={update("description")} placeholder="Enter a detailed job description" />
          </div>
        </Field>

        <div className="rz-row2">
          <Field label="Requirements" hint="One requirement per line">
            <textarea rows={5} value={form.requirements} onChange={update("requirements")} placeholder="Enter requirements" />
          </Field>
          <Field label="Skills" hint="Separate skills with commas">
            <textarea rows={5} value={form.skills} onChange={update("skills")} placeholder="Figma, Adobe XD, Prototyping" />
          </Field>
        </div>

        <div className="rz-form-actions">
          <button type="button" className="btn secondary" onClick={() => router.back()}>Cancel</button>
          <button className="btn" type="submit" disabled={busy}>{busy ? "Saving..." : editing ? "Update" : "Submit for Approval"}</button>
        </div>
      </form>
    </div>
  );
}
