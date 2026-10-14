import { useEffect, useRef, useState } from "react";
import { EXAMPLES } from "./content";
import { MAX_CHARS, SENTIMENTS, signed, useAnalyzer } from "./api";

// The sentiment analyzer's behaviour with no opinion about how it looks. The theme renders what this returns.
export const useAnalyzerForm = () => {
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
    e?.preventDefault();
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

  const onChange = (value) => {
    setText(value);
    if (inputError) setInputError(null);
  };

  const pickExample = (example) => {
    setText(example.text);
    setInputError(null);
    analyze(example.text);
  };

  const retry = () => {
    analyze(trimmed);
    resultRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
  };

  // One short sentence for screen readers per outcome, instead of re-reading the whole panel.
  let announcement = "";
  if (state.phase === "done") {
    const { sentiment, scores } = state.result;
    const score = scores ? `, score ${signed(scores.compound)} on a scale of minus 1 to plus 1` : "";
    announcement = `${SENTIMENTS[sentiment]?.label ?? sentiment}${score}.`;
  } else if (state.phase === "analyzer-down") announcement = "Analysis failed: the Flask sentiment service didn't respond.";
  else if (state.phase === "api-down") announcement = "Analysis failed: couldn't reach the Django API.";
  else if (state.phase === "invalid") announcement = state.message;

  const failure =
    state.phase === "analyzer-down"
      ? "Django answered, but the Flask sentiment service didn't respond."
      : state.phase === "api-down"
        ? state.timedOut
          ? "The request timed out. Django took more than 15 seconds to answer."
          : "Couldn't reach the Django API. The backend may be offline."
        : null;

  const but = state.result && /\bbut\b/i.test(state.result.text);

  return {
    text, trimmed, tooLong, pending, stale, message, state, failure, announcement, but,
    resultRef, examples: EXAMPLES, max: MAX_CHARS,
    submit, onChange, pickExample, retry, onKeyDown,
  };
};
