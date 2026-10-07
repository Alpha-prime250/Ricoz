import { useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, ArrowUpRight, Check } from "lucide-react";
import api from "../api/axios";
import { useTheme } from "../context/ThemeContext";
import {
  FRANCHISE_URL,
  lifecycle,
  stages,
  roles,
  franchiseFacts,
  franchiseStates,
  franchiseSteps,
  faqs,
} from "./landingContent";
import "../styles/landing.css";

const emptyForm = { name: "", email: "", phone: "", city: "", state: "", investmentRange: "", message: "" };

function FranchiseForm() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", message: "" });
    try {
      const { data } = await api.post("/enquiries", { ...form, type: "franchise" });
      setStatus({ state: "done", message: data.message });
      setForm(emptyForm);
    } catch (err) {
      setStatus({
        state: "error",
        message: err.response?.data?.message || "Could not send your enquiry. Check your connection and try again.",
      });
    }
  };

  if (status.state === "done") {
    return (
      <div className="lp-form lp-form-done" role="status">
        <span className="lp-done-icon"><Check size={20} /></span>
        <h3>Enquiry sent</h3>
        <p>{status.message}</p>
        <button className="btn secondary" onClick={() => setStatus({ state: "idle", message: "" })}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form className="lp-form" onSubmit={submit}>
      <h3>Franchise enquiry</h3>
      {status.state === "error" && <div className="error" role="alert">{status.message}</div>}
      <div className="lp-form-grid">
        <div>
          <label htmlFor="fe-name">Full name</label>
          <input id="fe-name" value={form.name} onChange={set("name")} required autoComplete="name" />
        </div>
        <div>
          <label htmlFor="fe-email">Email</label>
          <input id="fe-email" type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="fe-phone">Phone</label>
          <input id="fe-phone" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="fe-city">City</label>
          <input id="fe-city" value={form.city} onChange={set("city")} autoComplete="address-level2" />
        </div>
        <div>
          <label htmlFor="fe-state">State</label>
          <select id="fe-state" value={form.state} onChange={set("state")}>
            <option value="">Select a state</option>
            {franchiseStates.map((s) => <option key={s}>{s}</option>)}
            <option>Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="fe-invest">Planned investment</label>
          <select id="fe-invest" value={form.investmentRange} onChange={set("investmentRange")}>
            <option value="">Select a range</option>
            <option>₹2–3 lakh</option>
            <option>₹3–5 lakh</option>
            <option>Above ₹5 lakh</option>
          </select>
        </div>
      </div>
      <label htmlFor="fe-msg">Anything you want to ask?</label>
      <textarea id="fe-msg" rows={3} value={form.message} onChange={set("message")} maxLength={1500} />
      <button className="btn" type="submit" disabled={status.state === "sending"}>
        {status.state === "sending" ? "Sending..." : "Send enquiry"}
      </button>
    </form>
  );
}

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="lp">
      <header className="lp-nav">
        <Link to="/welcome" className="lp-brand">Ricoz<span>Recruit</span></Link>
        <nav className="lp-links" aria-label="Sections">
          <a href="#lifecycle">How it works</a>
          <a href="#teams">Teams</a>
          <a href="#franchise">Franchise</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="lp-nav-actions">
          <button className="lp-icon-btn" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/login" className="lp-signin">Sign in</Link>
          <Link to="/register" className="btn small">Create account</Link>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <h1>Take every hire from requisition to signed offer in one place</h1>
            <p>
              RicozRecruit keeps approvals, candidates, interviews and offers in a single
              workspace, so nobody has to ask where a hire stands.
            </p>
            <div className="lp-cta-row">
              <Link to="/login" className="btn">Open the demo workspace</Link>
              <a href="#franchise" className="btn secondary">Partner with Ricoz</a>
            </div>
            <p className="lp-fine">Demo login: admin@ricozrecruit.com / password123</p>
          </div>

          <div className="lp-board" role="img" aria-label="Sample recruitment pipeline with candidates in each stage from applied to hired">
            {stages.map((s, col) => (
              <div className="lp-col" key={s.name}>
                <div className="lp-col-head">
                  <span>{s.name}</span>
                  <b>{s.people.length}</b>
                </div>
                {s.people.map((p, i) => (
                  <div
                    className={"lp-chip" + (s.name === "Hired" ? " hired" : "")}
                    key={p}
                    style={{ animationDelay: `${col * 90 + i * 70}ms` }}
                  >
                    {p}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="lp-section" id="lifecycle">
          <div className="lp-section-head">
            <h2>One workflow, four steps</h2>
            <p>Each step hands over to the next, so the pipeline always reflects what actually happened.</p>
          </div>
          <ol className="lp-steps">
            {lifecycle.map((l, i) => (
              <li key={l.title}>
                <span className="lp-step-num">{i + 1}</span>
                <div>
                  <h3>{l.title}</h3>
                  <p>{l.body}</p>
                </div>
                <span className="lp-step-tag">{l.tag}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="lp-section" id="teams">
          <div className="lp-section-head">
            <h2>Built for the whole hiring team</h2>
            <p>Three roles share one pipeline, each with the permissions it needs.</p>
          </div>
          <dl className="lp-roles">
            {roles.map((r) => (
              <div key={r.role}>
                <dt>{r.role}</dt>
                <dd>{r.does}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="lp-franchise" id="franchise">
          <div className="lp-franchise-inner">
            <div className="lp-franchise-copy">
              <h2>Open a Ricoz franchise</h2>
              <p className="lp-lead">
                Ricoz is a digital marketing services company that began franchising in 2025.
                Its tagline: driving excellence in innovation, one technology at a time.
              </p>

              <dl className="lp-facts">
                {franchiseFacts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>

              <p>
                Ricoz is looking for partners in {franchiseStates.join(", ")} and 33 more locations.
              </p>

              <h3>How it works</h3>
              <ol className="lp-mini-steps">
                {franchiseSteps.map((s, i) => (
                  <li key={s.title}>
                    <span className="lp-step-num small">{i + 1}</span>
                    <div>
                      <strong>{s.title}</strong>
                      <span>{s.body}</span>
                    </div>
                  </li>
                ))}
              </ol>

              <a className="lp-ext" href={FRANCHISE_URL} target="_blank" rel="noopener noreferrer">
                Read the full franchise page <ArrowUpRight size={15} />
              </a>
            </div>
            <FranchiseForm />
          </div>
        </section>

        <section className="lp-section" id="faq">
          <div className="lp-section-head">
            <h2>Questions people ask</h2>
          </div>
          <div className="lp-faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="lp-final">
          <h2>See the pipeline with real sample data</h2>
          <p>The demo workspace has jobs, candidates, interviews and offers ready to explore.</p>
          <Link to="/login" className="btn">Open the demo workspace</Link>
        </section>
      </main>

      <footer className="lp-footer">
        <span>RicozRecruit</span>
        <a href={FRANCHISE_URL} target="_blank" rel="noopener noreferrer">ricoz.in/franchise</a>
        <Link to="/login">Sign in</Link>
      </footer>
    </div>
  );
}