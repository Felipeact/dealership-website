# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The real audience is people evaluating the author's work: recruiters, hiring managers, and course reviewers looking at this as a full-stack capstone and portfolio piece. They usually skim it in one sitting, often from a link in a résumé or repo, and judge the engineering and the design craft.

Inside the product, the site plays to a fictional persona: a car shopper comparing dealerships before buying, and a buyer who has just bought a car and wants to leave a review.

## Product Purpose

A car dealership review site. Visitors browse a national dealer network, filter it by state, open a dealer to read customer reviews, and post their own review once they are signed in. A sentiment analyzer tags every review as positive, neutral, or negative.

Success means a reviewer finishes a short visit convinced that the author can ship a coherent, well-made, multi-service product, and that the UI holds up as finished work rather than as course scaffolding.

## Positioning

What sets it apart is that sentiment is computed from the review text by a dedicated analyzer service (NLTK VADER), rather than coming from star ratings the reviewer picks. Under the hood it is a real four-service system (React → Django → Express/MongoDB + Flask), and the UI should make that depth legible instead of hiding it.

## Operating Context

- The repo and the deployed site are what reviewers see. README.md documents the architecture and is part of the presentation.
- Django serves the React build and proxies `/djangoapp/*` to the Express dealer/review API and the Flask sentiment service.
- Auth is Django sessions; the frontend keeps the username in `sessionStorage`.
- Routes: `/` home, `/dealers` list with state filter, `/dealer/:id` detail and reviews, `/postreview/:id` (signed in), `/login`, `/register`. `/about` and `/contact` are React pages too; Django serves `index.html` for them.

## Capabilities and Constraints

- Frontend: React 19 (CRA / react-scripts), React Router 6, plain CSS. Every page uses one theme, "Night Flight" (`src/theme/`), over shared page logic and components (`src/core/`). No Bootstrap, Tailwind or component library.
- Fonts are self-hosted through Fontsource (B612 and B612 Mono).
- `npm run start:mock` serves fictional API data (`src/setupProxy.js`) so the UI can be worked on without the four services.
- Data available from the API: dealers (name, city, state, address, zip, lat/long), reviews (reviewer name, text, purchase flag/date, car make/model/year, sentiment), and car makes/models from Django.
- Deploy: Docker image plus a Kubernetes Deployment (`Dockerfile`, `deployment.yaml`). CI runs flake8 and JSHint.
- Terminology: "dealer"/"dealership", "review", sentiment values `positive` / `neutral` / `negative`.

## Brand Commitments

- Name: **"Dealerships"**, the wordmark in the current nav. Do not rebrand to "Best Cars". The legacy About page mentions "Best Cars dealership", but that is course boilerplate, not the brand.

## Evidence on Hand

- Seed data (`server/database/data/`): 50 fictional dealerships, 50 placeholder reviews (lorem-style text), and car records. All of it is **mock**.
- Seed content **may be replaced** with more realistic but still clearly fictional names and review text when that helps the design.
- Absent, and not to be fabricated as real: customer testimonials, ratings or star scores, sales figures, press, partner logos, and team bios (the old About page's "Person1" entries were placeholders and are gone). Any number shown in the UI must come from the API, as the home page's live dealer/state counts already do.

## Product Principles

1. **Finished, not scaffolded.** Every page should read as a deliberate product. Leftover course boilerplate counts against the portfolio.
2. **Show the system.** The sentiment analysis and the multi-service data flow are the differentiators, so surface them truthfully instead of burying them.
3. **Truthful with fiction.** The data is mock and that's fine. Never present invented claims, ratings, or social proof as real.
4. **Fast to evaluate.** A reviewer should grasp what the product does and reach the core flow (browse → dealer → reviews) within seconds.
