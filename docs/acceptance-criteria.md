# GitHub Issues Spec: DebateAI Project Board

---

## Epic 0: Infrastructure & DevOps Setup

### Issue 0.1: Configure Multi-Container Orchestration with Docker Compose
*   **Description:** Initialize the project's base containerization layer to ensure environment parity across all components.
*   **Acceptance Criteria:**
    *   [x] Create a `docker-compose.yml` file defining services for `web` (Django), `frontend` (Next.js), `db` (PostgreSQL), `redis` (Broker/Cache), and `celery_worker`.
    *   [x] Configure named Docker volumes for `pg_data` and Redis snapshots to ensure data persistence across container restarts.
    *   [x] Set up a service health check on the `db` container that blocks the `web` and `celery_worker` containers from launching until PostgreSQL is fully accepting connections.
*   **Verification:** Run `docker compose up --build` and confirm all 5 services initialize cleanly, communicate over the shared network, and persist data.

### Issue 0.2: Configure Nginx Local Reverse Proxy for WSGI/ASGI Routing
*   **Description:** Set up a local gateway using Nginx to handle routing splitting between traditional synchronous REST API paths, live asynchronous streaming connections, and frontend requests.
*   **Acceptance Criteria:**
    *   [x] Create an Nginx configuration file routing traditional REST API paths (`/api/*`) to Gunicorn on the WSGI boundary.
    *   [x] Route WebSocket or Server-Sent Events stream paths (`/api/ws/*`) to Uvicorn on the ASGI boundary.
    *   [x] Route all remaining fallback traffic to the Next.js port.
*   **Verification:** Assert that hitting local paths resolves correctly to the proper upstream application container without throwing network gateway errors.

### Issue 0.3: Establish Distributed Task Ingestion & Environment Architecture
*   **Description:** Hook Django up to the Redis container broker for Celery scheduling and set up secure environment variable parsing.
*   **Acceptance Criteria:**
    *   [x] Configure Django `settings.py` to target the Redis service container as the primary `CELERY_BROKER_URL`.
    *   [x] Establish identical, clean `.env.example` configurations across the frontend and backend boundaries.
    *   [x] Ensure all sensitive properties (OpenAI Keys, DB Credentials, Django Secret Key) are loaded securely at the process boundary using decoupled environment parsers.
*   **Verification:** Run a basic Celery diagnostic check command ensuring workers are visible, responding, and successfully listening to the Redis queue.

---

## Epic 1: The Match Engine (State & Guardrails)

### Issue 1.1: Build Topic Ingestion, Sanitization, and Relational Schema Models
*   **Description:** Set up the primary relational database schema tables alongside text verification logic for initializing new debate matches.
*   **Acceptance Criteria:**
    *   [x] Implement PostgreSQL database schema tables for `User`, `Match`, `Round`, `Message`, and `Scorecard` with appropriate foreign key cascade paths.
    *   [x] Apply explicit indices on `match_id` and relational user identifiers.
    *   [x] Add backend input validations on the topic creation endpoint ensuring strings are non-empty, under 100 characters, and pass a basic automated text moderation check.
    *   [x] Instantiate a new `Match` record with an initial status of `INITIALIZED` and lock the format rules into the metadata upon setup.
*   **Verification:** Verify through Django migrations and admin tools that schemas build cleanly and throw validation errors when submitting non-compliant topics.

### Issue 1.2: Implement Turn-State Machine, Turn Lockout, and Content Guardrails
*   **Description:** Enforce strict turn patterns between the user and the AI, blocking unlawful simultaneous post attempts.
*   **Acceptance Criteria:**
    *   [ ] Introduce an idempotent status flag tracking `USER_TURN` and `AI_TURN` states.
    *   [ ] Build a backend permission guard or interceptor that blocks incoming user message posts and responds with an HTTP `409 Conflict` if the state is currently set to `AI_TURN`.
    *   [ ] Implement text processors enforcing a strict minimum of 50 words and maximum of 500 words per turn.
*   **Verification:** Covered by **Test 4 (Backend)** and **Test 2 (Frontend)**. Assert 409 payloads return when hitting active locks, and check text length rejection flows.

### Issue 1.3: Build Frontend Input Locking & Skeleton UI States
*   **Description:** Manage the UI user interface states to reflect active background processing safely.
*   **Acceptance Criteria:**
    *   [ ] Configure the Next.js debate panel to read the matching state engine variables.
    *   [ ] When the state resolves to `AI_TURN`, programmatically apply the `disabled` attribute to the argument `<textarea>` and submit `<button>`.
    *   [ ] Mount a clear visual skeleton text loader component inside the DOM during active background rendering.
*   **Verification:** Covered by **Test 1 (Frontend)**. Assert UI inputs lock completely when transitioning into processing states.

---

