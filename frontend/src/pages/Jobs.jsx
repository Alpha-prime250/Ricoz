import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Plus } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyJob = {
  title: "",
  department: "",
  location: "",
  employmentType: "full_time",
  openings: 1,
  minSalary: "",
  maxSalary: "",
  description: "",
};

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyJob);
  const [error, setError] = useState("");

  const canApprove = ["admin", "hiring_manager"].includes(user?.role);

  const load = async () => {
    const { data } = await api.get("/jobs");
    setJobs(data);
  };

  useEffect(() => { load(); }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/jobs", {
        ...form,
        openings: Number(form.openings),
        minSalary: form.minSalary ? Number(form.minSalary) : undefined,
        maxSalary: form.maxSalary ? Number(form.maxSalary) : undefined,
        requirements: [],
        skills: [],
      });
      setForm(emptyJob);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create requisition");
    }
  };

  const decide = async (id, decision) => {
    await api.put(`/jobs/${id}/approval`, { decision });
    load();
  };

  return (
    <div className="fade-in">
      <div className="topbar">
        <h2>Job Requisitions</h2>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : <><Plus size={15} /> New Requisition</>}
        </button>
      </div>

      {showForm && (
        <form className="card" onSubmit={submit}>
          {error && <div className="error">{error}</div>}
          <div className="grid-2">
            <div>
              <label>Job Title</label>
              <input value={form.title} onChange={update("title")} required />
            </div>
            <div>
              <label>Department</label>
              <input value={form.department} onChange={update("department")} required />
            </div>
            <div>
              <label>Location</label>
              <input value={form.location} onChange={update("location")} required />
            </div>
            <div>
              <label>Employment Type</label>
              <select value={form.employmentType} onChange={update("employmentType")}>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label>Openings</label>
              <input type="number" min="1" value={form.openings} onChange={update("openings")} />
            </div>
            <div>
              <label>Salary Range</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input placeholder="Min" type="number" value={form.minSalary} onChange={update("minSalary")} />
                <input placeholder="Max" type="number" value={form.maxSalary} onChange={update("maxSalary")} />
              </div>
            </div>
          </div>
          <label>Description</label>
          <textarea rows="3" value={form.description} onChange={update("description")} required />
          <button className="btn" type="submit">Submit Requisition</button>
        </form>
      )}

      <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Department</th>
            <th>Location</th>
            <th>Approval</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j._id}>
              <td><Link to={`/jobs/${j._id}`}>{j.title}</Link></td>
              <td>{j.department}</td>
              <td>{j.location}</td>
              <td><span className={`badge ${j.approvalStatus}`}>{j.approvalStatus}</span></td>
              <td><span className={`badge ${j.status}`}>{j.status}</span></td>
              <td>
                {canApprove && j.approvalStatus === "pending" && (
                  <>
                    <button className="btn small" onClick={() => decide(j._id, "approved")}>Approve</button>{" "}
                    <button className="btn small secondary" onClick={() => decide(j._id, "rejected")}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {jobs.length === 0 && (
        <div className="empty-state">
          <Briefcase size={28} />
          <div>No job requisitions yet.</div>
        </div>
      )}
    </div>
  );
}
