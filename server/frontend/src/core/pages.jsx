import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  addReview, getUsername, login, register, sentimentOf, signed,
  useAnalyzer, useCarModels, useDealer, useDealerReviews, useDealers,
} from "./api";
import { ABOUT, REPO_URL } from "./content";
import { useKit, usePageTitle } from "./kit";
import { Balance, Field, Loading, Mark, Note, describedBy } from "./ui";

// The inner pages. Markup and behaviour live here once; the theme dresses them through the x- classes
// and through the Layout it supplies.

const Page = ({ id, title, children }) => {
  const { Layout } = useKit();
  usePageTitle(title);
  return (
    <Layout page={id}>
      <main className="x-page" id="main" data-page={id}>
        {children}
      </main>
    </Layout>
  );
};

// ---- Dealers --------------------------------------------------------------------------------

export const Dealers = () => {
  const [{ status, data }, retry] = useDealers();
  const [state, setState] = useState("All");
  const [query, setQuery] = useState("");
  const signedIn = Boolean(getUsername());

  const states = useMemo(() => (data ? [...new Set(data.map((d) => d.state))].sort() : []), [data]);
  const shown = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.filter(
      (d) =>
        (state === "All" || d.state === state) &&
        (!q || `${d.full_name} ${d.city} ${d.address}`.toLowerCase().includes(q))
    );
  }, [data, state, query]);

  return (
    <Page id="dealers" title="Dealerships">
      <header className="x-head">
        <h1 className="x-title">Find a dealership</h1>
        <p className="x-sub">
          Pick a state, open a dealer, and read what its owners wrote. Every label on a review comes from the text.
        </p>
      </header>

      <form className="x-filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="x-field">
          <label htmlFor="dealer-search" className="x-label">Search</label>
          <input
            id="dealer-search"
            className="x-input"
            type="search"
            placeholder="Name, city or street"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={status !== "ready"}
          />
        </div>
        <div className="x-field">
          <label htmlFor="dealer-state" className="x-label">State</label>
          <select
            id="dealer-state"
            className="x-select"
            value={state}
            onChange={(e) => setState(e.target.value)}
            disabled={status !== "ready"}
          >
            <option value="All">All states</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <p className="x-count" aria-live="polite">
          {status === "ready" ? (
            <span>
              <b>{shown.length}</b> of <b>{data.length}</b> dealerships
            </span>
          ) : (
            " "
          )}
        </p>
      </form>

      {status === "loading" && <Loading label="Loading dealerships" rows={8} />}
      {status === "error" && (
        <Note tone="error" action="Try again" onAction={retry}>
          The dealerships live in MongoDB behind the Express service, and it isn't answering right now.
        </Note>
      )}
      {status === "ready" && shown.length === 0 && (
        <Note
          action="Clear filters"
          onAction={() => {
            setState("All");
            setQuery("");
          }}
        >
          No dealership matches that search{state !== "All" ? ` in ${state}` : ""}.
        </Note>
      )}
      {status === "ready" && shown.length > 0 && (
        <ol className="x-dealers">
          {shown.map((d) => (
            <li key={d.id} className="x-dealer" style={{ "--n": d.id }}>
              <Link to={`/dealer/${d.id}`} className="x-dealer-link">
                <span className="x-dealer-name">{d.full_name}</span>
                <span className="x-dealer-place">
                  {d.city}, {d.state}
                </span>
                <span className="x-dealer-addr">
                  {d.address} · {d.zip}
                </span>
              </Link>
              {signedIn && (
                <Link to={`/postreview/${d.id}`} className="x-dealer-review">
                  Write a review<span className="sr-only"> for {d.full_name}</span>
                </Link>
              )}
            </li>
          ))}
        </ol>
      )}
    </Page>
  );
};

// ---- Dealer ---------------------------------------------------------------------------------

