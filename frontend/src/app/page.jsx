import Link from "next/link";
import { Check } from "lucide-react";
import LandingNav from "@/components/landing/LandingNav";
import { lifecycle, stages, details, roles, faqs } from "@/components/landing/content";
import "@/styles/landing.css";

export const metadata = {
  title: "RicozRecruit — Hire from requisition to signed offer",
  description:
    "Approvals, candidates, interviews and offers in one recruiting workspace for recruiters, hiring managers and admins.",
};

export default function LandingPage() {
  return (
    <div className="lp">
      <LandingNav />

      <main>
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <h1>Take every hire from requisition to signed offer in one place</h1>
            <p>
              RicozRecruit keeps approvals, candidates, interviews and offers in a single
              workspace, so nobody has to ask where a hire stands.
            </p>
            <div className="lp-cta-row">
              <Link href="/login" className="btn">Open the demo workspace</Link>
              <a href="#lifecycle" className="btn secondary">See how it works</a>
            </div>
            <p className="lp-fine">Demo login: admin@ricozrecruit.com / password123</p>
          </div>

          <div
            className="lp-board"
            role="img"
            aria-label="Sample recruitment pipeline with candidates in each stage from applied to hired"
          >
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

        <section className="lp-section" id="details">
          <div className="lp-section-head">
            <h2>Small details that save follow-ups</h2>
          </div>
          <ul className="lp-details">
            {details.map((d) => (
              <li key={d}>
                <Check size={16} aria-hidden="true" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
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
          <Link href="/login" className="btn">Open the demo workspace</Link>
        </section>
      </main>

      <footer className="lp-footer">
        <span>RicozRecruit</span>
        <Link href="/login">Sign in</Link>
        <Link href="/register">Create account</Link>
      </footer>
    </div>
  );
}
