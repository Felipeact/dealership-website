import React, { useEffect, useState } from "react";
import { Button, Card, Chip, Link, Skeleton, Tabs, buttonVariants } from "@heroui/react";
import CarImage from "./CarImage";
import { carImage } from "./carImages";
import "../../styles/home.generated.css";

// Body styles and models stocked across the dealer network (from the inventory seed data).
const BODY_STYLES = [
  {
    id: "suv",
    label: "SUVs",
    blurb: "Room for the family and the gear, from compact crossovers to three-row haulers.",
    models: ["Toyota RAV4", "Kia Telluride", "Audi Q5", "Mercedes GLC", "Nissan Pathfinder", "Toyota 4Runner"],
  },
  {
    id: "sedan",
    label: "Sedans",
    blurb: "Comfortable daily drivers and executive cruisers with efficient powertrains.",
    models: ["Toyota Camry", "Audi A4", "Mercedes E-Class", "Nissan Altima", "Kia Stinger", "Toyota Avalon"],
  },
  {
    id: "hatchback",
    label: "Hatchbacks",
    blurb: "Easy to park, cheap to run, and more cargo space than you'd expect.",
    models: ["Toyota Prius", "Kia Soul", "Audi A3", "Kia Rio", "Toyota Yaris"],
  },
  {
    id: "coupe",
    label: "Coupes & convertibles",
    blurb: "Two doors, low roofs, and the open-top option for weekend drives.",
    models: ["Nissan 370Z", "Mercedes AMG GT", "Audi S5", "Audi TT", "Audi A5"],
  },
  {
    id: "pickup",
    label: "Pickups & vans",
    blurb: "Towing, hauling, and carpooling, with full-size trucks and a family minivan.",
    models: ["Toyota Tundra", "Toyota Tacoma", "Toyota Sienna"],
  },
];

const STEPS = [
  {
    title: "Find a dealer",
    body: "Filter the dealer network by state and see each location's address at a glance.",
  },
  {
    title: "Read owner reviews",
    body: "Every review is tagged positive, neutral, or negative by our sentiment analyzer.",
  },
  {
    title: "Share your experience",
    body: "Bought a car? Sign in and post a review to help the next buyer decide.",
  },
];

const logout = async () => {
  const res = await fetch(window.location.origin + "/djangoapp/logout", { method: "GET" });
  const json = await res.json();
  if (json) {
    const username = sessionStorage.getItem("username");
    sessionStorage.removeItem("username");
    alert("Logging out " + username + "...");
    window.location.href = window.location.origin;
  } else {
    alert("The user could not be logged out.");
  }
};

const SiteNav = ({ username }) => (
  <header className="sticky top-0 z-20 border-b border-separator bg-background/85 backdrop-blur">
    <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
      <a href="/" className="text-lg font-semibold tracking-tight text-foreground">
        Dealerships
      </a>
      <div className="hidden items-center gap-5 text-sm sm:flex">
        <Link href="/dealers">Dealers</Link>
        <Link href="/about">About us</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {username ? (
          <>
            <span className="hidden text-sm text-muted sm:inline">Signed in as {username}</span>
            <Button size="sm" variant="tertiary" onPress={logout}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <a href="/login" className={buttonVariants({ size: "sm", variant: "ghost" })}>
              Log in
            </a>
            <a href="/register" className={buttonVariants({ size: "sm" })}>
              Register
            </a>
          </>
        )}
      </div>
    </nav>
  </header>
);

