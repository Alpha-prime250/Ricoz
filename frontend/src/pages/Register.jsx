import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "recruiter", department: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <h1>Join Ricoz<span style={{ fontWeight: 400 }}>Recruit</span></h1>
        <p>Set up your recruiter, hiring manager, or admin account in seconds.</p>
        <ul>
          <li><ShieldCheck size={18} /> Role-based access for recruiters, hiring managers & admins</li>
          <li><Sparkles size={18} /> Every requisition, candidate & offer in one pipeline view</li>
        </ul>
      </div>
      <div className="auth-form-side">
        <form className="auth-box fade-in" onSubmit={submit}>
          <h2>Create account</h2>
          {error && <div className="error">{error}</div>}
          <label>Name</label>
          <input value={form.name} onChange={update("name")} autoComplete="name" required />
          <label>Email</label>
          <input value={form.email} onChange={update("email")} type="email" autoComplete="username" required />
          <label>Password</label>
          <input value={form.password} onChange={update("password")} type="password" autoComplete="new-password" required minLength={6} />
          <label>Role</label>
          <select value={form.role} onChange={update("role")}>
            <option value="recruiter">Recruiter</option>
            <option value="hiring_manager">Hiring Manager</option>
            <option value="admin">Admin</option>
          </select>
          <label>Department</label>
          <input value={form.department} onChange={update("department")} />
          <button className="btn" style={{ width: "100%", justifyContent: "center" }} type="submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
          <p className="muted" style={{ marginTop: 16, textAlign: "center" }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
