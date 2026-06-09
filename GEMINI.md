# Project Initiation & Activity Log (GEMINI.md)

Welcome to the **Doctor Luci (Dr. Lucia Gariuc Appointment System)** development workspace. This file is managed by the AI assistant (Antigravity) to track project initiation details, system architecture, active tasks, and a detailed change log of modifications made to the application.

---

## 📋 Project Overview

This repository is split into two primary components:
1. **Frontend**: A modern TanStack Start, React 19, and Tailwind CSS v4 application running in the root workspace.
2. **Backend**: An Express.js application written in TypeScript, backed by PostgreSQL database access via Prisma, located in the `backend` directory.

### Tech Stack Summary
* **Frontend**:
  * **Framework**: React 19 (TanStack Start / TanStack Router / Vite)
  * **Styling**: Tailwind CSS v4, Framer Motion (for transitions/animations), Lucide React (icons)
  * **Data Fetching/State**: TanStack React Query
  * **Internationalization**: i18next & react-i18next
* **Backend**:
  * **Framework**: Express.js (TypeScript)
  * **Database ORM**: Prisma (PostgreSQL client)
  * **Security**: Helmet, Express Rate Limit, CORS, JSON Web Tokens (JWT), Bcrypt
  * **Email**: Nodemailer for booking confirmations/notifications
  * **Logging**: Pino / Pino HTTP

---

## 🏛️ Database Schema

### `Appointment` Model
* **ID**: UUID (Primary Key)
* **Name**: String
* **Phone**: String
* **Email**: String
* **Message**: String (Optional)
* **Slot**: String (e.g. `"09:00"`)
* **Preferred Date**: DateTime (Optional)
* **Status**: `AppointmentStatus` (Enum: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`)
* **Timestamps**: `createdAt`, `updatedAt`

### `Subscription` Model
* **ID**: UUID (Primary Key)
* **Stripe Customer ID**: String
* **Stripe Subscription ID**: String (Unique)
* **Email**: String
* **Name**: String (Optional)
* **Tier**: String (e.g. `"silver" | "gold" | "platinum"`)
* **Status**: String (e.g. `"active" | "canceled" | "incomplete"`)
* **Current Period End**: DateTime
* **Timestamps**: `createdAt`, `updatedAt`

---

## ⚙️ Development & Deployment

### Local Development Commands
* **Root (Frontend)**:
  * `npm run dev`: Starts the Vite development server.
  * `npm run build`: Builds the production bundle.
  * `npm run lint` / `npm run format`: Runs ESLint and Prettier.
* **Backend**:
  * `npm run dev` (in `/backend`): Starts the development server using `tsx watch`.
  * `npm run build` (in `/backend`): Builds the production build using `tsc`.
  * `npm run start` (in `/backend`): Starts the compiled backend server.
  * `npm run prisma:migrate` (in `/backend`): Runs Prisma migrations.
  * `npm run prisma:generate` (in `/backend`): Re-generates the Prisma client.

### Production Environment
* **Nginx Config**: Located at `/etc/nginx/sites-available/doctorluci.com`
* **Systemd Service**: Backend runs as a systemd service (`backend.service`) located at `/var/www/doctorluci.com/backend/backend.service`.

---

## 📝 Change Log

### 2026-06-03
* **Secure Book Delivery**: Moved `doctorluci.pdf` to the private `backend/private` directory to prevent unauthorized public downloads. Implemented a new `/api/download/book/:token` backend route that authenticates requests against the `BookPurchase` database records. Updated the Stripe webhook and email templates to dynamically inject the unique `purchase.id` as a secure download token into the buyer's localized email.
* **Book Sales Section**: Implemented a new digital book sales section in the frontend (`BookPromo.tsx`) featuring a premium glassmorphism design and internationalization (ro, en, ru, es). Integrated Stripe one-time payment checkout through a new backend endpoint (`/api/stripe/create-book-checkout`).
* **Book Email Delivery**: Added a `BookPurchase` table to the database. Updated the Stripe webhook handler to detect book purchases, log them in the DB, and automatically send a localized email with a secure download link using the premium HTML email template.
* **Testimonials Clean-up**: Deleted the hardcoded 'Pacient ORL' subtitle under the reviewer names in the `Testimonials` page component.
* **Testimonials Avatar Swap**: Swapped the photo array order in the `Testimonials` page component to align the reviewer names (Andrei M. and Maria T.) with the correct gendered avatars.
* **Deployment**: Re-ran frontend build and restarted the `doctorluci-wrangler` systemd service.

### 2026-06-02
* **UI Clean-up**: Deleted the stats counter block (patients, workshops, coaching certificates) from the `About` page component.
* **Component Deletion**: Completely removed the `Packages` component, pricing section route, and its Stripe checkout redirect callback logic from the frontend home page. Cleaned up unused translation keys across all locale files (`en.json`, `ro.json`, `ru.json`, `es.json`).
* **Newsletter Integration**: Fully implemented the newsletter / guide request form. Added `NewsletterSubscriber` model to the Postgres database via Prisma, created `/api/newsletter/subscribe` backend endpoint with Zod validation, rate limiting, and email notification sent to the doctor to manually dispatch the guide. Refactored the frontend UI into a highly polished, floating glassmorphism card component with interactive framer-motion entry and success checkmark card transitions, fully localized across all supported languages (ro, en, ru, es).
* **Email Template Overhaul**: Redesigned newsletter and appointment emails with premium HTML templates using a shared shell (teal gradient header, branded footer, box-shadow card layout). The doctor notification now features a structured info card with labelled fields (name, email, language) and a direct "Reply with Guide" CTA button. Added a **new requester confirmation email** — the person who requests the guide now receives a localized (ro/en/ru/es) acknowledgement email with a green checkmark header, styled content card, and a link to book a consultation. Upgraded both the doctor's and patient's appointment request emails, replacing the doctor's "Accesează Panou Admin" button with direct, convenient mobile actions (Call Patient, Write Email).
* **Deployment**: Re-ran frontend and backend production builds, applied database migrations, and restarted the `doctorluci-wrangler` and `kids-of-lucia-backend` systemd services.

### 2026-05-27
* **Init**: Created `GEMINI.md` to establish project documentation, component overview, and progress tracking.
* **Asset Update**: Ran `npm run build` and restarted `doctorluci-wrangler` to apply the updated hero image (`src/assets/img/hero.jpg`).
* **Hero Image Fit**: Adjusted the aspect ratio of the hero image in `Hero.tsx` from `aspect-[4/5]` to `aspect-[556/936]` to match its natural dimensions and prevent cropping. Re-ran frontend build and restarted `doctorluci-wrangler`.
* **Contact & Social Updates**: Updated the footer contact number (+373 69 408 822), Facebook link, Instagram link, and swapped out LinkedIn & YouTube for Telegram. Updated the copyright year to 2026 across all language locale files (ro, en, ru, es). Re-ran frontend build and restarted `doctorluci-wrangler`.
* **Stripe Subscription Integration**: Integrated Stripe recurring payments. Added `Subscription` database model and applied migrations. Implemented `/api/stripe/create-checkout-session` for frontend redirect and `/api/stripe/webhook` for secure event synchronization. Created `/api/subscriptions` endpoint for admin monitoring. Updated frontend packages component with loading state redirects and added payment success/cancelled feedback toasts.

---

## 🎯 Active & Future Tasks

- [x] Integrate Stripe subscription payment flow (Silver, Gold, Platinum plans)
- [ ] Configure live Stripe API keys and Webhook secrets in production environment
- [ ] Monitor subscription event logs in admin interface
