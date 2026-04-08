# English Growth System

A full-stack starter project for a personal English learning management platform.

## Tech stack
- Frontend: React + Vite + Bootstrap
- Backend: Node.js + Express
- Database: MySQL
- Auth: JWT

## Included in this package
- Backend API structure with layered architecture
- JWT authentication flow
- Vocabulary set management
- Flashcard creation and SRS review flow
- User profile page
- Dashboard overview page
- Full MySQL schema for the larger roadmap

## Project structure
- `backend/`: Express API
- `frontend/`: React app
- `database/schema.sql`: database schema

## Quick start

### 1. Database
Create a MySQL database by running:

```sql
SOURCE database/schema.sql;
```

Or open `database/schema.sql` in MySQL Workbench and run it.

### 2. Backend setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Default local URLs
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## Main working routes in current scaffold
### Backend
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `PUT /api/users/me`
- `POST /api/vocab-sets`
- `GET /api/vocab-sets`
- `POST /api/vocab-sets/:setId/vocabularies`
- `POST /api/flashcards`
- `GET /api/flashcards/due`
- `POST /api/flashcards/:id/review`
- `GET /api/dashboard/overview`

### Frontend
- `/login`
- `/register`
- `/dashboard`
- `/flashcards/review`
- `/profile`

## Notes
This package is a strong MVP scaffold, not a finished production SaaS. The schema supports the full system design, but the implemented screens and APIs focus on the core flow first:
- auth
- profile
- dashboard
- vocabulary
- flashcards + SRS

## Recommended next build steps
1. Add CRUD pages for vocabulary sets and flashcards.
2. Add goals/reminders API and pages.
3. Add testing engine.
4. Add 4-skill logging and speaking upload.
5. Add admin module and deployment configs.

## New features added in this update

- Goals module with create/list goal UI and API
- Vocabulary module with create set, add words, view set vocabularies, and create flashcards from words
- Navigation updated to include Goals and Vocabulary pages
- Added backend validation for profile, goals, and vocabulary payloads
