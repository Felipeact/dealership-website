import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";

const MAX_CHARS = 500;
const TIMEOUT_MS = 15000;

const EXAMPLES = [
  { label: "Happy buyer", text: "Best buying experience I've ever had. Friendly, fast, and honest about the car's history." },
  { label: "Mixed visit", text: "The finance guy was pushy, but the service team was great." },
  { label: "Bad experience", text: "They sold me a car with a cracked windshield and stopped answering my calls." },
];

// The three hops a demo request makes. Express/MongoDB isn't involved here:
// Django forwards the text straight to the Flask analyzer.
const HOPS = [
  { id: "browser", name: "Your browser", detail: "React" },
  { id: "django", name: "Django", detail: "/djangoapp/analyze" },
  { id: "flask", name: "Flask · VADER", detail: "/analyze" },
];

// Light tints of the success / neutral / danger hues, legible on the dark hero.
const TONE = {
  positive: { text: "text-reading-positive", fill: "bg-reading-positive", label: "Positive" },
  neutral: { text: "text-reading-neutral", fill: "bg-reading-neutral", label: "Neutral" },
  negative: { text: "text-reading-negative", fill: "bg-reading-negative", label: "Negative" },
};

const signed = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(2);

// Which hop is in which state, derived from the request phase.
const hopStates = (state) => {
  switch (state.phase) {
    case "pending":
      return { browser: "done", django: "active", flask: "active" };
    case "done":
      return { browser: "done", django: "done", flask: "done" };
    case "invalid":
      return { browser: "done", django: "done", flask: "idle" };
    case "analyzer-down":
      return { browser: "done", django: "done", flask: "failed" };
    case "api-down":
      return { browser: "done", django: "failed", flask: "idle" };
    default:
      return { browser: "idle", django: "idle", flask: "idle" };
  }
};

const useAnalyzer = () => {
  const [state, setState] = useState({ phase: "idle" });
  const controller = useRef(null);

  useEffect(() => () => controller.current?.abort(), []);

  const analyze = useCallback(async (text) => {
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      ctrl.abort();
    }, TIMEOUT_MS);
    // Keep the previous result on screen (dimmed) while the new one is computed.
    setState((prev) => ({ phase: "pending", result: prev.result }));
    const started = performance.now();

    let res;
    let body;
    try {
      res = await fetch("/djangoapp/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: ctrl.signal,
      });
      body = await res.json();
    } catch (err) {
      if (err.name === "AbortError" && !timedOut) return;
      // No response, a timeout, or a non-JSON reply: Django itself never answered.
      setState({ phase: "api-down", timedOut });
      return;
    } finally {
      clearTimeout(timer);
    }
    const roundTripMs = Math.round(performance.now() - started);

    if (res.ok && body.sentiment) {
      setState({ phase: "done", result: { ...body, text, roundTripMs } });
    } else if (res.status === 400) {
      setState({ phase: "invalid", message: body.error });
    } else if (body.error === "analyzer_unreachable") {
      setState({ phase: "analyzer-down" });
    } else {
      setState({ phase: "api-down" });
    }
  }, []);

  return [state, analyze];
};

const HopDot = ({ status }) => {
  const base = "relative z-10 block size-3 shrink-0 rounded-full transition-colors duration-300";
  if (status === "done") return <span className={`${base} bg-accent`} />;
  if (status === "failed") return <span className={`${base} bg-fault`} />;
  if (status === "active")
    return (
      <span className={`${base} bg-bay-panel ring-2 ring-accent`}>
        <span className="absolute inset-0 rounded-full bg-accent/60 motion-safe:animate-ping" />
      </span>
    );
  return <span className={`${base} bg-white/25`} />;
};

const HopLine = ({ from, to, delay }) => {
  const travelling = to === "active";
  const failed = to === "failed";
  const reached = from === "done" && (to === "done" || to === "failed" || to === "active");
  return (
    <span className="relative mx-1 h-px flex-1 overflow-hidden bg-white/15">
      {reached && !travelling && (
        <span
          className={`absolute inset-0 ${failed ? "bg-[repeating-linear-gradient(90deg,var(--color-fault)_0_4px,transparent_4px_8px)]" : "bg-accent/70"}`}
        />
      )}
      {travelling && (
        <span
          className="absolute inset-y-0 left-0 w-1/4 bg-accent motion-safe:animate-hop motion-reduce:w-full motion-reduce:bg-accent/50"
          style={{ animationDelay: delay }}
        />
      )}
    </span>
  );
};

