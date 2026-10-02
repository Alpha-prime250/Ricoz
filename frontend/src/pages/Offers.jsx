import { useEffect, useState } from "react";
import { FileSignature, Plus } from "lucide-react";
import api from "../api/axios";

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    application: "",
    proposedTitle: "",
    salary: "",
    bonus: "",
    startDate: "",
    expiresAt: "",
  });
  const [error, setError] = useState("");
  const [messageFor, setMessageFor] = useState(null);
  const [message, setMessage] = useState({ channel: "email", subject: "", message: "" });

  const load = async () => {
    const [offersRes, appsRes] = await Promise.all([
      api.get("/offers"),
      api.get("/applications", { params: { stage: "offer" } }),
    ]);
    setOffers(offersRes.data);
    setApplications(appsRes.data);
  };

  useEffect(() => { load(); }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/offers", {
        ...form,
        salary: Number(form.salary),
        bonus: form.bonus ? Number(form.bonus) : 0,
      });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create offer");
    }
  };

  const setStatus = async (id, status) => {
    await api.put(`/offers/${id}/status`, { status });
    load();
  };

  const sendMessage = async (id) => {
    await api.post(`/offers/${id}/communications`, message);
    setMessageFor(null);
    setMessage({ channel: "email", subject: "", message: "" });
    load();
  };

  return (
    <div className="fade-in">
      <div className="topbar">
        <h2>Offers</h2>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : <><Plus size={15} /> Create Offer</>}
        </button>
      </div>

      {showForm && (
        <form className="card" onSubmit={submit}>
          {error && <div className="error">{error}</div>}
          <label>Application (Candidate — Job)</label>
          <select value={form.application} onChange={update("application")} required>
            <option value="">Select...</option>
            {applications.map((a) => (
              <option key={a._id} value={a._id}>{a.candidate?.name} — {a.job?.title}</option>
            ))}
          </select>
          <div className="grid-2">
            <div><label>Proposed Title</label><input value={form.proposedTitle} onChange={update("proposedTitle")} required /></div>
            <div><label>Annual Salary</label><input type="number" value={form.salary} onChange={update("salary")} required /></div>
            <div><label>Bonus</label><input type="number" value={form.bonus} onChange={update("bonus")} /></div>
            <div><label>Start Date</label><input type="date" value={form.startDate} onChange={update("startDate")} /></div>
            <div><label>Expires At</label><input type="date" value={form.expiresAt} onChange={update("expiresAt")} /></div>
          </div>
          <button className="btn" type="submit">Create Offer</button>
        </form>
      )}

      <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Candidate</th><th>Job</th><th>Title</th><th>Salary</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {offers.map((o) => (
            <tr key={o._id}>
              <td>{o.application?.candidate?.name}</td>
              <td>{o.application?.job?.title}</td>
              <td>{o.proposedTitle}</td>
              <td>₹{o.salary?.toLocaleString()}</td>
              <td><span className={`badge ${o.status}`}>{o.status}</span></td>
              <td>
                {o.status === "draft" && <button className="btn small" onClick={() => setMessageFor(o._id)}>Send</button>}
                {o.status === "sent" && (
                  <>
                    <button className="btn small" onClick={() => setStatus(o._id, "accepted")}>Accepted</button>{" "}
                    <button className="btn small secondary" onClick={() => setStatus(o._id, "declined")}>Declined</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {offers.length === 0 && (
        <div className="empty-state">
          <FileSignature size={28} />
          <div>No offers created yet.</div>
        </div>
      )}

      {messageFor && (
        <div className="card">
          <h4>Candidate Communication</h4>
          <label>Channel</label>
          <select value={message.channel} onChange={(e) => setMessage({ ...message, channel: e.target.value })}>
            <option value="email">Email</option>
            <option value="call">Call</option>
            <option value="note">Internal Note</option>
          </select>
          <label>Subject</label>
          <input value={message.subject} onChange={(e) => setMessage({ ...message, subject: e.target.value })} placeholder="Your offer from Ricoz" />
          <label>Message</label>
          <textarea rows="4" value={message.message} onChange={(e) => setMessage({ ...message, message: e.target.value })} />
          <button className="btn" onClick={() => sendMessage(messageFor)}>Send</button>{" "}
          <button className="btn secondary" onClick={() => setMessageFor(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
