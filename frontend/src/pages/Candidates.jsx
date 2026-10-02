import { useEffect, useState } from "react";
import { Users, Plus, Search } from "lucide-react";
import api from "../api/axios";

const emptyCandidate = {
  name: "",
  email: "",
  phone: "",
  source: "other",
  currentTitle: "",
  currentCompany: "",
  experienceYears: "",
  location: "",
  skills: "",
};

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyCandidate);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const load = async (query = "") => {
    const { data } = await api.get("/candidates", { params: query ? { q: query } : {} });
    setCandidates(data);
  };

  useEffect(() => { load(); }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/candidates", {
        ...form,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : 0,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      });
      setForm(emptyCandidate);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add candidate");
    }
  };

  return (
    <div className="fade-in">
      <div className="topbar">
        <h2>Candidates</h2>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : <><Plus size={15} /> Source Candidate</>}
        </button>
      </div>

      <div className="card" style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Search by name, email, title..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ marginBottom: 0 }}
        />
        <button className="btn secondary" onClick={() => load(q)}><Search size={15} /> Search</button>
      </div>

      {showForm && (
        <form className="card" onSubmit={submit}>
          {error && <div className="error">{error}</div>}
          <div className="grid-2">
            <div><label>Name</label><input value={form.name} onChange={update("name")} required /></div>
            <div><label>Email</label><input type="email" value={form.email} onChange={update("email")} required /></div>
            <div><label>Phone</label><input value={form.phone} onChange={update("phone")} /></div>
            <div>
              <label>Source</label>
              <select value={form.source} onChange={update("source")}>
                <option value="referral">Referral</option>
                <option value="job_board">Job Board</option>
                <option value="linkedin">LinkedIn</option>
                <option value="career_site">Career Site</option>
                <option value="agency">Agency</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div><label>Current Title</label><input value={form.currentTitle} onChange={update("currentTitle")} /></div>
            <div><label>Current Company</label><input value={form.currentCompany} onChange={update("currentCompany")} /></div>
            <div><label>Years of Experience</label><input type="number" value={form.experienceYears} onChange={update("experienceYears")} /></div>
            <div><label>Location</label><input value={form.location} onChange={update("location")} /></div>
          </div>
          <label>Skills (comma separated)</label>
          <input value={form.skills} onChange={update("skills")} placeholder="React, Node.js, MongoDB" />
          <button className="btn" type="submit">Add Candidate</button>
        </form>
      )}

      <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Title</th><th>Source</th><th>Experience</th><th>Skills</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c._id}>
              <td>{c.name}<div className="muted">{c.email}</div></td>
              <td>{c.currentTitle} {c.currentCompany && `@ ${c.currentCompany}`}</td>
              <td>{c.source.replace("_", " ")}</td>
              <td>{c.experienceYears} yrs</td>
              <td>{c.skills?.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {candidates.length === 0 && (
        <div className="empty-state">
          <Users size={28} />
          <div>No candidates sourced yet.</div>
        </div>
      )}
    </div>
  );
}
