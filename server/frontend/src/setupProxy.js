// Dev-only API stand-in so the UI can be worked on without the four services running.
// Start with MOCK_API=1 (npm run start:mock). Without it this file does nothing.
// All names and reviews below are fictional demonstration data.

const DEALERS = [
  ["Harbor Motors", "Savannah", "GA", "214 Bay St", "31401"],
  ["Lone Star Auto Group", "Austin", "TX", "9120 Research Blvd", "78758"],
  ["Pinecrest Cars", "Portland", "OR", "88 Burnside Ave", "97209"],
  ["Redline Imports", "Phoenix", "AZ", "4410 E Camelback Rd", "85018"],
  ["Summit Peak Dealership", "Denver", "CO", "700 S Broadway", "80209"],
  ["Magnolia Auto Mall", "Jackson", "MS", "1520 Lakeland Dr", "39216"],
  ["Great Lakes Automotive", "Chicago", "IL", "2300 N Elston Ave", "60614"],
  ["Gulfstream Auto Sales", "Tampa", "FL", "5105 W Kennedy Blvd", "33609"],
  ["Cascade Motor Co.", "Seattle", "WA", "1200 Aurora Ave N", "98109"],
  ["Prairie Wheels", "Omaha", "NE", "7400 Dodge St", "68114"],
  ["Bayou City Cars", "Houston", "TX", "3300 Katy Fwy", "77007"],
  ["Granite State Auto", "Manchester", "NH", "301 Elm St", "03101"],
  ["Desert Rose Motors", "Las Vegas", "NV", "6000 W Sahara Ave", "89146"],
  ["Capital City Autos", "Sacramento", "CA", "1900 Auburn Blvd", "95815"],
  ["Rust Belt Rides", "Cleveland", "OH", "4800 Chester Ave", "44103"],
  ["Blue Ridge Auto", "Asheville", "NC", "22 Merrimon Ave", "28801"],
].map(([full_name, city, state, address, zip], i) => ({
  id: i + 1,
  full_name,
  short_name: full_name.split(" ")[0],
  city,
  state,
  address,
  zip,
  lat: 0,
  long: 0,
}));

const REVIEW_BANK = [
  ["Best buying experience I've ever had. Friendly, fast, and honest about the car's history.", true, "Mara Ellison", "Toyota", "Camry", 2022],
  ["The finance guy was pushy, but the service team was great.", true, "Dev Okafor", "Honda", "Civic", 2021],
  ["They sold me a car with a cracked windshield and stopped answering my calls.", true, "Rosa Linden", "Ford", "Escape", 2019],
  ["Quick trade-in, fair number, and nobody tried to upsell me on anything.", true, "Tomas Reyes", "Subaru", "Outback", 2023],
  ["Waited three hours for paperwork that should have taken twenty minutes.", true, "Ines Hallberg", "Kia", "Sorento", 2020],
  ["Test drive was fine. Haven't decided yet.", false, "Walt Pruitt", "Mazda", "CX-5", 2022],
];

const sentimentOf = (text) => {
  const pos = (text.match(/\b(best|great|friendly|fast|honest|fair|love|good|easy|helpful|amazing)\b/gi) || []).length;
  const neg = (text.match(/\b(cracked|stopped|waited|bad|worst|pushy|rude|never|hate|broken|slow)\b/gi) || []).length;
  const words = Math.max(1, text.split(/\s+/).length);
  const compound = Math.max(-1, Math.min(1, ((pos - neg) * 1.4) / Math.sqrt(words + 6)));
  const sentiment = compound > 0.05 ? "positive" : compound < -0.05 ? "negative" : "neutral";
  return { sentiment, scores: { compound: +compound.toFixed(3), pos: pos / words, neg: neg / words, neu: 1 - (pos + neg) / words } };
};

const reviewsFor = (dealerId) => {
  const n = 2 + (dealerId % 4);
  return Array.from({ length: n }, (_, i) => {
    const [review, purchase, name, car_make, car_model, car_year] = REVIEW_BANK[(dealerId + i) % REVIEW_BANK.length];
    return {
      id: dealerId * 10 + i,
      name,
      dealership: dealerId,
      review,
      purchase,
      purchase_date: "03/12/2024",
      car_make,
      car_model,
      car_year,
      sentiment: sentimentOf(review).sentiment,
    };
  });
};

const readBody = (req) =>
  new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        resolve({});
      }
    });
  });

module.exports = function setup(app) {
  if (!process.env.MOCK_API) return;
  const send = (res, body, status = 200, delay = 180) =>
    setTimeout(() => {
      res.status(status).json(body);
    }, delay);

  app.get("/djangoapp/status", (req, res) =>
    send(res, { express: { ok: true, ms: 9 }, flask: { ok: true, ms: 14 } }, 200, 120)
  );
  app.get("/djangoapp/get_dealers", (req, res) => send(res, { dealers: DEALERS }));
  app.get("/djangoapp/get_dealers/:state", (req, res) =>
    send(res, { dealers: DEALERS.filter((d) => d.state === req.params.state) })
  );
  app.get("/djangoapp/dealer/:id", (req, res) =>
    send(res, { status: 200, dealer: DEALERS.filter((d) => d.id === Number(req.params.id)) })
  );
  app.get("/djangoapp/reviews/dealer/:id", (req, res) =>
    send(res, { status: 200, reviews: Number(req.params.id) === 16 ? [] : reviewsFor(Number(req.params.id)) }, 200, 400)
  );
  app.get("/djangoapp/reviews/sample", (req, res) => {
    const picks = [REVIEW_BANK[0], REVIEW_BANK[1], REVIEW_BANK[2]].map(([review, purchase, name, make, model, year], i) => ({
      id: 900 + i,
      name,
      review,
      dealership: i + 1,
      dealer_name: DEALERS[i].full_name,
      car: `${year} ${make} ${model}`,
      purchase,
      ...sentimentOf(review),
    }));
    send(res, { reviews: picks }, 200, 300);
  });
  app.get("/djangoapp/get_cars", (req, res) =>
    send(res, {
      CarModels: [
        { CarMake: "Toyota", CarModel: "Camry" },
        { CarMake: "Honda", CarModel: "Civic" },
        { CarMake: "Ford", CarModel: "F-150" },
        { CarMake: "Subaru", CarModel: "Outback" },
        { CarMake: "Land Rover", CarModel: "Defender" },
      ],
    })
  );
  app.post("/djangoapp/analyze", async (req, res) => {
    const { text } = await readBody(req);
    if (!text || !String(text).trim()) return send(res, { error: "Enter some text to analyze." }, 400, 60);
    send(res, { ...sentimentOf(String(text)), analyzer_ms: 11 }, 200, 420);
  });
  app.post("/djangoapp/login", async (req, res) => {
    const { userName, password } = await readBody(req);
    if (password === "wrong") return send(res, { userName }, 200, 200);
    send(res, { userName, status: "Authenticated" }, 200, 200);
  });
  app.post("/djangoapp/register", async (req, res) => {
    const { userName } = await readBody(req);
    if (userName === "taken") return send(res, { userName, error: "Already Registered" });
    send(res, { userName, status: "Authenticated" });
  });
  app.get("/djangoapp/logout", (req, res) => send(res, { username: "" }, 200, 80));
  app.post("/djangoapp/add_review", (req, res) => send(res, { status: 200 }, 200, 500));
};
