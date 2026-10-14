FROM node:20-slim AS frontend
WORKDIR /frontend
COPY server/frontend/package*.json ./
RUN npm install -g npm@11 && npm ci
COPY server/frontend/ ./
RUN npm run build

FROM python:3.12-slim-bookworm

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV APP=/app

WORKDIR $APP

COPY server/requirements.txt $APP
RUN pip3 install -r requirements.txt

COPY server/ $APP
COPY --from=frontend /frontend/build $APP/frontend/build
COPY entrypoint.sh $APP/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/bin/bash","/app/entrypoint.sh"]

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 3 djangoproj.wsgi"]
