import React from "react";
import { SENTIMENTS, sentimentOf, signed } from "./api";

// Shared building blocks. The theme styles them through the x- class contract; they never fork the markup.

// Sentiment is never colour alone: each label has its own shape and its word.
const SHAPES = {
  positive: <circle cx="8" cy="8" r="6" />,
  neutral: <rect x="2.5" y="2.5" width="11" height="11" rx="1" />,
  negative: <path d="M8 1.8 14.6 13.8H1.4z" />,
};

export const Mark = ({ value, score, bare = false }) => {
  const s = sentimentOf(value);
  return (
    <span className="x-mark" data-s={s}>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="x-mark-shape">
        {SHAPES[s]}
      </svg>
      <span className="x-mark-word">{SENTIMENTS[s].label}</span>
      {!bare && typeof score === "number" && <span className="x-mark-score">{signed(score)}</span>}
    </span>
  );
};

// Share of each label among a dealer's reviews, computed from the reviews on the page.
export const Balance = ({ reviews }) => {
  const counts = { positive: 0, neutral: 0, negative: 0 };
  reviews.forEach((r) => {
    counts[sentimentOf(r.sentiment)] += 1;
  });
  const total = reviews.length || 1;
  return (
    <figure className="x-balance">
      <figcaption className="x-balance-cap">How the {reviews.length} {reviews.length === 1 ? "review reads" : "reviews read"}</figcaption>
      <div className="x-balance-bar" role="img" aria-label={Object.entries(counts).map(([k, n]) => `${n} ${k}`).join(", ")}>
        {Object.entries(counts).map(([k, n]) => (
          <span key={k} data-s={k} style={{ flexGrow: n, flexBasis: 0 }} hidden={n === 0} />
        ))}
      </div>
      <ul className="x-balance-key">
        {Object.entries(counts).map(([k, n]) => (
          <li key={k} data-s={k}>
            <Mark value={k} bare />
            <b>{n}</b>
            <span className="x-balance-pct">{Math.round((n / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </figure>
  );
};

export const Note = ({ children, action, onAction, tone }) => (
  <div className="x-note" data-tone={tone} role={tone === "error" ? "alert" : undefined}>
    <p>{children}</p>
    {action && (
      <button type="button" className="x-btn x-btn--ghost" onClick={onAction}>
        {action}
      </button>
    )}
  </div>
);

export const Loading = ({ label, rows = 4 }) => (
  <ul className="x-skeleton" aria-busy="true" aria-label={label}>
    {Array.from({ length: rows }, (_, i) => (
      <li key={i} style={{ "--i": i }} />
    ))}
  </ul>
);

export const Field = ({ id, label, error, hint, children }) => (
  <div className="x-field" data-invalid={error ? "true" : undefined}>
    <label htmlFor={id} className="x-label">
      {label}
    </label>
    {children}
    {hint && !error && (
      <p className="x-hint" id={`${id}-hint`}>
        {hint}
      </p>
    )}
    {error && (
      <p className="x-error" id={`${id}-error`}>
        {error}
      </p>
    )}
  </div>
);

export const describedBy = (id, { error, hint }) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);
