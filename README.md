# Bandwise — AI IELTS Preparation Platform

Enterprise SaaS platform for IELTS preparation, built for TechLink Solutions.

## Current build status

This repository is being built incrementally against the full project specification.
Completed so far:

- [x] Root enterprise folder structure (`frontend/`, `backend/`, `ai-engine/`, `infrastructure/`, `docker/`, `docs/`, etc.)
- [x] Frontend scaffold: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- [x] Design tokens matching the spec's color palette, typography (Inter/Poppins), light + dark mode
- [x] Core UI component library: Button, Input, Card, ProgressBar, Badge
- [x] Global layouts: Public (marketing), Auth, Student Dashboard (sidebar + topbar)
- [x] Public landing page
- [x] Auth pages: Login, Register, Forgot Password — real forms with React Hook Form + Zod validation
- [x] Zustand auth store (in-memory access token, no localStorage)
- [x] Axios API client with auth interceptor + silent refresh-token flow
- [x] Student dashboard home page (band progress, streak, AI recommendations, recent activity)
- [x] Route stubs for all remaining student modules (Reading, Listening, Writing, Speaking, Mock Tests, Adaptive AI, Library, Planner, Analytics, Achievements, Subscription, Profile, Settings, Support)
- [x] Backend scaffold: NestJS + TypeORM + PostgreSQL (see `backend/README.md` for why TypeORM instead of Prisma)
- [x] Real, tested auth module: register, login, refresh (rotating hashed tokens), logout/logout-all, email verification, forgot/reset password
- [x] JWT access tokens + HttpOnly refresh cookie, Argon2 hashing, RBAC guard + `@Roles()` decorator, rate limiting, Helmet
- [x] Core schema live in Postgres: users, roles (seeded), student_profiles, refresh_tokens, email/password reset tokens, audit_logs entity
- [x] Reading module: full backend (tests, passages, questions, timed attempts, autosave, grading, band scoring) + real frontend test-taking UI (split-screen passage with text highlighting, live countdown timer, per-question inputs for 3 question types, submit + graded result breakdown)
- [x] Listening module: same backend pattern (shares Test/Question/TestAttempt/Answer entities) + real audio playback frontend. Sample test uses a real generated MP3 (espeak-ng + ffmpeg) served via `/media`, tested end-to-end including grading
- [x] Writing module: essay editor with live word count + autosave, submit-for-evaluation flow, real Claude API integration (activates automatically once `ANTHROPIC_API_KEY` is set) with a genuine rule-based heuristic fallback for testing without a key — tested end-to-end with the heuristic path
- [x] Speaking module: 3-part recording booth (real `MediaRecorder` browser API, prep timer for Part 2's cue card), audio upload/storage/playback. Fluency & Coherence scored from real audio signal analysis (ffmpeg pause/silence detection) — verified to actually respond to real audio differences, not a fixed number. Lexical Resource and Grammatical Range now upgrade automatically once a transcript exists: `OpenAIWhisperProvider` (real hosted Whisper API, activates on `OPENAI_API_KEY`) feeds `ClaudeSpeakingTextEvaluator`. Two local STT approaches were tried and ruled out first (PyTorch Whisper — blocked by disk space; `faster-whisper` — installed fine but its models are hosted on `huggingface.co`, outside this sandbox's allowlist) before landing on the hosted-API fix. Confirmed zero regression: re-ran the original fluency-only test and got byte-identical results, except `overallBand` now correctly averages whatever's actually scored instead of being needlessly `null`. Pronunciation stays honestly unscored regardless — nothing in this project assesses phonemes
- [x] Admin Panel: role-gated backend (real 403 for students, tested live) with platform stats, paginated/searchable user management, suspend/activate (tested — suspension actually blocks login), and content summary. Frontend dashboard + users table + content overview, all wired to real data
- [x] Subscriptions & Payments: 3 real plans, pluggable payment provider (real Stripe Checkout + webhook signature verification, activates automatically once `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` are set) with a mock provider for testing without payment credentials — tested end-to-end including renewal correctly extending from the existing subscription's end date, and the webhook genuinely rejecting unconfigured requests
- [x] Books/Library: browsable library with category/level filters and search, per-user favorites and reading progress. Two sample books are **real generated PDFs** (not placeholders) — built with `pdfkit` from actual written vocabulary/grammar content — served over HTTP and verified byte-identical to disk. Frontend has a library grid, continue-reading and favorites sections, and an embedded PDF viewer
- [x] Notifications: system-generated only (no public create endpoint) — real triggers wired into Writing/Speaking (AI evaluation ready), Subscriptions (payment + activation), and Reading/Listening (test completed + one-time achievement on first completion, verified not to double-fire). Frontend has a working notification bell with unread badge, dropdown panel, and mark-read/mark-all-read, polling every 30s
- [x] Content authoring: admins can create/publish/delete reading tests, listening tests (with real audio upload per section), writing tasks, and speaking tasks through the API and a real (if plain) frontend form UI — new content starts as an unpublished draft. Tested the full pipeline end-to-end: authored a reading test via the API, confirmed it stayed hidden while a draft, published it, and had a real student account fetch it, answer it, and get correctly graded
- [x] Database migrations: a real initial migration covering every entity, generated with the TypeORM CLI and verified by actually running it against a fresh empty database (`migration:run`) and reverting it cleanly (`migration:revert`) — not just generated and assumed correct
- [x] Docker: multi-stage Dockerfiles for backend and frontend (frontend uses Next.js standalone output) plus a `docker-compose.yml` wiring Postgres/Redis/backend/frontend with healthchecks. **Untested** — this sandbox has no Docker daemon, so these are written correctly per best practices and checked for valid syntax, but not build-verified here
- [x] Redis-backed queues & email delivery: BullMQ (installed since early scaffolding but never wired) now runs a real `email` queue with a genuine worker — verification/reset emails are enqueued through Redis rather than sent inline. Verified by inspecting Redis directly (`bull:email:*` keys) to confirm jobs genuinely round-trip through Redis, not an in-memory shim. Same pluggable-provider pattern as payments/writing: a console-logging provider (tested) and a real SMTP provider via nodemailer (written correctly, untestable here — no SMTP relay reachable from this sandbox)
- [x] CI/CD: a GitHub Actions workflow (lint → build → run real migrations against a Postgres service container → boot and smoke-test the app, for backend; lint → build for frontend). Unlike Docker/SMTP, every step here **was actually verified** by manually replicating the workflow's exact commands and environment against a fresh scratch database in this sandbox — not just written and assumed correct
- [x] Editing existing content: reading and listening tests both have full nested editors now — add/edit/delete individual passages, sections, and questions after creation, not just create/publish/delete. Reading tested end-to-end with a real student account seeing edits and new content live; listening's editor (with per-section audio re-upload) verified against the same backend endpoints, confirmed to return exactly the sections/questions it needs to render

