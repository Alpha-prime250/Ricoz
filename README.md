# RicozRecruit

A talent acquisition platform (Zoho Recruit–style) covering the full recruitment lifecycle:
job requisition & approval, candidate sourcing, interview scheduling, and offer management.

Stack: **React (Vite) + Node.js/Express + MongoDB (Mongoose)**, JWT auth.

## Structure

```
ricozrecruit/
  backend/     Express API + MongoDB models
  frontend/    React (Vite) SPA
```

## Backend setup

```bash
cd backend
cp .env.example .env      # edit MONGO_URI / JWT_SECRET as needed
npm install
npm run seed                # creates 3 users, 8 jobs, 50 candidates, applications spread across every pipeline stage, interviews & offers
npm run dev                # starts on http://localhost:5000
```

Seed logins (after `npm run seed`):
- `admin@ricozrecruit.com` / `password123` (role: admin)
- `hiringmanager@ricozrecruit.com` / `password123` (role: hiring_manager)
- `recruiter@ricozrecruit.com` / `password123` (role: recruiter)

**Resetting demo data without the CLI:** logged in as an admin, the "Reset data" button in the sidebar calls `POST /api/admin/reset-demo-data`, which wipes every collection and re-seeds the same fresh sample data as `npm run seed` — handy for resetting state before a demo recording without touching a terminal. Since it also recreates every user, you'll be signed out afterwards and need to log back in with the (re-seeded) credentials above.

## Frontend setup

```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # starts on http://localhost:5173
```

## Core modules

| Module | What it covers |
|---|---|
| **Job requisitions** | Create requisition → pending approval → admin/hiring manager approves or rejects → job opens |
| **Candidates** | Add sourced candidates (referral, LinkedIn, job board, etc.), search/filter by skill |
| **Pipeline** | Each candidate applied to a job is an `Application` moving through stages: applied → screening → interview → assessment → offer → hired/rejected. Board view per job. |
| **Interviews** | Schedule rounds (phone screen, technical, panel, HR, final), assign interviewers, submit feedback + recommendation. Auto-advances the pipeline stage. |
| **Offers** | Create offer tied to an application, log candidate communications (email/call/note), track accepted/declined — auto-marks the candidate "hired" on acceptance. |

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST/GET /api/jobs`, `GET/PUT/DELETE /api/jobs/:id`, `PUT /api/jobs/:id/approval`
- `POST/GET /api/candidates`, `GET/PUT/DELETE /api/candidates/:id`
- `POST/GET /api/applications`, `GET /api/applications/pipeline/:jobId`, `PUT /api/applications/:id/stage`
- `POST/GET /api/interviews`, `PUT /api/interviews/:id`, `PUT /api/interviews/:id/feedback`
- `POST/GET /api/offers`, `PUT /api/offers/:id/status`, `POST /api/offers/:id/communications`

## Roles

- `recruiter` — creates requisitions, sources candidates, manages pipeline
- `hiring_manager` / `admin` — approve/reject requisitions
- `admin` — full access, can delete jobs

## Notes / next steps

- Resume file upload isn't wired to storage yet (`resumeUrl` is a plain text field) — plug in S3/Cloudinary + `multer` when ready.
- Email sending is logged, not actually dispatched — swap in a real provider (SendGrid, Nodemailer) in `offerController.logCommunication`.
- Add role-based route guards in the frontend if you want recruiters to not see the approve/reject buttons (currently hidden via `canApprove` check, but not enforced beyond that in the UI).
