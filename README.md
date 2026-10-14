# Dealership Website

A full-stack car dealership review site. Visitors browse a national network of dealerships, filter them by state, read customer reviews (each tagged positive, neutral or negative by a sentiment analyzer), and, once signed in, post their own reviews.

## Architecture

The app is made of four services:

```
                       ┌────────────────────────────┐
  Browser  ──────────► │  Django (port 8000)        │
                       │  - serves the React build  │
                       │  - auth (SQLite)           │
                       │  - car makes/models        │
                       │  - /djangoapp/* JSON API   │
                       └──────┬──────────────┬──────┘
                              │              │
                 dealers/reviews        review text
                              │              │
                              ▼              ▼
              ┌──────────────────────┐  ┌──────────────────────────┐
              │ Express + Mongoose   │  │ Flask sentiment analyzer │
              │ API (port 3030)      │  │ NLTK VADER (port 5000)   │
              └──────────┬───────────┘  └──────────────────────────┘
                         ▼
              ┌──────────────────────┐
              │ MongoDB (port 27017) │
              └──────────────────────┘
```

| Service | Location | Stack | Purpose |
| --- | --- | --- | --- |
| Frontend | [server/frontend](server/frontend) | React 19, React Router, plain CSS (Night Flight theme) | Single-page UI, built into static files that Django serves |
| Django app | [server](server) | Django, SQLite, gunicorn | Users and sessions, car makes/models, proxy API to the other services |
| Dealer/review API | [server/database](server/database) | Node.js, Express, Mongoose, MongoDB | Stores dealerships and reviews, seeded from JSON on startup |
| Sentiment analyzer | [server/djangoapp/microservices](server/djangoapp/microservices) | Flask, NLTK VADER | Classifies review text as positive, neutral or negative |

See the [backend README](server/README.md) and the [frontend README](server/frontend/README.md) for details on each part.

## Repository layout

```
.
├── .github/workflows/main.yml   # CI: flake8 for Python, JSHint for server/database
├── Dockerfile                   # Container image for the Django app
├── entrypoint.sh                # Runs migrations and collectstatic, then starts the server
├── deployment.yaml              # Kubernetes Deployment for the Django image
└── server/
    ├── djangoproj/              # Django project settings and top-level URLs
    ├── djangoapp/               # Django app: models, views, REST client, microservices/
    ├── database/                # Express + MongoDB dealer/review service
    ├── frontend/                # React app
    ├── manage.py
    └── requirements.txt
```

## Quick start (local)

Prerequisites: Python 3.12, Node.js 18+, Docker.

1. **Start MongoDB and the dealer/review API**

   ```bash
   cd server/database
   docker build -t nodeapp .
   docker compose up
   ```

   The API is now on http://localhost:3030.

2. **Start the sentiment analyzer** (optional; `server/djangoapp/.env` points to a hosted instance by default)

   ```bash
   cd server/djangoapp/microservices
   docker build -t sentiment .
   docker run -p 5050:5000 sentiment
   ```

   Then set `sentiment_analyzer_url=http://localhost:5050/` in `server/djangoapp/.env`.

3. **Build the frontend**

   ```bash
   cd server/frontend
   npm install
   npm run build
   ```

4. **Run Django**

   ```bash
   cd server
   python -m venv .venv
   source .venv/bin/activate      # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
   ```

Open http://localhost:8000.

To use the Django admin, create an account with `python manage.py createsuperuser` and go to http://localhost:8000/admin/.

## Deployment

The root [Dockerfile](Dockerfile) builds the Django app image. On start, [entrypoint.sh](entrypoint.sh) runs migrations and `collectstatic`, then launches gunicorn on port 8000. [deployment.yaml](deployment.yaml) deploys that image to Kubernetes; replace `us.icr.io/your-name-space/dealership:latest` with your own registry path.

The Dockerfile expects `requirements.txt`, `manage.py` and `entrypoint.sh` in the build context, so build it from `server/` with the frontend already built:

```bash
cd server/frontend && npm install && npm run build && cd ..
cp ../entrypoint.sh .
docker build -f ../Dockerfile -t dealership .
```

The dealer/review API and the sentiment analyzer are deployed separately, and the Django app finds them through the `backend_url` and `sentiment_analyzer_url` environment variables.

## Continuous integration

[.github/workflows/main.yml](.github/workflows/main.yml) runs on pushes and pull requests to `main`:

- **flake8** on every Python file
- **JSHint** on the JavaScript in `server/database`

## License

[Apache License 2.0](LICENSE)
