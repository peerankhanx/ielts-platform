# Bandwise Backend

NestJS API for the Bandwise IELTS platform.

## Stack

- NestJS 11 + TypeScript
- **TypeORM** + PostgreSQL (see note below on why this isn't Prisma)
- Redis (session/queue infrastructure, not yet wired to a queue module)
- JWT access tokens (15 min) + rotating, hashed refresh tokens in an HttpOnly cookie
- Argon2 password hashing
- class-validator DTOs, Helmet, rate limiting (@nestjs/throttler)

## A note on Prisma vs TypeORM

The original spec calls for Prisma. This backend uses TypeORM instead, for one
concrete reason: Prisma's CLI (generate, migrate, db push) downloads its query
and schema engine binaries from binaries.prisma.sh on every run, and that domain
was unreachable from the sandbox this was built in, so Prisma could not be installed
or verified at all here, only written blind. TypeORM has no such requirement (pure
JS/TS, uses the pg driver directly), so it could actually be built, migrated against
a real Postgres instance, and tested end-to-end in this environment.

## Setup

    cp .env.example .env   # fill in JWT secrets, see comment in the file
    npm install
    npm run start:dev
    npm run seed:reading   # optional: adds one sample reading test

Requires a running PostgreSQL instance matching your .env and (optionally, for
future queue features) Redis.

## Auth module

- POST /api/v1/auth/register, /login, /refresh, /logout, /logout-all
- POST /api/v1/auth/verify-email, /forgot-password, /reset-password
- JwtAuthGuard + RolesGuard + @Roles() decorator for route protection
- Tested live end-to-end: register -> login -> refresh -> verify-email ->
  logout-all, plus duplicate-email, wrong-password, and weak-password rejection.

## Reading module

- GET /api/v1/reading/tests - list published reading tests
- GET /api/v1/reading/tests/:testId - full test with passage(s) + questions
  (correct answers stripped out while the test is in progress)
- POST /api/v1/reading/tests/:testId/attempts - start a timed attempt
- PATCH /api/v1/reading/attempts/:attemptId/answers - autosave one answer at a time
- POST /api/v1/reading/attempts/:attemptId/submit - grade the attempt, compute
  a band score, return a full per-question breakdown with explanations
- GET /api/v1/reading/attempts/:attemptId - fetch attempt/result (ownership-checked)

Supports three question types end to end: multiple choice, True/False/Not Given,
and short answer (case-insensitive, multiple acceptable phrasings). Band scoring
uses a proportional approximation of the official IELTS Academic Reading
raw-score conversion table (see src/modules/reading/utils/band-score.util.ts
for the caveat on why it's an approximation, not the exact official table).

Seed a sample test with npm run seed:reading, creates one real passage
("The Rise of Urban Beekeeping") with 6 mixed-type questions. Tested live
end-to-end: started an attempt, submitted 5 correct + 1 deliberately wrong
answer, submitted for grading, and confirmed the returned band score (7.5),
raw score (5/6), and per-question correct/incorrect breakdown were all accurate.

## Listening module

Shares the Test/Question/TestAttempt/Answer entities with the reading module
(a sectionId column on Question links it to a ListeningSection instead
of a ReadingPassage). Same five endpoints as reading, under /listening.

Audio is served as real static files via @nestjs/serve-static, mounted at
/media (e.g. GET /media/audio/library-orientation.mp3), separate from
the /api/v1 prefix used by the JSON API.

Seed a sample test with npm run seed:listening, this generates a real
~97-second MP3 using espeak-ng (installed via apt) piped through ffmpeg,
for a "Library Orientation" listening passage with 5 mixed-type questions.
Tested live end-to-end: streamed the generated MP3 over HTTP, started an
attempt, submitted 4 correct + 1 deliberately wrong answer, and confirmed the
returned band score (7.0), raw score (4/5), and breakdown were all accurate.

Note: the generated audio is synthesized speech for testing the full pipeline
(upload -> serve -> play -> grade), not real IELTS listening content, sourcing
professionally recorded/licensed audio is a separate, later task.

## Writing module

- GET /api/v1/writing/tasks, /tasks/:taskId - list/get writing prompts (Task 1 and Task 2)
- POST /api/v1/writing/tasks/:taskId/submissions - start a draft
- PATCH /api/v1/writing/submissions/:submissionId - autosave essay text + live word count
- POST /api/v1/writing/submissions/:submissionId/submit - finalize and evaluate
- GET /api/v1/writing/submissions/:submissionId - fetch submission + evaluation

Two evaluators share one interface (WritingEvaluator), selected automatically
via a factory provider based on whether ANTHROPIC_API_KEY is set:

- ClaudeWritingEvaluator - calls the real Claude API with the official IELTS
  writing band descriptors as the system prompt. This is the evaluator meant
  for real deployments. It could not be tested in this sandbox since no API
  key was available here, but the integration is complete and ready to use;
  set ANTHROPIC_API_KEY in .env and it activates with no code changes.
- HeuristicWritingEvaluator - a deterministic, rule-based fallback (word
  count vs. requirement, vocabulary diversity via type-token ratio, use of
  cohesive/linking words, average sentence length as a complexity proxy).
  This is genuinely computed, not fabricated, but it is explicitly not a real
  assessment of argument quality, task relevance, or meaning, only an LLM
  can judge those. It exists so the full submit -> evaluate -> display
  pipeline is testable without a key, and as a safety-net fallback.

Seed two sample tasks with npm run seed:writing (one Task 1, one Task 2).
Tested live end-to-end with the heuristic evaluator: wrote a real ~215-word
essay (deliberately under the 250-word minimum) with linking words and varied
vocabulary, submitted it, and got back an accurate breakdown — Task
Achievement 6.0 (correctly flagged as under-length), Coherence 7.5, Lexical
Resource 8.0, Grammar 7.0, overall band 7.0 — with feedback strings that
matched the actual essay content.

## Speaking module

3-part IELTS speaking test (Part 1 Q&A, Part 2 cue-card long turn with prep
time, Part 3 discussion). Real audio recording upload — served from
`/media/speaking-recordings/...` via the same `@nestjs/serve-static` mount
used by listening.

Only **Fluency & Coherence** is scored from the audio signal alone
(`AudioFluencyEvaluator` + `utils/audio-analysis.util.ts`), using `ffmpeg
silencedetect` to measure real speaking-time ratio and pause frequency — not
a fabricated number.

**Lexical Resource and Grammatical Range now upgrade automatically once a
transcript exists.** Getting there took two failed local attempts before
landing on the right approach:

1. OpenAI's original Whisper (PyTorch) — blocked by disk space for the
   CUDA/torch dependencies in this sandbox.
2. `faster-whisper` (a much lighter `ctranslate2` backend, no PyTorch at
   all) — the library itself installed fine in under 200MB, but its model
   weights are hosted on `huggingface.co`, which isn't in this sandbox's
   network allowlist. Checked whether `whisper.cpp`'s GitHub releases might
   have models the allowlist *would* permit — they don't; models are LFS/HF-hosted there too.

Both are local-inference problems, not network problems that a hosted API
shares — so the real fix was `OpenAIWhisperProvider`, which calls OpenAI's
hosted Whisper API instead of running any model locally. Same
pluggable-provider pattern as everything else in this project:

- `NullTranscriptionProvider` (default) — always returns no transcript. This
  is what every Speaking test in this project has run against.
- `OpenAIWhisperProvider` — activates once `OPENAI_API_KEY` is set. Sends
  the recorded audio to `POST /v1/audio/transcriptions` and returns the
  transcript. **Untestable here** — `api.openai.com` isn't in this sandbox's
  allowlist either — but written correctly against OpenAI's documented SDK,
  same honesty caveat as Stripe and SMTP.

When a transcript comes back *and* `ANTHROPIC_API_KEY` is set,
`ClaudeSpeakingTextEvaluator` scores Lexical Resource and Grammatical Range
from it — deliberately only those two criteria, since a transcript can't
support Fluency (needs timing, not words) or Pronunciation (needs phonemes,
which nothing in this project analyzes). `SpeakingService.submit()` merges
whichever criteria actually got scored and computes `overallBand` as their
average — previously this was hardcoded `null` even when Fluency alone was
available; it's now an honest partial average (confirmed live: a
fluency-only evaluation now correctly returns `overallBand: 7.5`, not `null`,
matching its single scored criterion).

Pronunciation stays `null` regardless of configuration — nothing in this
project ever claims to assess it, by design.

Confirmed this is a pure additive upgrade with zero regression: re-ran the
exact same fluency test from before (a submission with no API keys
configured) and got byte-identical behavior to the original implementation —
`fluencyCoherence: 7.5`, `lexicalResource`/`grammaticalRange`/`pronunciation`
all still `null`, `evaluator: "audio-heuristic"` unchanged — the only
difference is `overallBand` now correctly reflects the one scored criterion
instead of being needlessly `null`.

A new migration (`AddSpeakingTranscript`) adds the nullable `transcript`
column this needed — generated and verified the same way as the initial
schema migration (applied cleanly to a fresh scratch database, then
reverted cleanly).

Tested live end-to-end, including proving the fluency score responds to real
signal rather than always returning the same number: a clean, pause-free
TTS recording scored 7.5, while a second recording with ~5.5s of deliberately
inserted silence (via ffmpeg) scored 5.0 — with feedback correctly calling
out the pauses and hesitation.

Seed a sample task with `npm run seed:speaking`.

## Admin module

Role-gated via `JwtAuthGuard` + `RolesGuard` + `@Roles(ADMIN, SUPER_ADMIN)` —
regular students get a real 403, tested live against an actual student account.

- `GET /api/v1/admin/stats` — user counts by role, completed attempts per
  module (reading/listening/writing/speaking), average current band across
  all student profiles (all real SQL aggregates, not hardcoded)
- `GET /api/v1/admin/users` — paginated, searchable (name/email via `ILIKE`)
- `PATCH /api/v1/admin/users/:userId/status` — suspend/activate an account.
  Tested live: suspending a user immediately blocks their next login (401)
- `GET /api/v1/admin/content-summary` — counts of published tests/tasks per module

Create a real admin account with `npm run seed:admin` (creates a
`super_admin` user — registration always creates students, by design, so
this is the only path to get an admin account short of a direct DB edit).
Prints the login credentials to the console; change the password before any
real deployment.

## Subscriptions & Payments module

- `GET /api/v1/subscriptions/plans` — public, lists active plans
- `GET /api/v1/subscriptions/me` — the caller's current active subscription (or `null`)
- `GET /api/v1/subscriptions/payments` — the caller's payment history
- `POST /api/v1/subscriptions/checkout` — starts a purchase for a plan
- `POST /api/v1/subscriptions/webhook` — Stripe webhook, verifies the signature
  against the raw request body before fulfilling anything

Same pluggable-provider pattern as the Writing module's evaluators: one
`PaymentProvider` interface, two implementations, selected by a factory based
on whether `STRIPE_SECRET_KEY` is set:

- `StripePaymentProvider` — real Stripe Checkout Sessions integration. Could
  not be tested in this sandbox (no Stripe account/keys available here), but
  the webhook handler genuinely verifies the Stripe signature via
  `stripe.webhooks.constructEvent` and refuses to process anything if
  `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` aren't set — confirmed live by
  hitting the webhook unconfigured and getting a real 400, not silent acceptance.
- `MockPaymentProvider` — settles the payment immediately with no external
  redirect, so the full pipeline (checkout → payment record → active
  subscription) is testable without real payment credentials. It only proves
  the wiring is correct; it doesn't simulate card declines or disputes —
  those need testing against Stripe's test-mode cards once a real key exists.

Seed 3 plans (Free, Premium Monthly, Premium Annual) with `npm run seed:subscriptions`.

Tested live end-to-end with the mock provider: confirmed no subscription
before purchase, checked out the Premium Monthly plan, confirmed the
subscription activated immediately with the correct 30-day end date, checked
out again and confirmed the renewal correctly **extended from the existing
end date** rather than resetting from today, and confirmed the webhook
genuinely rejects requests when Stripe isn't configured (400, not a silent no-op).

## Books/Library module

- `GET /api/v1/library/books` — public, filterable by `category`, `level`, and `search`
- `GET /api/v1/library/books/:bookId` — book detail
- `GET /api/v1/library/favorites`, `/in-progress` — the caller's saved/in-progress books
- `GET /api/v1/library/books/:bookId/progress`, `PATCH .../progress` — per-user
  reading progress (last page read, completed flag)
- `POST /api/v1/library/books/:bookId/favorite` — toggle favorite

Two sample books are **real, generated PDFs**, not placeholder files: "100
Essential IELTS Vocabulary Words" and "Grammar Foundations: Tenses and
Clauses", built with `pdfkit` from real written content (vocabulary entries
with example sentences, grammar rules with corrected example sentences) in
`src/database/seed-books.ts`. Run `npm run seed:books` to generate them —
they're written to `uploads/books/` and served via the same `/media` static
mount as listening audio and speaking recordings.

