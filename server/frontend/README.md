# Frontend

The React single-page app for the dealership site. It is built into static files that the Django server serves; it has no server of its own in production.

## Stack

- React 19 with React Router 6
- Plain CSS, one theme ("Night Flight") over shared page components
- B612 and B612 Mono, self-hosted through Fontsource
- Create React App (`react-scripts`) for the dev server and build

## Pages

| Route | Component | Description |
| --- | --- | --- |
| `/` | `theme/index.jsx` | Landing page: instrument panel with live service status and the sentiment analyzer, sample reviews, request path |
| `/login` | `core/pages.jsx` | Sign in |
| `/register` | `core/pages.jsx` | Create an account |
| `/dealers` | `core/pages.jsx` | Dealership list with search and state filter |
| `/dealer/:id` | `core/pages.jsx` | One dealership and its reviews |
| `/postreview/:id` | `core/pages.jsx` | Review form (signed-in users) |
| `/about`, `/contact` | `core/pages.jsx` | Static content |

Django only sends `index.html` for paths listed in `server/djangoproj/urls.py`, so every route above needs a matching entry there. When you add or rename a route, update both files and any links to it; otherwise the page loads blank or returns a 404.

Page behaviour lives in `src/core/` and the look lives in `src/theme/`. The pages use `x-` class names and the theme styles them, so a restyle never touches page logic.

## Getting started

```bash
npm install
npm run build
```

Then run Django from `server/` (`python manage.py runserver`) and open http://localhost:8000. Django serves `build/index.html` for the app routes and handles the `/djangoapp/*` API calls on the same origin.

`npm start` runs the CRA dev server on http://localhost:3000 with hot reload, but it has no proxy to Django, so API calls fail there. Use `npm run start:mock` instead: it answers `/djangoapp/*` with fictional data from `src/setupProxy.js`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run build` | Builds the app into `build/` |
| `npm start` | Starts the dev server |
| `npm run start:mock` | Starts the dev server with a mock `/djangoapp/*` API |
| `npm test` | Runs tests with Jest and React Testing Library |

## Project structure

```
frontend/
├── public/              # index.html template, favicon, manifest
├── static/              # Shared static assets served by Django
└── src/
    ├── App.js           # Routes
    ├── index.js         # Entry point, wraps App in BrowserRouter
    ├── setupProxy.js    # Dev-only mock API (MOCK_API=1)
    ├── core/            # Data hooks, session, shared pages and components
    └── theme/           # Night Flight: layout, home page, stylesheet
```
