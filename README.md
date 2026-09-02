# DebateAI

DebateAI is an asynchronous, multi-turn platform where users can challenge an AI opponent in formal debate structures. Every match is evaluated by an independent, agentic "Judge" pipeline that scores performance across structured criteria, flags logical fallacies, and determines a winner based on dynamic evaluation matrices.

This project isn't hosted anywhere — to use it, run it yourself locally with Docker. See [docs/tech-stack.md](docs/tech-stack.md) for the full technical breakdown.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose v2 (Docker Desktop includes both)
- An [Anthropic API key](https://console.anthropic.com/) — the AI opponent and judge pipeline call the Anthropic API, so the app won't function without one

## Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/raymansarowa976/debate-ai.git
   cd debate-ai
   ```

2. Create your env files from the provided examples:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Edit `backend/.env` and set:
   - `ANTHROPIC_API_KEY` — your key from the Anthropic Console
   - `DJANGO_SECRET_KEY`, `JWT_SECRET_KEY`, `POSTGRES_PASSWORD` — replace the `change-me` placeholders with your own values (any random strings work for local use)

   The defaults for everything else (database, Redis, CORS/allowed hosts, frontend URLs) are already wired for a local Docker Compose setup and normally don't need changes.

4. Build and start all services:

   ```bash
   docker compose up --build
   ```

   This starts Postgres, Redis, the Django web (Gunicorn) and ASGI (Uvicorn/Channels) processes, the Celery worker, the Next.js frontend, and an Nginx reverse proxy in front of everything.

5. In a separate terminal, run the database migrations (first run only, and after pulling changes that add migrations):

   ```bash
   docker compose exec web python manage.py migrate
   ```

6. (Optional) Create an admin user to access the Django admin at `/admin/`:

   ```bash
   docker compose exec web python manage.py createsuperuser
   ```

7. Open the app at [http://localhost](http://localhost).

## Stopping / restarting

```bash
docker compose down          # stop everything, keep data
docker compose up            # start again without rebuilding
docker compose down -v       # stop and wipe the Postgres/Redis volumes
```

## Notes

- Everything is served through Nginx on port 80 — you shouldn't need to hit the frontend (3000), web (8000), or ASGI (8001) ports directly.
- Code in `backend/` and `frontend/` is bind-mounted into the containers, so local edits are picked up without a rebuild (the frontend dev server hot-reloads; Django/Celery containers restart automatically only if you add a watcher — otherwise `docker compose restart web asgi celery_worker` after backend changes).
- `docker-compose.prod.yml` builds against published GHCR images instead of building locally and is intended for a real deployment, not local development.

## License

MIT — see [LICENSE](LICENSE).