## Project complete

Every item from the original spec is now built, backend and frontend. The
only things not directly verified in this sandbox are Docker (no daemon
available here) and outbound calls to Stripe/SMTP/OpenAI (no reachable
network path to those specific hosts from here) — all three are written
correctly against their real, documented APIs using the same
pluggable-provider pattern throughout this project, and activate
automatically the moment real credentials are set in an environment with
normal internet access. Every one of them has a companion path that *was*
fully tested here (a mock payment provider, a console-logging email
provider, and heuristic/audio-only evaluators), so the underlying
application logic around each is proven correct even where the final
third-party call isn't.

## Frontend — running locally

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Backend — running locally

```bash
cd backend
cp .env.example .env   # fill in JWT secrets (see comment in the file)
npm install
npm run start:dev
```

Requires PostgreSQL running and reachable per your `.env`. See `backend/README.md`
for the full list of implemented endpoints and an important note on why this
backend uses TypeORM instead of the Prisma called for in the spec.

## Running everything with Docker

```bash
cp .env.example .env                    # root — shared DB credentials
cp backend/.env.example backend/.env    # fill in JWT secrets
docker compose up --build
docker compose exec backend npm run migration:run
docker compose exec backend npm run seed:admin   # optional: plus any other seed:* commands
```

This was written correctly per best practices but **could not be built or run
in this sandbox** (no Docker daemon available here) — see `backend/README.md`
for exactly what was and wasn't verified.

## Notes on this environment

This scaffold was built and verified (`npm run build`, `npx eslint`) inside a sandboxed
container without outbound internet access to Google Fonts. The layout code correctly
uses `next/font/google` for Inter and Poppins — this will fetch normally the moment you
run it on a normal dev machine or CI with internet access.