// Live dealer-network numbers; hidden entirely if the API is unreachable.
const useDealerStats = () => {
  const [stats, setStats] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/djangoapp/get_dealers")
      .then((res) => res.json())
      .then(({ dealers }) => {
        if (cancelled) return;
        if (!Array.isArray(dealers)) throw new Error("Unexpected dealers response");
        setStats({
          status: "ready",
          dealers: dealers.length,
          states: new Set(dealers.map((d) => d.state)).size,
        });
      })
      .catch(() => !cancelled && setStats({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
};

const Stat = ({ value, label, loading }) => (
  <div>
    {loading ? (
      <Skeleton className="mb-1 h-8 w-14 rounded-md" />
    ) : (
      <p className="text-3xl font-semibold tabular-nums text-white">{value}</p>
    )}
    <p className="text-sm text-white/70">{label}</p>
  </div>
);

const Hero = ({ username }) => {
  const stats = useDealerStats();

  return (
    <section className="relative isolate overflow-hidden bg-[oklch(0.2_0.03_220)]">
      <div className="absolute inset-0 -z-10">
        {carImage("hero") && <CarImage slug="hero" alt="" className="opacity-70" />}
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.17_0.03_220)] via-[oklch(0.17_0.03_220/0.75)] to-transparent" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="max-w-xl">
          <Chip size="sm" variant="soft" color="accent" className="mb-5 bg-white/10 text-white">
            New and used vehicles nationwide
          </Chip>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Find the right car at a dealer you can trust.
          </h1>
          <p className="mt-5 text-lg text-white/80">
            Compare dealerships near you, read what owners say about them, and share your own experience after you buy.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/dealers" className={buttonVariants({ size: "lg" })}>
              Browse dealerships
            </a>
            {!username && (
              <a
                href="/register"
                className={`${buttonVariants({ size: "lg", variant: "outline" })} border-white/40 text-white hover:bg-white/10`}
              >
                Create an account
              </a>
            )}
          </div>
        </div>
        {stats.status !== "error" && (
          <div className="mt-14 flex gap-10 border-t border-white/15 pt-6">
            <Stat loading={stats.status === "loading"} value={stats.dealers} label="Dealerships" />
            <Stat loading={stats.status === "loading"} value={stats.states} label="States covered" />
          </div>
        )}
      </div>
    </section>
  );
};

const BodyStyles = () => (
  <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
    <div className="mb-8 max-w-2xl">
      <h2 className="text-3xl font-semibold tracking-tight">Shop by body style</h2>
      <p className="mt-3 text-muted">
        Our dealers stock 2020–2023 models from Audi, Kia, Mercedes, Nissan, and Toyota.
      </p>
    </div>
    <Tabs defaultSelectedKey="suv">
      <Tabs.ListContainer>
        <Tabs.List aria-label="Body styles">
          {BODY_STYLES.map((style) => (
            <Tabs.Tab key={style.id} id={style.id}>
              {style.label}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
      {BODY_STYLES.map((style) => (
        <Tabs.Panel key={style.id} id={style.id} className="pt-6">
          <Card className="grid overflow-hidden p-0 md:grid-cols-2">
            <div className="aspect-[4/3] md:aspect-auto md:min-h-80">
              <CarImage slug={style.id} alt={`A modern ${style.label.toLowerCase()} example`} />
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <Card.Header>
                <Card.Title className="text-2xl">{style.label}</Card.Title>
                <Card.Description>{style.blurb}</Card.Description>
              </Card.Header>
              <Card.Content className="mt-5">
                <p className="mb-3 text-sm font-medium text-muted">Popular models in stock</p>
                <div className="flex flex-wrap gap-2">
                  {style.models.map((model) => (
                    <Chip key={model} variant="secondary">
                      {model}
                    </Chip>
                  ))}
                </div>
              </Card.Content>
              <Card.Footer className="mt-auto pt-8">
                <Link href="/dealers">
                  Find a dealer near you
                  <Link.Icon />
                </Link>
              </Card.Footer>
            </div>
          </Card>
        </Tabs.Panel>
      ))}
    </Tabs>
  </section>
);

const HowItWorks = () => (
  <section className="border-y border-separator bg-background-secondary">
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
      <ol className="mt-10 grid gap-5 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <Card className="h-full">
              <Card.Header>
                <span className="mb-3 flex size-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-soft-foreground">
                  {i + 1}
                </span>
                <Card.Title>{step.title}</Card.Title>
                <Card.Description>{step.body}</Card.Description>
              </Card.Header>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

const ClosingCta = ({ username }) => (
  <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
    <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-accent px-8 py-12 text-accent-foreground md:flex-row md:items-center">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Ready to see what's on the lot?</h2>
        <p className="mt-2 opacity-85">Pick your state and see every dealership in our network.</p>
      </div>
      <a
        href="/dealers"
        className={`${buttonVariants({ size: "lg", variant: "secondary" })} bg-white text-[oklch(0.25_0.05_200)]`}
      >
        {username ? "View dealerships" : "Get started"}
      </a>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-separator">
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p>© {new Date().getFullYear()} Dealerships</p>
      <div className="flex gap-5">
        <Link href="/about">About us</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </div>
  </footer>
);

const Home = () => {
  const username = sessionStorage.getItem("username");

  useEffect(() => {
    document.title = "Dealerships | Find a car at a dealer you can trust";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav username={username} />
      <main>
        <Hero username={username} />
        <BodyStyles />
        <HowItWorks />
        <ClosingCta username={username} />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