## Epic 2: Intelligent Opponent Engine (The Contender)

### Issue 2.1: Architect AI Context Slicing Pipeline & Persona Enforcement
*   **Description:** Build the background ingestion compiler that structures high-density prompt payloads for the AI adversary.
*   **Acceptance Criteria:**
    *   [ ] Build a backend context assembly utility that takes a raw debate thread transcript, generates a short rolling summary paragraph of old rounds, and attaches only the latest active user statement to limit token overhead.
    *   [ ] Design an aggressive system prompt matrix that binds the LLM opponent to its designated stance, forcing it to resist middle-ground conciliation.
    *   [ ] Attach an 8-second execution timeout guard onto the client request layer with a fallback system message return parameter if connections fail.
*   **Verification:** Inspect raw payload text sent to the LLM endpoint during test simulations to confirm context limits and summary composition.

---

## Epic 3: Asynchronous Evaluation Pipeline (The Judge)

### Issue 3.1: Build Non-Blocking Celery Evaluation Endpoint
*   **Description:** Setup the transaction handoff that moves heavy evaluation tasks out of the synchronous server request loop.
*   **Acceptance Criteria:**
    *   [ ] Create a dedicated post-debate submission route in Django REST Framework.
    *   [ ] Upon capturing the final closing text chunk, transactionally switch the match status to `EVALUATING`.
    *   [ ] Instantly drop a serialized task event message down to the Celery worker queue via Redis and return an HTTP `202 Accepted` response back to the client within 200ms.
*   **Verification:** Covered by **Test 5 (Backend)**. Assert instant HTTP 202 validation loops run without holding server execution threads open.

### Issue 3.2: Implement Pydantic Evaluation Schema Validation & Retry Handlers
*   **Description:** Build strict ingestion schemas for the AI judge's feedback data models alongside failure handling.
*   **Acceptance Criteria:**
    *   [ ] Establish a strict `Pydantic` schema class parsing four designated integer fields (`logic`, `evidence`, `rhetoric`, `adherence`) along with a structured dictionary list for `fallacies_detected`.
    *   [ ] Implement an exponential back-off automated task retry system inside the Celery worker configuration block capped at 3 max attempts.
    *   [ ] Ensure a clean database transactional update that shifts the match record to `COMPLETED` and appends the final valid scorecard JSON data upon processing.
*   **Verification:** Covered by **Test 6 (Backend)**. Mock invalid JSON configurations and ensure error traps catch data errors and rerun the handler cleanly.

### Issue 3.3: Set Up Real-Time Grading Status Event Streaming
*   **Description:** Connect Django Channels to stream ongoing grading status changes back to the client UI.
*   **Acceptance Criteria:**
    *   [ ] Create a Django Channels consumer bound to Redis Pub/Sub channels to catch background task compilation statuses.
    *   [ ] Configure the Celery worker to push incremental events (`"JUDGE_START"`, `"LOGIC_EVALUATED"`, `"FINAL_COMPILATION"`) down to Redis as steps complete.
    *   [ ] Implement a Client UI listener using Server-Sent Events (SSE) or WebSockets to parse incoming status streams and render descriptive message steps on screen.
*   **Verification:** Covered by **Test 3 (Frontend)**. Verify live frontend UI rendering changes execute smoothly as progress signals are injected.

---

## Epic 4: Virality & Public Engagement (The Showcase)

### Issue 4.1: Build Secure Public Routing and Privacy Sanitization
*   **Description:** Allow users to share debate outcomes through randomized, non-enumerable cryptographic hashes while wiping user profiles for security.
*   **Acceptance Criteria:**
    *   [ ] Configure a cryptographic hash slug router utility (e.g., changing paths from `/debates/1` to `/debates/mj8-q2p-x9k`).
    *   [ ] Ensure all default matches are securely initialized as private, isolated via active authentication guards.
    *   [ ] Build specific data optimization database queries for the public access page that entirely exclude user email addresses, sequential IDs, or profile metrics.
*   **Verification:** Covered by **Test 7 (Backend)**. Assert unauthenticated user lookups pull clean, unidentifiable timeline information securely.

### Issue 4.2: Implement Server-Side Dynamic OpenGraph Meta-Tag Injection
*   **Description:** Configure server-side header meta rendering for rich links when links are shared out across social pipelines.
*   **Acceptance Criteria:**
    *   [ ] Build an asynchronous server-side function within Next.js to intercept public hash slug routing requests.
    *   [ ] Query the match metadata dataset directly prior to final client markup delivery.
    *   [ ] Inject custom HTML `<meta>` properties (OpenGraph and Twitter Card targets) dynamically compiling the specific match scores inside the title and snippet block descriptions.
*   **Verification:** Execute local curl tests against public debate share pages and inspect head tags to confirm strings match scorecard evaluations perfectly.
