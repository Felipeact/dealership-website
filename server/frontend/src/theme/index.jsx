import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "@fontsource/b612/400.css";
import "@fontsource/b612/700.css";
import "@fontsource/b612-mono/400.css";
import "@fontsource/b612-mono/700.css";
import "../core/shared.css";
import "./theme.css";
import { FAILURE, LANES, NAV_LINKS, REPO_URL, STEPS, laneName } from "../core/content";
import { HOPS, SERVICES, hopStates, sentimentOf, signed, useSampleReviews, useSystemStatus } from "../core/api";
import { useAnalyzerForm } from "../core/analyzerForm";
import { useSession, usePageTitle } from "../core/kit";
import { Mark } from "../core/ui";

// ---- Layout ---------------------------------------------------------------------------------

const Layout = ({ children, page }) => {
  const { username, logoutState, logout } = useSession();
  const [open, setOpen] = useState(false);
  return (
    <div className="b-root" data-page={page}>
      <a href="#main" className="x-skip">Skip to content</a>
      <header className="b-header" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
        <div className="b-bar">
          <Link to="/" className="b-wordmark">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M12 12 17 7.5" strokeLinecap="round" />
              <path d="M12 3v2.2M21 12h-2.2M3 12h2.2" strokeLinecap="round" />
            </svg>
            Dealerships
          </Link>
          <nav aria-label="Main" className="b-nav" id="b-nav" data-open={open}>
            {NAV_LINKS.map((l) => (
              <NavLink key={l.href} to={l.href} onClick={() => setOpen(false)}>{l.label}</NavLink>
            ))}
          </nav>
          <div className="b-session">
            {username ? (
              <>
                <span className="b-who">{logoutState === "error" ? "Couldn't log out. Try again." : username}</span>
                <button type="button" className="b-key" onClick={logout} aria-disabled={logoutState === "pending"}>
                  {logoutState === "pending" ? "Logging out…" : "Log out"}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="b-key">Log in</Link>
                <Link to="/register" className="b-key b-key--lit">Register</Link>
              </>
            )}
            <button type="button" className="b-burger" aria-expanded={open} aria-controls="b-nav" onClick={() => setOpen((o) => !o)}>
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
              </svg>
            </button>
          </div>
        </div>
      </header>
      {children}
      <footer className="b-footer">
        <div className="b-footer-row">
          <p>© {new Date().getFullYear()} Dealerships · All dealers and reviews are fictional</p>
          <nav aria-label="Footer">
            {NAV_LINKS.map((l) => <Link key={l.href} to={l.href}>{l.label}</Link>)}
            <a href={REPO_URL}>Source</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

// ---- Dial -----------------------------------------------------------------------------------

// A round gauge: ticks, a damped needle and a placard. `value` is 0..1 or null (needle parked, no data).
const SWEEP = 270;
const Dial = ({ placard, value, readout, sub, lamp = "ok", scale, size = "md", label }) => {
  const parked = value == null;
  const angle = parked ? -SWEEP / 2 : -SWEEP / 2 + Math.max(0, Math.min(1, value)) * SWEEP;
  const ticks = Array.from({ length: 31 }, (_, i) => i);
  return (
    <figure className={`b-dial b-dial--${size}`} data-lamp={lamp}>
      <svg viewBox="0 0 200 200" role="img" aria-label={label ?? `${placard}: ${readout}`}>
        <circle cx="100" cy="100" r="96" className="b-dial-bezel" />
        <circle cx="100" cy="100" r="88" className="b-dial-face" />
        {ticks.map((i) => {
          const a = (-SWEEP / 2 + (i / 30) * SWEEP) * (Math.PI / 180);
          const major = i % 5 === 0;
          const r1 = major ? 70 : 76;
          return (
            <line
              key={i}
              x1={100 + Math.sin(a) * r1} y1={100 - Math.cos(a) * r1}
              x2={100 + Math.sin(a) * 83} y2={100 - Math.cos(a) * 83}
              className={major ? "b-tick b-tick--major" : "b-tick"}
            />
          );
        })}
        {scale?.map((s) => {
          const a = (-SWEEP / 2 + s.at * SWEEP) * (Math.PI / 180);
          return (
            <text key={s.text} x={100 + Math.sin(a) * 58} y={100 - Math.cos(a) * 58 + 3.5} className="b-scale" textAnchor="middle">
              {s.text}
            </text>
          );
        })}
        <g className="b-needle" style={{ transform: `rotate(${angle}deg)`, transformOrigin: "100px 100px" }} data-parked={parked}>
          <path d="M100 100 L97 40 L100 22 L103 40Z" />
          <path d="M100 100 L100 118" className="b-needle-tail" />
        </g>
        <circle cx="100" cy="100" r="7" className="b-hub" />
      </svg>
      <figcaption>
        <span className="b-placard">{placard}</span>
        <b className="b-readout">{readout}</b>
        {sub && <span className="b-sub">{sub}</span>}
      </figcaption>
    </figure>
  );
};

// ---- Panel (hero) ---------------------------------------------------------------------------

const Panel = () => {
  const [status, retry] = useSystemStatus();
  const f = useAnalyzerForm();
  const { state } = f;
  const r = state.result;
  const ready = status.status === "ready";
  const sv = ready ? status.services : {};
  const svc = (id) => {
    const h = sv[id];
    if (!ready || h === undefined) return { value: null, readout: ready ? "UNKN" : "···", lamp: "unknown", sub: ready ? "no reading" : "checking" };
    if (!h.ok) return { value: 0, readout: "OFF", lamp: "fail", sub: "offline" };
    return { value: h.ms != null ? Math.min(h.ms, 200) / 200 : 0.2, readout: h.ms != null ? `${h.ms}` : "UP", lamp: "ok", sub: h.ms != null ? "ms" : "responding" };
  };
  const dj = svc("django");
  const ex = svc("express");
  const fl = svc("flask");
  const net = ready ? status.network : null;
  const pending = f.pending;
  const sentimentLamp = !r ? "unknown" : f.stale || pending ? "caution" : sentimentOf(r.sentiment) === "negative" ? "fail" : "ok";
  const down = ready ? (sv.django?.ok ? SERVICES.filter((s) => sv[s.id] && !sv[s.id].ok) : [SERVICES[0]]) : [];
  const hops = hopStates(state);

  return (
    <section className="b-panel" aria-labelledby="b-panel-title">
      <h2 id="b-panel-title" className="sr-only">Instrument panel: sentiment analyzer and live service status</h2>
      <div className="b-six">
        <Dial
          size="lg" placard="Sentiment" lamp={sentimentLamp}
          value={r?.scores ? (r.scores.compound + 1) / 2 : null}
          readout={r ? sentimentOf(r.sentiment).toUpperCase() : "···"}
          sub={r?.scores ? `compound ${signed(r.scores.compound)}` : "no reading"}
          scale={[{ at: 0, text: "−1" }, { at: 0.5, text: "0" }, { at: 1, text: "+1" }]}
          label={r ? `Sentiment ${sentimentOf(r.sentiment)}, compound ${signed(r.scores?.compound ?? 0)}` : "Sentiment, no reading yet"}
        />
        <Dial
          placard="Round trip" lamp={r ? "ok" : "unknown"} value={r ? Math.min(r.roundTripMs, 1000) / 1000 : null}
          readout={r ? `${r.roundTripMs}` : "···"} sub="ms · browser → Flask"
          scale={[{ at: 0, text: "0" }, { at: 1, text: "1s" }]}
        />
        <Dial
          placard="Dealers" lamp={net ? "ok" : "unknown"} value={net ? Math.min(net.dealers, 60) / 60 : null}
          readout={net ? `${net.dealers}` : "···"} sub={net ? `in ${net.states} states · MongoDB` : "no reading"}
          scale={[{ at: 0, text: "0" }, { at: 1, text: "60" }]}
        />
        <Dial placard="Django" size="sm" {...dj} scale={[{ at: 0, text: "0" }, { at: 1, text: "200" }]} />
        <Dial placard="Express" size="sm" {...ex} scale={[{ at: 0, text: "0" }, { at: 1, text: "200" }]} />
        <Dial placard="Flask" size="sm" {...fl} scale={[{ at: 0, text: "0" }, { at: 1, text: "200" }]} />
      </div>

      {down.length > 0 && (
        <p className="b-caution" role="status">
          <span className="b-lamp" aria-hidden="true" />
          {down.map((s) => `${s.name.split(" ")[0]} is offline, so ${s.lost}.`).join(" ")}{" "}
          <button type="button" className="b-linkbtn" onClick={retry}>Check again</button>
        </p>
      )}

      <form className="b-console" onSubmit={f.submit} noValidate>
        <div className="b-console-head">
          <label htmlFor="b-an-text" className="b-placard">Review text · NLTK VADER</label>
          <ol className="b-hops" aria-label="Request path for this analysis">
            {HOPS.map((h) => (
              <li key={h.id} data-state={hops[h.id]}>
                <i aria-hidden="true" />{h.name}
                <span className="sr-only">: {hops[h.id] === "idle" ? "not reached" : hops[h.id] === "active" ? "working" : hops[h.id]}</span>
              </li>
            ))}
          </ol>
        </div>
        <textarea
          id="b-an-text" rows={3} className="b-an-text" value={f.text}
          onChange={(e) => f.onChange(e.target.value)} onKeyDown={f.onKeyDown}
          aria-invalid={Boolean(f.message) || f.tooLong}
          aria-describedby={f.message ? "b-an-count b-an-error" : "b-an-count"}
          placeholder="Write a sentence about a dealership…"
        />
        <div className="b-chips">
          {f.examples.map((ex2) => (
            <button key={ex2.label} type="button" className="b-chip" aria-pressed={f.text === ex2.text} onClick={() => f.pickExample(ex2)}>
              {ex2.label}
            </button>
          ))}
        </div>
        {f.message && <p id="b-an-error" className="x-error">{f.message}</p>}
        <div className="b-console-row">
          <span id="b-an-count" className={`b-count ${f.tooLong ? "is-over" : ""}`}>
            <span className="sr-only">Characters used: </span>{f.trimmed.length}/{f.max}
          </span>
          <span className="b-count b-hint" aria-hidden="true">Ctrl ↵ to run</span>
          <button type="submit" className="x-btn x-btn--primary" aria-disabled={pending}>{pending ? "Analyzing…" : "Analyze"}</button>
        </div>
        <div ref={f.resultRef} tabIndex={-1} className="b-result" aria-label="Analysis result">
          {r && (state.phase === "done" || state.phase === "pending") && (
            <p className="b-result-line">
              <Mark value={r.sentiment} score={r.scores?.compound} />
              {r.scores && (
                <span className="b-fine">
                  words {Math.round(r.scores.pos * 100)}% pos · {Math.round(r.scores.neu * 100)}% neu · {Math.round(r.scores.neg * 100)}% neg · Django → Flask {r.analyzer_ms} ms
                </span>
              )}
              {f.stale && !pending && <span className="b-fine b-flag">Text edited · press Analyze to update</span>}
              {pending && <span className="b-fine b-flag">Analyzing…</span>}
              {!f.stale && !pending && f.but && (
                <span className="b-fine">
                  Known VADER blind spot: it weighs the clause after “but” more heavily, so mixed reviews often read {r.sentiment === "negative" ? "negative" : "positive"}.
                </span>
              )}
            </p>
          )}
          {state.phase === "pending" && !r && <p className="b-fine">Analyzing…</p>}
          {f.failure && (
            <div className="b-fail">
              <p>{f.failure}</p>
              <button type="button" className="x-btn x-btn--ghost" onClick={f.retry}>Try again</button>
            </div>
          )}
        </div>
        <p className="sr-only" aria-live="polite">{f.announcement}</p>
      </form>
    </section>
  );
};

// ---- Sections -------------------------------------------------------------------------------

const Samples = () => {
  const [state, retry] = useSampleReviews();
  const failure = state.status === "error";
  return (
    <section className="b-section" aria-labelledby="b-samples-title">
      <h2 id="b-samples-title" className="b-h2">Straight from the database</h2>
      <p className="b-lede">Three stored reviews, one for each label. The labels aren't saved with the reviews: Flask works them out each time the page asks.</p>
      {state.status === "loading" && (
        <ul className="b-annun" aria-busy="true" aria-label="Loading sample reviews">
          {[0, 1, 2].map((i) => <li key={i} className="b-annun-card b-annun-card--sk" style={{ "--i": i }} />)}
        </ul>
      )}
      {state.status === "ready" && state.data.length > 0 && (
        <ul className="b-annun">
          {state.data.map((rv) => (
            <li key={rv.id} className="b-annun-card" data-s={sentimentOf(rv.sentiment)}>
              <div className="b-annun-top">
                <Mark value={rv.sentiment} />
                {rv.scores && <span className="b-num">{signed(rv.scores.compound)}</span>}
              </div>
              <blockquote><p>“{rv.review}”</p></blockquote>
              <p className="b-annun-by"><b>{rv.name}</b> {rv.purchase ? "bought" : "looked at"} a {rv.car}</p>
              <Link to={`/dealer/${rv.dealership}`} className="b-link">{rv.dealer_name ?? `Dealer #${rv.dealership}`}</Link>
            </li>
          ))}
        </ul>
      )}
      {(failure || (state.status === "ready" && state.data.length === 0)) && (
        <div className="x-note">
          <p>{failure ? FAILURE.django_unreachable : "There are no reviews in the database yet."}</p>
          {failure && <button type="button" className="x-btn x-btn--ghost" onClick={retry}>Try again</button>}
        </div>
      )}
    </section>
  );
};

const SystemMap = () => (
  <section className="b-section" aria-labelledby="b-sys-title">
    <h2 id="b-sys-title" className="b-h2">What happens when you open a dealer's reviews</h2>
    <p className="b-lede">Four services take part every time. This is the real request path for one dealer (number 15), in the order the code runs it.</p>
    <ul className="b-lanes">
      {LANES.map((l) => (
        <li key={l.id}>
          <span className="b-placard">{l.tech}</span>
          <b>{l.name}</b>
          <p>{l.role}</p>
        </li>
      ))}
    </ul>
    <ol className="b-steps">
      {STEPS.map((s, i) => (
        <li key={i} data-reply={s.reply ? "true" : undefined}>
          <span className="b-num">{i + 1}</span>
          <span className="b-step-path">
            {laneName(s.from)} <i aria-hidden="true">{s.reply ? "⇢" : "→"}</i>
            <span className="sr-only">{s.reply ? "replies to" : "calls"}</span> {laneName(s.to)}
          </span>
          <code>{s.call}</code>
        </li>
      ))}
    </ol>
  </section>
);

const Home = () => {
  const { username } = useSession();
  usePageTitle(null);
  return (
    <Layout page="home">
      <main id="main" className="b-main">
        <section className="b-hero">
          <div className="b-hero-copy">
            <h1 className="b-h1">Dealer reviews, scored by what owners actually wrote.</h1>
            <p className="b-hero-lede">
              Browse dealerships by state and read what owners say about them. There are no star ratings: a sentiment model,
              running as its own service, labels every review from its text. Read the gauges, then write your own sentence.
            </p>
            <div className="x-actions">
              <Link to="/dealers" className="x-btn x-btn--primary">Browse dealerships</Link>
              {!username && <Link to="/register" className="x-btn x-btn--ghost">Sign up to review</Link>}
            </div>
          </div>
          <Panel />
        </section>
        <Samples />
        <SystemMap />
        <section className="b-section b-cta" aria-labelledby="b-cta-title">
          <h2 id="b-cta-title" className="b-h2">Every label here was computed, not chosen.</h2>
          <p className="b-lede">Open any dealership to read its reviews and see what the model made of them, or read how the four services fit together.</p>
          <div className="x-actions">
            <Link to="/dealers" className="x-btn x-btn--primary">Browse dealerships</Link>
            <a href={REPO_URL} className="x-btn x-btn--ghost">Read the source</a>
          </div>
        </section>
      </main>
    </Layout>
  );
};

const kit = { Layout, Home };
const Theme = ({ children }) => <div className="theme">{children(kit)}</div>;
export default Theme;