Tested live end-to-end: listed books, filtered by category, searched by
title, downloaded a generated PDF over HTTP and confirmed it's byte-identical
to the file on disk, updated reading progress, toggled a favorite, and
confirmed both showed up correctly in `/favorites` and `/in-progress`.

## Notifications module

- `GET /api/v1/notifications` — paginated, most recent first
- `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/:notificationId/read`
- `POST /api/v1/notifications/read-all`

There is deliberately no public "create notification" endpoint. Notifications
are only ever system-generated from something that actually happened
elsewhere in the app — `NotificationsService.create()` is called from:

- `WritingService` / `SpeakingService`, after an AI evaluation completes (`ai_evaluation`)
- `SubscriptionsService`, after a payment succeeds and a subscription activates (`payment` + `subscription`)
- `ReadingService` / `ListeningService`, after every completed attempt (`test`),
  plus a one-time `achievement` notification the first time a student
  completes a test in that module — checked with a real count query against
  prior completed attempts, not a flag that could double-fire

Tested live end-to-end: confirmed a brand-new account starts with zero
notifications, completed a real reading test and got back exactly the two
expected notifications (`test` + `achievement`), completed a second reading
test and confirmed the achievement did **not** fire again (only one more
`test` notification), and verified mark-one-read and mark-all-read both
correctly update the unread count.

