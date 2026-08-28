# Project Tech Stack: AI Debater

## 1. Front End & Client Layer
*   **Framework:** Next.js (App Router, TypeScript)
    *   *Why:* Handles routing cleanly, offers server-side rendering (SSR) for public debate landing pages/leaderboards (SEO optimization), and handles streaming APIs natively.
*   **Styling & UI:** TailwindCSS + shadcn/ui
    *   *Why:* Rapid building of responsive, highly polished dashboards, scorecards, and interactive chat elements.
*   **State Management & Data Fetching:** TanStack Query (React Query)
    *   *Why:* Manages cache synchronization, loading states, and continuous polling/fetching for background grading statuses effortlessly.

## 2. Back End & API Layer
*   **Core Framework:** Django (Python 3.11+)
    *   *Why:* Out-of-the-box relational ORM for tracking strict database states, robust built-in authentication, and seamless compatibility with data processing/AI ecosystem libraries.
*   **API Architecture:** Django REST Framework (DRF)
    *   *Why:* Provides serialization wrappers to clean up incoming user text, validate match requests, and structure outgoing scorecard datasets.
*   **Real-time Streaming:** Django Channels
    *   *Why:* Handles persistent ASGI WebSocket connections or Server-Sent Events (SSE) to stream live match states and grading update steps back to the client.

## 3. Asynchronous Task & Queue Infrastructure
*   **Message Broker:** Redis
    *   *Why:* Acts as a lightning-fast, in-memory cache for ephemeral presence data and serves as the transportation layer for the background worker queue.
*   **Background Worker Engine:** Celery
    *   *Why:* Offloads the heavy 5–15 second grading computations and multi-criteria LLM evaluations completely outside the HTTP request-response cycle, preventing server timeouts.

## 4. AI & Orchestration Layer
*   **SDK Core:** LangChain Expression Language (LCEL) or Native OpenAI/Anthropic Python Clients
    *   *Why:* Provides structured tool-calling parameters and robust retry/fallback mechanisms if an upstream AI provider experiences transient latency or downtime.
*   **Schema Enforcement:** Pydantic
    *   *Why:* Pairs natively with Django and AI tools to strictly validate that the LLM Judge outputs a perfectly formatted JSON structure matching your exact scorecard matrix requirements.

## 5. Database & Analytics Layer
*   **Primary Relational Store:** PostgreSQL
    *   *Why:* Safely links complex relational entities—Users, Matches, Rounds, Messages, and Scorecards—with full transactional integrity (ACID compliance). Provides indexing tools like `pg_trgm` to power fast full-text searching across public debate transcripts.

## 6. Deployment & DevOps (Production Target)
*   **Containerization:** Docker + Docker Compose
    *   *Why:* Standardizes the runtime environment across Django, Celery, Redis, and PostgreSQL, ensuring immediate environment parity from your local machine to live production.
*   **Reverse Proxy & Web Server:** Nginx + Gunicorn/Uvicorn
    *   *Why:* Nginx handles SSL termination and static asset delivery, routing traditional HTTP traffic through Gunicorn and asynchronous WebSocket traffic through Uvicorn.
