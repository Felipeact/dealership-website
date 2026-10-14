import { useCallback, useEffect, useRef, useState } from "react";

// Session, data hooks and actions for every page. The theme only decides how it looks.

export const MAX_CHARS = 500;
const ANALYZE_TIMEOUT_MS = 15000;

// sessionStorage throws in some privacy modes; treat that as signed out.
export const readSession = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeSession = (key, value) => {
  try {
    if (value == null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Nothing stored.
  }
};
export const getUsername = () => readSession("username") || null;

const getJson = async (url, signal) => {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${url} failed with ${res.status}`);
  return res.json();
};

// Generic GET hook: { status: loading | ready | error, data }, with a retry.
const useGet = (url, pick) => {
  const [state, setState] = useState({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const pickRef = useRef(pick);
  pickRef.current = pick;

  useEffect(() => {
    if (!url) return undefined;
    const ctrl = new AbortController();
    setState({ status: "loading" });
    getJson(url, ctrl.signal)
      .then((body) => {
        const data = pickRef.current(body);
        setState(data === undefined ? { status: "error" } : { status: "ready", data });
      })
      .catch((err) => {
        if (err.name !== "AbortError") setState({ status: "error" });
      });
    return () => ctrl.abort();
  }, [url, attempt]);

  return [state, useCallback(() => setAttempt((n) => n + 1), [])];
};

export const useDealers = () =>
  useGet("/djangoapp/get_dealers", (b) => (Array.isArray(b.dealers) ? b.dealers : undefined));

export const useDealer = (id) =>
  useGet(`/djangoapp/dealer/${id}`, (b) => {
    const d = Array.isArray(b.dealer) ? b.dealer[0] : b.dealer;
    return d && typeof d === "object" ? d : undefined;
  });

export const useDealerReviews = (id) =>
  useGet(`/djangoapp/reviews/dealer/${id}`, (b) => (Array.isArray(b.reviews) ? b.reviews : undefined));

export const useSampleReviews = () =>
  useGet("/djangoapp/reviews/sample", (b) => (Array.isArray(b.reviews) ? b.reviews : undefined));

export const useCarModels = () =>
  useGet("/djangoapp/get_cars", (b) => (Array.isArray(b.CarModels) ? b.CarModels : undefined));

// Live health of the services, plus the dealer-network numbers when Express is up.
export const useSystemStatus = () => {
  const [state, setState] = useState({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: "loading" });
    (async () => {
      let health;
      try {
        health = await getJson("/djangoapp/status", ctrl.signal);
      } catch (err) {
        if (err.name === "AbortError") return;
        setState({ status: "ready", services: { django: { ok: false } } });
        return;
      }
      const services = { django: { ok: true }, ...health };
      let network = null;
      if (health.express?.ok) {
        try {
          const { dealers } = await getJson("/djangoapp/get_dealers", ctrl.signal);
          if (Array.isArray(dealers)) {
            network = { dealers: dealers.length, states: new Set(dealers.map((d) => d.state)).size };
          }
        } catch (err) {
          if (err.name === "AbortError") return;
        }
      }
      setState({ status: "ready", services, network });
    })();
    return () => ctrl.abort();
  }, [attempt]);

  return [state, () => setAttempt((n) => n + 1)];
};

export const SERVICES = [
  { id: "django", name: "Django", lost: "nothing behind it can be reached" },
  { id: "express", name: "Express · MongoDB", lost: "the dealer list and reviews are unavailable" },
  { id: "flask", name: "Flask · VADER", lost: "reviews can't be labelled" },
];

// The three hops a demo request makes: Django forwards the text straight to the Flask analyzer.
export const HOPS = [
  { id: "browser", name: "Your browser", detail: "React" },
  { id: "django", name: "Django", detail: "/djangoapp/analyze" },
  { id: "flask", name: "Flask · VADER", detail: "/analyze" },
];

export const hopStates = (state) => {
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

export const useAnalyzer = () => {
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
    }, ANALYZE_TIMEOUT_MS);
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

export const signed = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(2);

export const SENTIMENTS = {
  positive: { label: "Positive" },
  neutral: { label: "Neutral" },
  negative: { label: "Negative" },
};
export const sentimentOf = (s) => (SENTIMENTS[s] ? s : "neutral");

// ---- actions -------------------------------------------------------------------------------

const postJson = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
};

// Each action resolves { ok: true } or { ok: false, message } so forms can show the cause inline.
export const login = async (userName, password) => {
  try {
    const json = await postJson("/djangoapp/login", { userName, password });
    if (json.status === "Authenticated") {
      writeSession("username", json.userName);
      return { ok: true };
    }
    return { ok: false, message: "That username and password don't match an account." };
  } catch {
    return { ok: false, message: "The Django API didn't answer. Try again in a moment." };
  }
};

export const register = async (fields) => {
  try {
    const json = await postJson("/djangoapp/register", fields);
    if (json.status) {
      writeSession("username", json.userName);
      return { ok: true };
    }
    if (json.error === "Already Registered") {
      return { ok: false, field: "userName", message: "That username is taken. Pick another, or log in." };
    }
    return { ok: false, message: "Registration failed. Check the details and try again." };
  } catch {
    return { ok: false, message: "The Django API didn't answer. Try again in a moment." };
  }
};

export const logout = async () => {
  try {
    const res = await fetch("/djangoapp/logout", { method: "GET" });
    if (!res.ok) throw new Error("logout failed");
    writeSession("username", null);
    return true;
  } catch {
    return false;
  }
};

export const addReview = async ({ dealerId, review, date, car, year }) => {
  const first = readSession("firstname");
  const last = readSession("lastname");
  const name = first && last ? `${first} ${last}` : getUsername();
  try {
    const json = await postJson("/djangoapp/add_review", {
      name,
      dealership: dealerId,
      review,
      purchase: true,
      purchase_date: date,
      car_make: car.CarMake,
      car_model: car.CarModel,
      car_year: year,
    });
    if (json.status === 200) return { ok: true };
    return { ok: false, message: json.message || "The review wasn't saved. Are you still signed in?" };
  } catch {
    return { ok: false, message: "The Django API didn't answer, so the review wasn't saved." };
  }
};