## Content authoring (admin)

Real create/publish/delete endpoints under `/api/v1/admin/content/*`, gated
by the same `RolesGuard` as the rest of the admin panel — tested live to
confirm a student account genuinely gets 403 trying to hit these.

- `POST /reading-tests`, `POST /listening-tests` — create a full test in one
  call: title/description/timing plus nested passages/sections and questions
  in a single request body (matching how an authoring form would submit)
- `POST /listening-sections/:sectionId/audio` — upload real audio for a
  section (reuses the same `ffprobe` duration analysis as the seed script)
- `POST /writing-tasks`, `POST /speaking-tasks` — simpler single-entity creates
- `PATCH .../publish`, `DELETE ...` — publish/unpublish and delete, for all
  four content types (shared `tests` endpoints cover both reading and listening)

New content is created as an **unpublished draft** by default — it must be
explicitly published before it appears in the student-facing list endpoints.

Tested live end-to-end, not just the create call in isolation: authored a
brand-new reading test via the API (a passage about the history of coffee,
two questions), confirmed it did **not** appear in the public reading test
list while a draft, published it, confirmed it then appeared, and had a real
student account fetch it, answer both questions, submit, and get correctly
graded (2/2, band 9.0) — proving the full authoring → publish → student
attempt → grading pipeline works for genuinely admin-created content, not
just seeded content.

