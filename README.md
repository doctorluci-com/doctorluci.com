# Doctor Luci - Appointment & Digital Product System 🩺

Welcome to the **Doctor Luci Appointment System** repository! This is a full-stack, multilingual web application built for a medical professional (Dr. Lucia Gariuc) to manage patient appointments, digital book sales, newsletter subscriptions, and recurring coaching packages.

![Project Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## ✨ Features

* **📅 Appointment Booking:** Patients can request consultations. The system automatically sends premium HTML notification emails to both the doctor and the patient.
* **📚 Digital E-Book Sales:** Users can purchase a digital book via a Stripe checkout integration. After a successful payment webhook, a secure, single-use download link is generated and sent via email.
* **🌍 Internationalization (i18n):** The application is fully localized in 4 languages: Romanian, English, Russian, and Spanish.
* **✉️ Newsletter & Guides:** A framer-motion powered animated UI for subscribing to the newsletter and requesting medical guides. 
* **💳 Subscription Tiers:** (Work in Progress) Stripe recurring payment integration for premium patient coaching tiers (Silver, Gold, Platinum).

---

## 🛠️ Tech Stack

### Frontend (Root Directory)
* **Framework:** React 19, Vite, TanStack Start & Router
* **Styling:** Tailwind CSS v4, Framer Motion (Animations), Lucide React (Icons)
* **Data Fetching:** TanStack React Query
* **Localization:** i18next & react-i18next

### Backend (`/backend` Directory)
* **Framework:** Express.js (TypeScript)
* **Database & ORM:** PostgreSQL managed via Prisma
* **Payments:** Stripe API
* **Email:** Nodemailer (with custom branded HTML templates)
* **Security:** Helmet, Express Rate Limit, CORS, JSON Web Tokens (JWT)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally. 

### Prerequisites
* Node.js (v18 or higher)
* PostgreSQL database
* Stripe Account (for payments)
* SMTP Email credentials (for Nodemailer)

### 1. Clone the repository
```bash
git clone https://github.com/doctorluci-com/doctorluci.com.git
cd doctorluci.com
```

### 2. Set up the Backend
```bash
cd backend
npm install
```
* Rename `.env.example` to `.env` and fill in your PostgreSQL `DATABASE_URL`, Stripe API keys, and SMTP email credentials.
* Run the database migrations:
```bash
npm run prisma:migrate
npm run prisma:generate
```
* Start the backend development server:
```bash
npm run dev
```

### 3. Set up the Frontend
Open a new terminal window and navigate back to the root directory.
```bash
npm install
npm run dev
```
The frontend should now be running locally, typically on `http://localhost:5173`.

---

## 🏗️ Project Structure

```text
├── src/                    # Frontend React code (Pages, Components, i18n, router)
├── backend/                # Express.js REST API
│   ├── src/                # Backend routes, services, and middleware
│   ├── prisma/             # Database schema and migrations
│   └── private/            # Secure storage for digital assets (e.g., PDF books)
├── package.json            # Frontend dependencies
├── vite.config.ts          # Vite configuration
└── .gitignore              # Ignored files (node_modules, dist, .env, private assets)
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