export const Dealer = () => {
  const { id } = useParams();
  const [dealer, retryDealer] = useDealer(id);
  const [reviews, retryReviews] = useDealerReviews(id);
  const signedIn = Boolean(getUsername());
  const d = dealer.data;

  return (
    <Page id="dealer" title={d?.full_name ?? "Dealership"}>
      <nav aria-label="Breadcrumb" className="x-crumb">
        <Link to="/dealers">All dealerships</Link>
      </nav>

      {dealer.status === "loading" && <Loading label="Loading dealership" rows={2} />}
      {dealer.status === "error" && (
        <Note tone="error" action="Try again" onAction={retryDealer}>
          Couldn't load dealership {id}. It may not exist, or the Express service isn't answering.
        </Note>
      )}
      {d && (
        <header className="x-head x-head--dealer">
          <h1 className="x-title">{d.full_name}</h1>
          <p className="x-sub">
            {d.address}, {d.city}, {d.state} {d.zip}
          </p>
          <div className="x-actions">
            {signedIn ? (
              <Link to={`/postreview/${id}`} className="x-btn x-btn--primary">Write a review</Link>
            ) : (
              <Link to="/login" className="x-btn x-btn--primary">Log in to write a review</Link>
            )}
          </div>
        </header>
      )}

      <section aria-labelledby="reviews-title" className="x-reviews-wrap">
        <h2 id="reviews-title" className="x-h2">What owners wrote</h2>
        {reviews.status === "loading" && <Loading label="Loading reviews" rows={3} />}
        {reviews.status === "error" && (
          <Note tone="error" action="Try again" onAction={retryReviews}>
            Couldn't load the reviews. Either the Express service (MongoDB) or the Flask sentiment service isn't
            answering.
          </Note>
        )}
        {reviews.status === "ready" && reviews.data.length === 0 && (
          <Note>No reviews yet. {signedIn ? "Be the first to write one." : "Log in to be the first."}</Note>
        )}
        {reviews.status === "ready" && reviews.data.length > 0 && (
          <>
            <Balance reviews={reviews.data} />
            <ul className="x-reviews">
              {reviews.data.map((r, i) => (
                <li key={r.id ?? i} className="x-review" data-s={sentimentOf(r.sentiment)} style={{ "--n": i }}>
                  <Mark value={r.sentiment} />
                  <blockquote className="x-review-text">
                    <p>{r.review}</p>
                  </blockquote>
                  <p className="x-review-by">
                    <b>{r.name}</b>
                    <span>
                      {r.purchase ? "Bought" : "Looked at"} a {[r.car_year, r.car_make, r.car_model].filter(Boolean).join(" ")}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </Page>
  );
};

// ---- Post a review --------------------------------------------------------------------------

const thisYear = new Date().getFullYear();

export const PostReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer] = useDealer(id);
  const [cars] = useCarModels();
  const [tone, analyze] = useAnalyzer();
  const [values, setValues] = useState({ review: "", date: "", car: "", year: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const signedIn = Boolean(getUsername());

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const next = {};
    if (!values.review.trim()) next.review = "Write a few words about your visit.";
    if (!values.date) next.date = "Pick the date you bought or visited.";
    if (!values.car) next.car = "Choose the make and model.";
    const yr = Number(values.year);
    if (!values.year || !Number.isInteger(yr) || yr < 1990 || yr > thisYear + 1) {
      next.year = `Enter a model year between 1990 and ${thisYear + 1}.`;
    }
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`pr-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    setSaving(true);
    setFormError(null);
    const result = await addReview({
      dealerId: id,
      review: values.review.trim(),
      date: values.date,
      car: cars.data[Number(values.car)],
      year: values.year,
    });
    setSaving(false);
    if (result.ok) navigate(`/dealer/${id}`);
    else setFormError(result.message);
  };

  if (!signedIn) {
    return (
      <Page id="postreview" title="Write a review">
        <header className="x-head">
          <h1 className="x-title">Log in to write a review</h1>
          <p className="x-sub">Reviews are tied to an account so one person can't post for a whole lot.</p>
          <div className="x-actions">
            <Link to="/login" className="x-btn x-btn--primary">Log in</Link>
            <Link to="/register" className="x-btn x-btn--ghost">Create an account</Link>
          </div>
        </header>
      </Page>
    );
  }

  const checking = tone.phase === "pending";
  return (
    <Page id="postreview" title="Write a review">
      <header className="x-head">
        <h1 className="x-title">Review {dealer.data?.full_name ?? "this dealership"}</h1>
        <p className="x-sub">Say what happened. The model will label it from your words once it's posted.</p>
      </header>

      <form className="x-form x-form--wide" onSubmit={submit} noValidate>
        <Field id="pr-review" label="Your review" error={errors.review}>
          <textarea
            id="pr-review"
            className="x-textarea"
            rows={6}
            value={values.review}
            onChange={set("review")}
            aria-invalid={Boolean(errors.review)}
            aria-describedby={describedBy("pr-review", { error: errors.review })}
          />
        </Field>

        <div className="x-tone" aria-live="polite">
          <button
            type="button"
            className="x-btn x-btn--ghost"
            aria-disabled={checking}
            onClick={() => values.review.trim() && !checking && analyze(values.review.trim())}
          >
            {checking ? "Reading…" : "Preview how it reads"}
          </button>
          {tone.phase === "done" && (
            <span className="x-tone-out">
              <Mark value={tone.result.sentiment} score={tone.result.scores?.compound} />
              <span className="x-hint">
                {tone.result.scores ? `compound ${signed(tone.result.scores.compound)}` : ""} · scored by Flask, not saved
              </span>
            </span>
          )}
          {(tone.phase === "analyzer-down" || tone.phase === "api-down") && (
            <span className="x-hint">The analyzer didn't answer. You can still post; the label is computed later.</span>
          )}
        </div>

        <div className="x-form-row">
          <Field id="pr-date" label="Purchase or visit date" error={errors.date}>
            <input
              id="pr-date"
              type="date"
              className="x-input"
              max={new Date().toISOString().slice(0, 10)}
              value={values.date}
              onChange={set("date")}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={describedBy("pr-date", { error: errors.date })}
            />
          </Field>
          <Field id="pr-year" label="Model year" error={errors.year}>
            <input
              id="pr-year"
              type="number"
              inputMode="numeric"
              className="x-input"
              min={1990}
              max={thisYear + 1}
              value={values.year}
              onChange={set("year")}
              aria-invalid={Boolean(errors.year)}
              aria-describedby={describedBy("pr-year", { error: errors.year })}
            />
          </Field>
        </div>

        <Field
          id="pr-car"
          label="Make and model"
          error={errors.car}
          hint={cars.status === "error" ? "The car list didn't load. Reload to try again." : undefined}
        >
          <select
            id="pr-car"
            className="x-select"
            value={values.car}
            onChange={set("car")}
            aria-invalid={Boolean(errors.car)}
            aria-describedby={describedBy("pr-car", { error: errors.car })}
          >
            <option value="">{cars.status === "loading" ? "Loading cars…" : "Choose one"}</option>
            {(cars.data ?? []).map((c, i) => (
              <option key={`${c.CarMake}-${c.CarModel}`} value={i}>
                {c.CarMake} {c.CarModel}
              </option>
            ))}
          </select>
        </Field>

        {formError && <p className="x-error x-error--form" role="alert">{formError}</p>}
        <div className="x-actions">
          <button type="submit" className="x-btn x-btn--primary" aria-disabled={saving}>
            {saving ? "Posting…" : "Post review"}
          </button>
          <Link to={`/dealer/${id}`} className="x-btn x-btn--ghost">Cancel</Link>
        </div>
      </form>
    </Page>
  );
};

// ---- Login / Register -----------------------------------------------------------------------

export const Login = () => {
  const [v, setV] = useState({ userName: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const next = {};
    if (!v.userName.trim()) next.userName = "Enter your username.";
    if (!v.password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`lg-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    setFormError(null);
    const result = await login(v.userName.trim(), v.password);
    if (result.ok) window.location.href = "/";
    else {
      setBusy(false);
      setFormError(result.message);
    }
  };

  return (
    <Page id="login" title="Log in">
      <header className="x-head">
        <h1 className="x-title">Log in</h1>
        <p className="x-sub">Reading is open to everyone. You need an account to post a review.</p>
      </header>
      <form className="x-form" onSubmit={submit} noValidate>
        <Field id="lg-userName" label="Username" error={errors.userName}>
          <input
            id="lg-userName" className="x-input" autoComplete="username" value={v.userName}
            onChange={(e) => setV({ ...v, userName: e.target.value })}
            aria-invalid={Boolean(errors.userName)} aria-describedby={describedBy("lg-userName", { error: errors.userName })}
          />
        </Field>
        <Field id="lg-password" label="Password" error={errors.password}>
          <input
            id="lg-password" type="password" className="x-input" autoComplete="current-password" value={v.password}
            onChange={(e) => setV({ ...v, password: e.target.value })}
            aria-invalid={Boolean(errors.password)} aria-describedby={describedBy("lg-password", { error: errors.password })}
          />
        </Field>
        {formError && <p className="x-error x-error--form" role="alert">{formError}</p>}
        <div className="x-actions">
          <button type="submit" className="x-btn x-btn--primary" aria-disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
          <Link to="/register" className="x-btn x-btn--ghost">Create an account</Link>
        </div>
      </form>
    </Page>
  );
};

export const Register = () => {
  const [v, setV] = useState({ userName: "", firstName: "", lastName: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const bind = (k) => ({
    id: `rg-${k}`,
    value: v[k],
    onChange: (e) => {
      setV({ ...v, [k]: e.target.value });
      if (errors[k]) setErrors({ ...errors, [k]: undefined });
    },
    "aria-invalid": Boolean(errors[k]),
    "aria-describedby": describedBy(`rg-${k}`, { error: errors[k] }),
  });

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const next = {};
    if (!v.userName.trim()) next.userName = "Choose a username.";
    if (!v.firstName.trim()) next.firstName = "Enter your first name.";
    if (!v.lastName.trim()) next.lastName = "Enter your last name.";
    if (!/^\S+@\S+\.\S+$/.test(v.email)) next.email = "Enter an email address like you@example.com.";
    if (v.password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`rg-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    setFormError(null);
    const result = await register({
      userName: v.userName.trim(), password: v.password,
      firstName: v.firstName.trim(), lastName: v.lastName.trim(), email: v.email.trim(),
    });
    if (result.ok) window.location.href = "/";
    else {
      setBusy(false);
      if (result.field) setErrors({ [result.field]: result.message });
      else setFormError(result.message);
    }
  };

  return (
    <Page id="register" title="Create an account">
      <header className="x-head">
        <h1 className="x-title">Create an account</h1>
        <p className="x-sub">One account lets you review any dealership. Use fictional details if you like; this is a demo.</p>
      </header>
      <form className="x-form" onSubmit={submit} noValidate>
        <Field id="rg-userName" label="Username" error={errors.userName}>
          <input className="x-input" autoComplete="username" {...bind("userName")} />
        </Field>
        <div className="x-form-row">
          <Field id="rg-firstName" label="First name" error={errors.firstName}>
            <input className="x-input" autoComplete="given-name" {...bind("firstName")} />
          </Field>
          <Field id="rg-lastName" label="Last name" error={errors.lastName}>
            <input className="x-input" autoComplete="family-name" {...bind("lastName")} />
          </Field>
        </div>
        <Field id="rg-email" label="Email" error={errors.email}>
          <input type="email" className="x-input" autoComplete="email" {...bind("email")} />
        </Field>
        <Field id="rg-password" label="Password" error={errors.password} hint="At least 8 characters.">
          <input type="password" className="x-input" autoComplete="new-password" {...bind("password")} />
        </Field>
        {formError && <p className="x-error x-error--form" role="alert">{formError}</p>}
        <div className="x-actions">
          <button type="submit" className="x-btn x-btn--primary" aria-disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </button>
          <Link to="/login" className="x-btn x-btn--ghost">I already have one</Link>
        </div>
      </form>
    </Page>
  );
};

// ---- About / Contact ------------------------------------------------------------------------

export const About = () => (
  <Page id="about" title="About">
    <header className="x-head">
      <h1 className="x-title">About Dealerships</h1>
      <p className="x-sub">{ABOUT.lede}</p>
    </header>
    <div className="x-prose">
      {ABOUT.points.map((p) => (
        <section key={p.title} className="x-prose-block">
          <h2 className="x-h2">{p.title}</h2>
          <p>{p.body}</p>
        </section>
      ))}
    </div>
  </Page>
);

export const Contact = () => (
  <Page id="contact" title="Contact">
    <header className="x-head">
      <h1 className="x-title">Contact</h1>
      <p className="x-sub">
        Dealerships is a portfolio project, so there is no sales desk to call. The code and the conversation live on
        GitHub.
      </p>
    </header>
    <ul className="x-links">
      <li>
        <a href={REPO_URL} className="x-linkcard">
          <b>Read the source</b>
          <span>All four services, the CI config and the architecture write-up.</span>
        </a>
      </li>
      <li>
        <a href={`${REPO_URL}/issues`} className="x-linkcard">
          <b>Report a problem or suggest something</b>
          <span>Open an issue on the repository.</span>
        </a>
      </li>
    </ul>
  </Page>
);