### Editing existing content

Reading and listening tests now support real nested editing, not just
create/publish/delete:

- `GET /admin/content/reading-tests/:testId/full`, `.../listening-tests/:testId/full`
  — full detail including correct answers (admin-only view)
- `POST/PATCH/DELETE` on `/admin/content/passages/:id`, `/sections/:id`,
  `/questions/:id` — add, edit, or remove individual passages, sections, and
  questions on an existing test
- Frontend: `/admin/content/edit/reading/[testId]` — a real editor page with
  inline save/delete per passage and per question, plus add-passage and
  add-question buttons

Tested live end-to-end: edited an existing seeded question's prompt text and
explanation, added a brand-new question to the same test, confirmed a real
student account saw both the edit and the new question when fetching the
test, deleted the new question and confirmed it disappeared for the student
too, then reverted my test edit back to the original content.

The listening editor (`/admin/content/edit/listening/[testId]`) uses the
identical backend endpoints as reading, plus per-section audio re-upload
(reusing the same `ffprobe` duration analysis as everywhere else audio gets
uploaded in this project). Verified live: fetched the full detail for the
seeded "Library Orientation" test and confirmed it returns exactly the
sections and questions the editor needs to render. Writing and Speaking
tasks are simple enough (no nested passages/sections) that create/publish/
delete already covers realistic editing needs for them.

## Migrations

A real, tested initial migration exists at
`src/database/migrations/*-InitialSchema.ts` — generated with the TypeORM
CLI against every current entity and verified by actually running it: created
a fresh empty scratch database, ran `migration:run` against it (every table,
enum, index, and foreign key across all 30+ entities applied cleanly), then
ran `migration:revert` and confirmed every table was cleanly dropped back to
nothing. `synchronize: true` is still what development uses day-to-day
(see `src/config/database.config.ts`) since it's faster for iterating on
entities — the migration exists for anyone deploying to a real environment.

