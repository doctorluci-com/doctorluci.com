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

### 2026-06-11
* **Admin Panel Mobile Redesign**: Completely rewrote the admin dashboard layout for mobile responsiveness. The sidebar now collapses to a hamburger drawer on tablet/phone screens. Appointments display as stacked cards on mobile (< lg) with a 2-column grid on tablets, while retaining the full data table on desktop. Added a "Details" action button to every appointment that opens a bottom-sheet (mobile) / centered modal (desktop) displaying all metadata: patient name, status, date, time, phone (tap-to-call), email (tap-to-email), full patient notes, submission timestamp, and booking ID. The modal also includes confirm/cancel/delete action buttons. Calendar Settings page received responsive padding and overflow handling.
* **Double-Booking Prevention**: Implemented strict double-booking guards at two levels: (1) **At submission time** — when a patient submits an appointment, the backend checks if a CONFIRMED or PENDING appointment already exists for the same date+slot and rejects with HTTP 409 if so. (2) **At confirmation time** — when an admin confirms a PENDING appointment, the backend re-checks for conflicts, preventing race conditions. Also fixed `preferredDate` not being persisted — it was sent by the frontend but stripped by the Zod schema and ignored by the service layer.
* **Timezone Mismatch Fix (Blocked Days)**: Fixed a critical three-layer timezone bug in the date-blocking system. (1) **Backend `blocked-days.ts`**: The Zod schema required `.datetime()` which rejected the `YYYY-MM-DD` format sent by the admin panel, silently failing with a 400 error — blocked dates were never persisted. Changed to accept `YYYY-MM-DD` and normalize to explicit UTC midnight via `Date.UTC()` instead of `date-fns` `startOfDay()` which uses server-local timezone. (2) **Backend `availability.ts`**: Replaced `startOfDay(new Date())` (local timezone) with UTC midnight for the "today" filter. Changed the API to return `YYYY-MM-DD` strings instead of raw ISO DateTime objects. Fixed booked-slots endpoint to use UTC-based date ranges. (3) **Frontend `Appointment.tsx`**: Fixed blocked-day parsing to construct local-timezone Date objects from `YYYY-MM-DD` strings. Replaced `getTime()` comparison with year/month/day field comparison. Changed appointment submission to send explicit UTC midnight ISO string instead of `toISOString()` which shifts dates. Re-ran both builds and restarted both services.
* **Testimonials Redesign**: Redesigned the `Testimonials.tsx` component to feature a dynamic horizontal scroll carousel with custom-styled cards matching the "Feedback clienților" UI.
* **Review Extraction**: Extracted 8 patient reviews from the uploaded WhatsApp screenshots, assigned them random names with correctly colored initials, and updated the `testimonials` translation keys across all locales (`ro.json`, `en.json`, `ru.json`, `es.json`).
* **Hero Subtitle Tweaks**: Updated translated text strings in `ru.json` ("Как нам расти …"), `en.json` ("How to raise"), and `es.json` ("biológicamente"). Re-ran frontend build and restarted `doctorluci-wrangler`.
* **Hero Subtitle Expansion**: Appended "Suport medical pentru Mămici. Cum creștem o societate sănătoasă biologic și sufletește." to the hero subtitle with localized translations in `ru.json` ("Медицинская поддержка для мам..."), `en.json` ("Medical support for mothers..."), and `es.json` ("Apoyo médico para madres..."). Re-ran frontend build and restarted `doctorluci-wrangler`.
* **Translation Updates**: Updated capitalization and phrasing for the "Medicina Simțului" catchphrase across all locales (`ro.json`, `ru.json`, `en.json`, `es.json`), applying the specific language formats requested: "Medicina Simțului" (RO), "Медицина Чуства" (RU), "Medicine of Sense" (EN), and "Medicina del Sentido" (ES). Re-ran frontend build and restarted `doctorluci-wrangler`.
* **Hero Image Update (2)**: Replaced `hero.jpg` again with a secondary photo provided by the user. The image dimensions matched the previous one (682x1024), so the `aspect-[682/1024]` class in `Hero.tsx` was retained. Re-ran frontend build and restarted `doctorluci-wrangler`.
* **Hero Image Update**: Replaced the existing `hero.jpg` with a newly provided photo. Updated the aspect ratio class in `Hero.tsx` from `aspect-[556/936]` to `aspect-[682/1024]` to correctly fit the new image dimensions. Re-ran the frontend production build and restarted the `doctorluci-wrangler` service to apply the changes to the live site.

### 2026-06-10 (Part 2)
* **Admin Panel Setup**: Created a standalone Vite/React SPA at `admin.doctorluci.com` configured with Tailwind v4, Lucide React, and React Router.
* **Appointment Management**: Added a Dashboard to the admin panel for viewing, confirming, cancelling, and deleting appointment requests via backend API integration.
* **Availability Control**: Implemented a Calendar Settings page in the admin panel to mark specific days as "not working", stored in a new `BlockedDay` database table.
* **Real-time Frontend Availability**: Updated the `Appointment.tsx` booking flow on `doctorluci.com` to dynamically fetch and disable completely booked slots and blocked days, preventing double-booking and respecting the doctor's schedule.

### 2026-06-10
* **Interactive Calendar Implementation**: Redesigned the appointment section to feature a highly interactive, dynamic 2-step booking flow using `react-day-picker` and `date-fns`.
* **Dynamic Time Slots**: Restructured the UI to split into a 5-column calendar picker and a 7-column time-slot grid. Time slots are dynamically generated at 20-minute intervals and are distinctly categorized into **Physical Consultations** (10:00 - 15:40) and **Online Consultations** (16:00 - 19:00).
* **Custom Availability**: Implemented specific availability logic where only Mondays (1), Wednesdays (3), and Fridays (5) are open for bookings. All past dates are strictly disabled. The selected `preferredDate` is now captured and submitted in ISO format along with the specific 20-minute slot string.

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
