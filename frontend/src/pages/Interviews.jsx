import { useEffect, useState } from "react";
import { CalendarClock, Plus } from "lucide-react";
import api from "../api/axios";

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    application: "",
    round: "Round 1",
    type: "technical",
    scheduledAt: "",
    durationMinutes: 45,
    location: "Google Meet",
  });
  const [error, setError] = useState("");
  const [feedbackFor, setFeedbackFor] = useState(null);
  const [feedback, setFeedback] = useState({ feedback: "", score: "", recommendation: "neutral" });

  const load = async () => {
    const [interviewsRes, appsRes] = await Promise.all([
      api.get("/interviews"),
      api.get("/applications"),
    ]);
    setInterviews(interviewsRes.data);
    setApplications(appsRes.data);
  };

  useEffect(() => { load(); }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/interviews", { ...form, durationMinutes: Number(form.durationMinutes) });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not schedule interview");
    }
  };

  const submitFeedback = async (id) => {
    await api.put(`/interviews/${id}/feedback`, {
      ...feedback,
      score: feedback.score ? Number(feedback.score) : undefined,
    });
    setFeedbackFor(null);
    setFeedback({ feedback: "", score: "", recommendation: "neutral" });
    load();
  };

  return (
    <div className="fade-in">
      <div className="topbar">
        <h2>Interviews</h2>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : <><Plus size={15} /> Schedule Interview</>}
        </button>
      </div>

      {showForm && (
        <form className="card" onSubmit={submit}>
          {error && <div className="error">{error}</div>}
          <label>Application (Candidate — Job)</label>
          <select value={form.application} onChange={update("application")} required>
            <option value="">Select...</option>
            {applications.map((a) => (
              <option key={a._id} value={a._id}>
                {a.candidate?.name} — {a.job?.title}
              </option>
            ))}
          </select>
          <div className="grid-2">
            <div><label>Round</label><input value={form.round} onChange={update("round")} /></div>
            <div>
              <label>Type</label>
              <select value={form.type} onChange={update("type")}>
                <option value="phone_screen">Phone Screen</option>
                <option value="technical">Technical</option>
                <option value="assessment">Assessment</option>
                <option value="panel">Panel</option>
                <option value="hr">HR</option>
                <option value="final">Final</option>
              </select>
            </div>
            <div><label>Date & Time</label><input type="datetime-local" value={form.scheduledAt} onChange={update("scheduledAt")} required /></div>
            <div><label>Duration (mins)</label><input type="number" value={form.durationMinutes} onChange={update("durationMinutes")} /></div>
            <div><label>Location / Link</label><input value={form.location} onChange={update("location")} /></div>
          </div>
          <button className="btn" type="submit">Schedule</button>
        </form>
      )}

      <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Candidate</th><th>Job</th><th>Type</th><th>When</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {interviews.map((i) => (
            <tr key={i._id}>
              <td>{i.application?.candidate?.name}</td>
              <td>{i.application?.job?.title}</td>
              <td>{i.type.replace("_", " ")}</td>
              <td>{new Date(i.scheduledAt).toLocaleString()}</td>
              <td><span className={`badge ${i.status === "completed" ? "approved" : "pending"}`}>{i.status}</span></td>
              <td>
                {i.status === "scheduled" && (
                  <button className="btn small" onClick={() => setFeedbackFor(i._id)}>Add Feedback</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {interviews.length === 0 && (
        <div className="empty-state">
          <CalendarClock size={28} />
          <div>No interviews scheduled yet.</div>
        </div>
      )}

      {feedbackFor && (
        <div className="card">
          <h4>Submit Feedback</h4>
          <label>Recommendation</label>
          <select value={feedback.recommendation} onChange={(e) => setFeedback({ ...feedback, recommendation: e.target.value })}>
            <option value="strong_yes">Strong Yes</option>
            <option value="yes">Yes</option>
            <option value="neutral">Neutral</option>
            <option value="no">No</option>
            <option value="strong_no">Strong No</option>
          </select>
          <label>Score (0-10)</label>
          <input type="number" min="0" max="10" value={feedback.score} onChange={(e) => setFeedback({ ...feedback, score: e.target.value })} />
          <label>Notes</label>
          <textarea rows="3" value={feedback.feedback} onChange={(e) => setFeedback({ ...feedback, feedback: e.target.value })} />
          <button className="btn" onClick={() => submitFeedback(feedbackFor)}>Submit</button>{" "}
          <button className="btn secondary" onClick={() => setFeedbackFor(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