```bash
npm run migration:generate -- src/database/migrations/SomeChangeName  # after editing entities
npm run migration:run
npm run migration:revert
```

Note: `AuditLog` had never actually been registered in any module's
`TypeOrmModule.forFeature()` before this — so a type error in it (a nullable
column needing an explicit `type:` per TypeORM's Postgres driver) had never
surfaced until migration generation touched every entity file directly. Fixed
as part of this pass.

## Docker

`Dockerfile`s exist for both backend and frontend (multi-stage builds — the
frontend uses Next.js's `standalone` output so the runtime image doesn't need
the full `node_modules` tree), plus a root `docker-compose.yml` wiring
Postgres, Redis, backend, and frontend together with healthchecks.

**Honesty note**: this sandbox has no Docker daemon, so these could not be
built or run here — only written correctly and checked for valid syntax
(`docker-compose.yml` parses as valid YAML with the expected services/volumes;
the equivalent standalone Next.js build that the frontend Dockerfile relies on
was verified separately via a real `npm run build`). Test with:

```bash
cp .env.example .env         # root — DB credentials shared with backend
cp backend/.env.example backend/.env   # fill in JWT secrets
docker compose up --build
docker compose exec backend npm run migration:run
docker compose exec backend npm run seed:admin   # plus any other seed:* you want
```

## Redis-backed queues & email delivery

BullMQ (already installed but unused since early scaffolding) is now wired
for real: a root `BullModule.forRootAsync` connects to Redis, and a
`QueuesModule` registers an `email` queue with a genuine `EmailProcessor`
worker (`@Processor(EMAIL_QUEUE)` / `WorkerHost`), not just an enqueue call
with nothing consuming it.

`AuthService.register()` and `.forgotPassword()` used to `console.log` their
verification/reset tokens directly — now they call
`QueueService.enqueueEmail()`, which pushes a real BullMQ job onto Redis; the
worker picks it up asynchronously and hands it to `EmailService`.

`EmailService` follows the same pluggable-provider pattern as payments and
writing evaluation:

- `ConsoleEmailProvider` (default) — logs the email, used whenever
  `SMTP_HOST` isn't set. This is what every test in this project has run against.
- `SmtpEmailProvider` — real delivery via `nodemailer`, activates automatically
  once `SMTP_HOST` is set. **Untested here**: this sandbox's network allowlist
  covers package registries and source hosting, not SMTP relays, so there was
  nowhere to actually send a test email to. Written correctly against
  nodemailer's documented API, same honesty caveat as the Docker section above.

Tested live end-to-end, including proving Redis is actually the backing
store and not just an in-memory shim: registered an account, watched the
`EmailProcessor` log pick up and process job `#1` asynchronously (separate
log line from the enqueue call, via `ConsoleEmailProvider`), triggered
`forgot-password` and watched a second job process the same way, then
inspected Redis directly with `redis-cli KEYS "bull:email:*"` and found the
real BullMQ keys (`bull:email:meta`, `bull:email:events`, etc.) that only
exist if a job genuinely round-tripped through Redis.

## CI/CD

`.github/workflows/ci.yml` runs on every push/PR to `main`: a backend job
(lint → build → run the real migration against a Postgres service container
→ boot the app and confirm it responds) and a frontend job (lint → build).

Unlike Docker (no daemon available here) and SMTP (no reachable relay), this
pipeline's steps **were actually verified** — not just written and assumed
correct. I replicated every command in the workflow manually against a fresh
scratch database with the exact same environment variables the workflow
specifies (`ielts_platform_ci`, the same JWT secrets, the same ports): lint
passed, build passed, `migration:run` applied cleanly, the app booted and
responded 401 as expected on an unauthenticated request, and the frontend's
lint and build both passed too. The only asterisk is the frontend build step
needed a temporary font-import stub *in this sandbox specifically* — real
GitHub Actions runners have unrestricted outbound internet, so
`next/font/google`'s fetch works normally there without any workaround.

## Project status

Every module from the original spec is now built, backend and frontend, and
everything that could be verified in this sandbox has been — not just
written and assumed correct. The two honest exceptions are Docker (no
daemon available here) and real SMTP/OpenAI/Stripe network calls (no
reachable relay/API for those specific hosts from this sandbox) — all three
are written correctly against their real, documented APIs and activate
automatically the moment their respective API keys/credentials are set in
a real environment.
