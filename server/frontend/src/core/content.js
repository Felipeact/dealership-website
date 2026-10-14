// Product copy and structure shared by every page. Nothing here is a claim the product can't back up.

export const REPO_URL = "https://github.com/Felipeact/dealership-website";

export const NAV_LINKS = [
  { href: "/dealers", label: "Dealers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const EXAMPLES = [
  { label: "Happy buyer", text: "Best buying experience I've ever had. Friendly, fast, and honest about the car's history." },
  { label: "Mixed visit", text: "The finance guy was pushy, but the service team was great." },
  { label: "Bad experience", text: "They sold me a car with a cracked windshield and stopped answering my calls." },
];

export const LANES = [
  { id: "browser", name: "Browser", tech: "React", role: "This page, with each route loaded on demand." },
  { id: "django", name: "Django", tech: "Python", role: "Serves the app, signs you in, and proxies every data call." },
  { id: "express", name: "Express", tech: "Node · MongoDB", role: "Stores the dealerships and their reviews." },
  { id: "flask", name: "Flask", tech: "NLTK VADER", role: "Scores review text as positive, neutral, or negative." },
];

// The request path in djangoapp/views.py get_dealer_reviews, in order.
export const STEPS = [
  { from: "browser", to: "django", call: "GET /djangoapp/reviews/dealer/15" },
  { from: "django", to: "express", call: "GET /fetchReviews/dealer/15" },
  { from: "express", to: "django", call: "reviews from MongoDB", reply: true },
  { from: "django", to: "flask", call: "POST /analyze, once per review" },
  { from: "flask", to: "django", call: "{ sentiment, scores }", reply: true },
  { from: "django", to: "browser", call: "reviews with sentiment labels", reply: true },
];

export const laneName = (id) => LANES.find((l) => l.id === id)?.name ?? id;

export const FAILURE = {
  express_unreachable: "The reviews live in MongoDB behind the Express service, and it isn't answering right now.",
  analyzer_unreachable: "The reviews loaded, but the Flask sentiment service didn't answer, so they can't be labelled.",
  django_unreachable: "The Django API isn't answering, so nothing behind it can be reached.",
};

export const ABOUT = {
  lede: "A dealership review site where the sentiment label is computed from the words, not picked from a star menu.",
  points: [
    {
      title: "What you can do here",
      body: "Browse a national network of dealerships, filter by state, open a dealer to read what owners wrote, and, once you have an account, post a review of your own.",
    },
    {
      title: "How reviews get their label",
      body: "No one chooses positive, neutral or negative. When a page asks for reviews, Django sends each review's text to a separate Flask service running NLTK's VADER model, and the answer is what you see. Nothing is stored with the label.",
    },
    {
      title: "What VADER gets wrong",
      body: "It is a word-level model. It weighs the clause after “but” heavily, so a mixed review often reads fully positive or fully negative. The analyzer on the home page lets you test that yourself.",
    },
    {
      title: "Everything here is fictional",
      body: "The 50 dealerships and their reviews are mock data seeded into MongoDB. They stand in for a real network and are not real businesses or real customers.",
    },
  ],
};
