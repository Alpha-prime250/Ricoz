import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Spinner from "../components/Spinner";

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [jobRes, pipelineRes, candRes] = await Promise.all([
      api.get(`/jobs/${id}`),
      api.get(`/applications/pipeline/${id}`),
      api.get("/candidates"),
    ]);
    setJob(jobRes.data);
    setPipeline(pipelineRes.data);
    setCandidates(candRes.data);
  };

  useEffect(() => { load(); }, [id]);

  const addToPipeline = async () => {
    if (!selectedCandidate) return;
    setError("");
    try {
      await api.post("/applications", { job: id, candidate: selectedCandidate });
      setSelectedCandidate("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add candidate");
    }
  };

  const moveStage = async (appId, stage) => {
    await api.put(`/applications/${appId}/stage`, { stage });
    load();
  };

  if (!job || !pipeline) return <Spinner label="Loading job..." />;

  return (
    <div className="fade-in">
      <h2>{job.title}</h2>
      <p className="muted">{job.department} · {job.location} · {job.openings} opening(s)</p>
      <p>{job.description}</p>
      <div style={{ marginBottom: 8 }}>
        <span className={`badge ${job.approvalStatus}`}>{job.approvalStatus}</span>{" "}
        <span className={`badge ${job.status}`}>{job.status}</span>
      </div>

      <div className="card" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {error && <div className="error">{error}</div>}
        <select value={selectedCandidate} onChange={(e) => setSelectedCandidate(e.target.value)} style={{ marginBottom: 0, flex: 1 }}>
          <option value="">Add candidate to pipeline...</option>
          {candidates.map((c) => (
            <option key={c._id} value={c._id}>{c.name} — {c.currentTitle || "N/A"}</option>
          ))}
        </select>
        <button className="btn" onClick={addToPipeline}>Add</button>
      </div>

      <h3>Pipeline</h3>
      <div className="pipeline-board">
        {pipeline.stages.map((stage) => (
          <div className="pipeline-col" key={stage}>
            <h4>{stage.replace("_", " ")} ({pipeline.board[stage].length})</h4>
            {pipeline.board[stage].map((app) => (
              <div className="pipeline-card" key={app._id}>
                <strong>{app.candidate?.name}</strong>
                <div className="muted">{app.candidate?.currentTitle}</div>
                <select
                  value={app.stage}
                  onChange={(e) => moveStage(app._id, e.target.value)}
                  style={{ marginTop: 6, marginBottom: 0, fontSize: 12 }}
                >
                  {pipeline.stages.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
