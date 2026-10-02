import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Users, CalendarClock, FileSignature } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@ricozrecruit.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <h1>Ricoz<span style={{ fontWeight: 400 }}>Recruit</span></h1>
        <p>
          One workspace for the full recruitment lifecycle — from opening a
          requisition to sending the offer letter.
        </p>
        <ul>
          <li><Briefcase size={18} /> Job requisitions with built-in approval workflow</li>
          <li><Users size={18} /> Candidate sourcing across referrals, LinkedIn & job boards</li>
          <li><CalendarClock size={18} /> Interview scheduling with structured feedback</li>
          <li><FileSignature size={18} /> Offer management & candidate communication log</li>
        </ul>
      </div>
      <div className="auth-form-side">
        <form className="auth-box fade-in" onSubmit={submit}>
          <h2>Welcome back</h2>
          <p className="muted" style={{ marginBottom: 20 }}>Sign in to your recruiting workspace</p>
          {error && <div className="error">{error}</div>}
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" required />
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required />
          <button className="btn" style={{ width: "100%", justifyContent: "center" }} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="muted" style={{ marginTop: 16, textAlign: "center" }}>
            No account? <Link to="/register">Register</Link>
          </p>
          <div className="seed-hint">
            Demo login: <strong>admin@ricozrecruit.com</strong> / password123
          </div>
        </form>
      </div>
    </div>
  );
}
