import React, { useEffect, useState } from "react";
import { Button, Link, buttonVariants } from "@heroui/react";
import SampleReviews from "./SampleReviews";
import SentimentDemo from "./SentimentDemo";
import StatusStrip from "./StatusStrip";
import SystemMap from "./SystemMap";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/martian-mono/wdth.css";
import "../../styles/home.generated.css";

// sessionStorage throws in some privacy modes; treat that as signed out.
const readUsername = () => {
  try {
    return sessionStorage.getItem("username");
  } catch {
    return null;
  }
};

const NAV_LINKS = [
  { href: "/dealers", label: "Dealers" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

const SiteNav = ({ username }) => {
  const [logout, setLogout] = useState({ status: "idle" });
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (logout.status === "pending") return;
    setLogout({ status: "pending" });
    try {
      const res = await fetch("/djangoapp/logout", { method: "GET" });
      if (!res.ok) throw new Error(`Logout failed with ${res.status}`);
      try {
        sessionStorage.removeItem("username");
      } catch {
        // Nothing stored to clear.
      }
      window.location.href = window.location.origin;
    } catch {
      setLogout({ status: "error" });
    }
  };

  return (
    <header
      className="sticky top-0 z-20 border-b border-separator bg-background/85 backdrop-blur"
      onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <a href="/" className="text-lg font-semibold font-stretch-semi-expanded tracking-tight text-foreground">
          Dealerships
        </a>
        <div className="hidden items-center gap-5 text-sm sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {username ? (
            <>
              {logout.status === "error" ? (
                <span role="alert" className="text-sm text-danger">
                  Couldn't log out. Try again.
                </span>
              ) : (
                <span className="hidden max-w-48 truncate text-sm text-muted sm:inline">Signed in as {username}</span>
              )}
              <Button
                size="sm"
                variant="tertiary"
                onPress={handleLogout}
                aria-disabled={logout.status === "pending"}
                className="pointer-coarse:h-11"
              >
                {logout.status === "pending" ? "Logging out…" : "Log out"}
              </Button>
            </>
          ) : (
            <>
              <a href="/login" className={`${buttonVariants({ size: "sm", variant: "ghost" })} pointer-coarse:h-11`}>
                Log in
              </a>
              <a href="/register" className={`${buttonVariants({ size: "sm" })} pointer-coarse:h-11`}>
                Register
              </a>
            </>
          )}
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="-mr-2 flex size-11 items-center justify-center rounded-full text-foreground hover:bg-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:hidden"
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              {menuOpen ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
            </svg>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <ul id="site-menu" className="border-t border-separator px-4 py-2 sm:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="flex min-h-11 items-center text-base font-medium text-foreground">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
};

const Hero = ({ username }) => (
  <section className="bay relative isolate overflow-hidden bg-bay selection:bg-accent/40 selection:text-white">
    {/* Three children: copy, instrument, status. Desktop pins copy to the panel's top and status to its
        bottom; mobile reads copy → instrument → status so the live result comes sooner. */}
    <div className="mx-auto grid max-w-6xl gap-x-16 gap-y-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:grid-rows-[1fr_auto] lg:py-24">
      <div className="max-w-xl lg:col-start-1 lg:row-start-1 lg:self-center">
        <h1 className="text-4xl font-semibold font-stretch-semi-expanded leading-[1.1] tracking-tight text-balance text-white sm:text-5xl">
          Dealer reviews, scored by what owners actually wrote.
        </h1>
        <p className="mt-6 text-lg text-white/80">
          Browse dealerships by state and read what owners say about them. There are no star ratings: a sentiment
          model, running as its own service, labels every review from its text. Try it yourself.
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
              Sign up to review
            </a>
          )}
        </div>
      </div>
      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <SentimentDemo />
      </div>
      <div className="max-w-xl border-t border-white/15 pt-5 lg:col-start-1 lg:row-start-2 lg:self-end">
        <StatusStrip />
      </div>
    </div>
  </section>
);

const ClosingCta = () => (
  <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
    <div className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-accent px-8 py-12 text-accent-foreground md:flex-row md:items-center">
      <div className="max-w-xl">
        <h2 className="text-2xl font-semibold font-stretch-semi-expanded tracking-tight text-balance sm:text-3xl">
          Every label here was computed, not chosen.
        </h2>
        <p className="mt-3">
          Open any dealership to read its reviews and see what the model made of them, or read how the four services
          fit together.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <a
          href="/dealers"
          className={`${buttonVariants({ size: "lg", variant: "secondary" })} bg-white text-[oklch(0.25_0.05_200)]`}
        >
          Browse dealerships
        </a>
        <a
          href="https://github.com/Felipeact/dealership-website"
          className={`${buttonVariants({ size: "lg", variant: "outline" })} border-white/60 text-white hover:bg-white/10`}
        >
          Read the source
        </a>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-separator">
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p>© {new Date().getFullYear()} Dealerships</p>
      <div className="flex gap-5">
        <Link href="/dealers">Dealers</Link>
        <Link href="/about">About us</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </div>
  </footer>
);

const Home = () => {
  const username = readUsername();

  useEffect(() => {
    document.title = "Dealerships | Dealer reviews, scored by what owners wrote";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav username={username} />
      <main>
        <Hero username={username} />
        <SampleReviews />
        <SystemMap />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