const Pipeline = ({ state }) => {
  const s = hopStates(state);
  return (
    <figure className="mt-6">
      <figcaption className="sr-only">Request path for this analysis</figcaption>
      <div className="flex items-center" aria-hidden="true">
        <HopDot status={s.browser} />
        <HopLine from={s.browser} to={s.django} delay="0ms" />
        <HopDot status={s.django} />
        <HopLine from={s.django} to={s.flask} delay="550ms" />
        <HopDot status={s.flask} />
      </div>
      <ol className="mt-3 grid grid-cols-3 gap-2 text-xs">
        {HOPS.map((hop, i) => (
          <li
            key={hop.id}
            className={i === 0 ? "text-left" : i === 1 ? "text-center" : "text-right"}
          >
            <span className={`block font-medium ${s[hop.id] === "failed" ? "text-fault-ink" : "text-white"}`}>
              {hop.name}
              <span className="sr-only">: {s[hop.id] === "idle" ? "not reached" : s[hop.id] === "active" ? "working" : s[hop.id]}</span>
            </span>
            <span className="mt-0.5 block font-mono text-white/60">{hop.detail}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
};

const PolarityMeter = ({ compound, tone }) => {
  // Map -1..1 onto 0..100% of the track.
  const at = ((compound + 1) / 2) * 100;
  return (
    <div className="mt-5" aria-hidden="true">
      <div className="relative h-2 rounded-full bg-white/10">
        {/* VADER's neutral band: compound between -0.05 and +0.05 */}
        <span className="absolute inset-y-0 left-[47.5%] w-[5%] bg-white/20" />
        <span className="absolute inset-y-[-3px] left-1/2 w-px bg-white/40" />
        <span
          className={`absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-bay-panel transition-[left] duration-700 ease-out ${tone.fill}`}
          style={{ left: `${at}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-white/60">
        <span>−1 negative</span>
        <span>neutral</span>
        <span>positive +1</span>
      </div>
    </div>
  );
};

const Result = ({ state, stale, onRetry }) => {
  if (state.phase === "pending" && !state.result) {
    return <p className="text-sm text-white/70">Analyzing…</p>;
  }
  if (state.phase === "done" || state.phase === "pending") {
    const { sentiment, scores, analyzer_ms: analyzerMs, roundTripMs } = state.result;
    const tone = TONE[sentiment] ?? TONE.neutral;
    const dimmed = stale || state.phase === "pending";
    return (
      <div>
        <div
          key={`${sentiment}-${roundTripMs}`}
          className={`transition-opacity duration-300 motion-safe:animate-reveal ${dimmed ? "opacity-40" : ""}`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className={`text-3xl font-semibold tracking-tight ${tone.text}`}>{tone.label}</p>
            {scores && (
              <p className="font-mono text-sm tabular-nums text-white/80">score {signed(scores.compound)}</p>
            )}
          </div>
          {scores && (
            <>
              <PolarityMeter compound={scores.compound} tone={tone} />
              <p className="mt-3 font-mono text-xs tabular-nums text-white/60">
                words: {Math.round(scores.pos * 100)}% positive · {Math.round(scores.neu * 100)}% neutral ·{" "}
                {Math.round(scores.neg * 100)}% negative
              </p>
            </>
          )}
          <p className="mt-1 font-mono text-xs tabular-nums text-white/60">
            Django → Flask {analyzerMs} ms · round trip {roundTripMs} ms
          </p>
        </div>
        {state.phase === "pending" ? (
          <p className="mt-2 font-mono text-xs text-white">Analyzing…</p>
        ) : stale ? (
          <p className="mt-2 font-mono text-xs text-white">Text edited · press Analyze to update</p>
        ) : (
          /\bbut\b/i.test(state.result.text) && (
            <p className="mt-3 border-l border-white/25 pl-3 text-xs leading-relaxed text-white/75">
              A known VADER blind spot: it weighs the clause after “but” more heavily, so mixed reviews often read
              {sentiment === "negative" ? " negative" : " positive"}.
            </p>
          )
        )}
      </div>
    );
  }
  if (state.phase === "analyzer-down" || state.phase === "api-down") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-sm text-sm text-fault-ink">
          {state.phase === "analyzer-down"
            ? "Django answered, but the Flask sentiment service didn't respond."
            : state.timedOut
              ? "The request timed out. Django took more than 15 seconds to answer."
              : "Couldn't reach the Django API. The backend may be offline."}
        </p>
        <Button size="sm" variant="secondary" onPress={onRetry}>
          Try again
        </Button>
      </div>
    );
  }
  return null;
};

// One short sentence for screen readers per outcome, instead of re-reading the whole panel.
const announce = (state) => {
  if (state.phase === "done") {
    const { sentiment, scores } = state.result;
    const score = scores ? `, score ${signed(scores.compound)} on a scale of minus 1 to plus 1` : "";
    return `${TONE[sentiment]?.label ?? sentiment}${score}.`;
  }
  if (state.phase === "analyzer-down") return "Analysis failed: the Flask sentiment service didn't respond.";
  if (state.phase === "api-down") return "Analysis failed: couldn't reach the Django API.";
  if (state.phase === "invalid") return state.message;
  return "";
};

const SentimentDemo = () => {
  const [text, setText] = useState(EXAMPLES[1].text);
  const [inputError, setInputError] = useState(null);
  const [state, analyze] = useAnalyzer();
  const textRef = useRef(text);
  const resultRef = useRef(null);
  textRef.current = text;

  const trimmed = text.trim();
  const tooLong = trimmed.length > MAX_CHARS;
  const pending = state.phase === "pending";
  const stale = state.result != null && state.result.text !== trimmed;
  const message = inputError ?? (state.phase === "invalid" ? state.message : null);

  // Run the prefilled example once so the first view already shows a result.
  useEffect(() => {
    analyze(textRef.current.trim());
  }, [analyze]);

  // Validate on submit and say why, rather than silently disabling the button.
  const submit = (e) => {
    e.preventDefault();
    if (pending) return;
    if (!trimmed) {
      setInputError("Type a sentence to analyze.");
      return;
    }
    if (tooLong) {
      setInputError(`Keep it under ${MAX_CHARS} characters. You're at ${trimmed.length}.`);
      return;
    }
    setInputError(null);
    analyze(trimmed);
  };

  const pickExample = (example) => {
    setText(example.text);
    setInputError(null);
    analyze(example.text);
  };

  const retry = () => {
    analyze(trimmed);
    // The retry button unmounts; keep keyboard focus on the result area.
    resultRef.current?.focus();
  };

  return (
    <section
      aria-labelledby="sentiment-demo-title"
      className="rounded-2xl border border-white/12 bg-bay-panel p-5 shadow-[0_30px_60px_-24px_oklch(0.08_0.03_220/0.9)] sm:p-7"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="sentiment-demo-title" className="text-lg font-semibold tracking-tight text-white">
          Sentiment analyzer
        </h2>
        <span className="font-mono text-xs text-white/60">NLTK VADER</span>
      </div>
      <p className="mt-1 text-sm text-white/70">
        The same model that labels every review on this site. Write one and see what it hears.
      </p>

      <form onSubmit={submit} className="mt-5" noValidate>
        <label htmlFor="sentiment-demo-text" className="sr-only">
          Review text to analyze
        </label>
        <textarea
          id="sentiment-demo-text"
          rows={3}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (inputError) setInputError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
          }}
          aria-invalid={Boolean(message) || tooLong}
          aria-describedby={message ? "sentiment-demo-count sentiment-demo-error" : "sentiment-demo-count"}
          placeholder="Write a sentence about a dealership…"
          className="block w-full resize-none rounded-xl border border-white/15 bg-bay-well px-4 py-3 text-[15px] leading-relaxed text-white caret-accent [scrollbar-color:oklch(1_0_0/0.25)_transparent] [scrollbar-width:thin] placeholder:text-white/55 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-white/60">Try</span>
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => pickExample(example)}
              aria-pressed={text === example.text}
              className="rounded-full border border-white/15 px-3 py-1 text-xs pointer-coarse:min-h-11 pointer-coarse:px-4 pointer-coarse:text-sm text-white/85 transition-colors hover:border-white/35 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white aria-pressed:border-accent aria-pressed:bg-accent/15 aria-pressed:text-white"
            >
              {example.label}
            </button>
          ))}
        </div>
        {message && (
          <p id="sentiment-demo-error" className="mt-3 text-sm text-fault-ink">
            {message}
          </p>
        )}
        <div className="mt-4 flex items-center gap-3">
          <span
            id="sentiment-demo-count"
            className={`font-mono text-xs tabular-nums ${tooLong ? "text-fault-ink" : "text-white/60"}`}
          >
            <span className="sr-only">Characters used: </span>
            {trimmed.length}/{MAX_CHARS}
          </span>
          <span className="hidden font-mono text-xs text-white/60 sm:inline" aria-hidden="true">
            · Ctrl ↵ to run
          </span>
          {/* aria-disabled rather than disabled: a disabled button drops keyboard focus mid-request.
              Outline style: the hero's one filled action is "Browse dealerships". */}
          <Button
            type="submit"
            variant="outline"
            aria-disabled={pending}
            className={`ml-auto border-white/40 text-white hover:bg-white/10 pointer-coarse:h-11 ${pending ? "cursor-progress opacity-70" : ""}`}
          >
            {pending ? "Analyzing…" : "Analyze"}
          </Button>
        </div>
      </form>

      <Pipeline state={state} />

      <div
        ref={resultRef}
        tabIndex={-1}
        aria-label="Analysis result"
        className="mt-6 min-h-[11.5rem] border-t border-white/10 pt-5 focus:outline-none"
      >
        <Result state={state} stale={stale} onRetry={retry} />
      </div>
      <p className="sr-only" aria-live="polite">
        {announce(state)}
      </p>
    </section>
  );
};

export default SentimentDemo;
