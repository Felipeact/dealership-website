import React, { useEffect, useState } from "react";
import { Skeleton } from "@heroui/react";

// Sentiment colours for light grounds: the -ink variants of the reading tokens.
const LABEL = {
  positive: { text: "Positive", dot: "bg-reading-positive-ink", ink: "text-reading-positive-ink" },
  neutral: { text: "Neutral", dot: "bg-reading-neutral-ink", ink: "text-reading-neutral-ink" },
  negative: { text: "Negative", dot: "bg-reading-negative-ink", ink: "text-reading-negative-ink" },
};

const signed = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(2);

const useSampleReviews = () => {
  const [state, setState] = useState({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: "loading" });
    fetch("/djangoapp/reviews/sample", { signal: ctrl.signal })
      .then(async (res) => {
        const body = await res.json();
        if (res.ok && Array.isArray(body.reviews)) {
          setState({ status: "ready", reviews: body.reviews });
        } else {
          setState({ status: "error", reason: body.error });
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") setState({ status: "error", reason: "django_unreachable" });
      });
    return () => ctrl.abort();
  }, [attempt]);

  return [state, () => setAttempt((n) => n + 1)];
};

const FAILURE = {
  express_unreachable: "The reviews live in MongoDB behind the Express service, and it isn't answering right now.",
  analyzer_unreachable: "The reviews loaded, but the Flask sentiment service didn't answer, so they can't be labelled.",
  django_unreachable: "The Django API isn't answering, so nothing behind it can be reached.",
};

const ReviewCard = ({ review }) => {
  const label = LABEL[review.sentiment] ?? LABEL.neutral;
  return (
    <li className="flex flex-col rounded-2xl border border-separator bg-surface p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className={`flex items-center gap-2 text-sm font-semibold ${label.ink}`}>
          <span className={`size-2 rounded-full ${label.dot}`} aria-hidden="true" />
          {label.text}
        </p>
        {review.scores && (
          <p className="font-mono text-xs tabular-nums text-foreground/70">
            score {signed(review.scores.compound)}
          </p>
        )}
      </div>
      <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground">
        <p>“{review.review}”</p>
      </blockquote>
      <footer className="mt-5 border-t border-separator pt-4 text-sm">
        <p className="font-medium text-foreground">{review.name}</p>
        <p className="text-foreground/70">
          {review.purchase ? "Bought" : "Looked at"} a {review.car}
        </p>
        <a
          href={`/dealer/${review.dealership}`}
          className="mt-2 inline-block rounded-sm font-medium text-accent-ink underline decoration-accent-ink/35 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink"
        >
          {review.dealer_name ?? `Dealer #${review.dealership}`}
        </a>
      </footer>
    </li>
  );
};

const SampleReviews = () => {
  const [state, retry] = useSampleReviews();

  return (
    <section aria-labelledby="sample-reviews-title" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <div className="max-w-2xl">
        <h2 id="sample-reviews-title" className="text-3xl font-semibold font-stretch-semi-expanded tracking-tight text-balance sm:text-4xl">
          Straight from the database
        </h2>
        <p className="mt-4 text-lg text-foreground/75">
          Three stored reviews, one for each label. The labels aren't saved with the reviews. Flask works them out each
          time the page asks.
        </p>
      </div>

      {state.status === "loading" && (
        <ul className="mt-10 grid gap-5 md:grid-cols-3" aria-busy="true" aria-label="Loading sample reviews">
          {[0, 1, 2].map((i) => (
            <li key={i} className="rounded-2xl border border-separator bg-surface p-6">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="mt-5 h-4 w-full rounded" />
              <Skeleton className="mt-2 h-4 w-5/6 rounded" />
              <Skeleton className="mt-2 h-4 w-2/3 rounded" />
              <Skeleton className="mt-8 h-4 w-32 rounded" />
            </li>
          ))}
        </ul>
      )}

      {state.status === "ready" && state.reviews.length > 0 && (
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {state.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ul>
      )}

      {((state.status === "ready" && state.reviews.length === 0) || state.status === "error") && (
        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-separator p-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-foreground/80">
            {state.status === "error"
              ? FAILURE[state.reason] ?? FAILURE.django_unreachable
              : "There are no reviews in the database yet."}
          </p>
          {state.status === "error" && (
            <button
              type="button"
              onClick={retry}
              className="rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default SampleReviews;
