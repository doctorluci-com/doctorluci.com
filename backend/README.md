# Dr. Lucia Gariuc — Appointment Backend

Node.js + Express + TypeScript backend for managing appointment requests from [doctorluci.com](https://doctorluci.com).

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Express 4 + TypeScript
- **Database:** PostgreSQL 16 via Prisma ORM
- **Validation:** Zod
- **Auth:** JWT (HS256), bcrypt for password hashing
- **Email:** Nodemailer via Gmail SMTP
- **Security:** helmet, cors, express-rate-limit, pino logger

---

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your real values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SMTP_HOST` | SMTP server (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (587 for TLS) |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Gmail App Password (not regular password) |
| `DOCTOR_EMAIL` | Email where appointment notifications go |
| `JWT_SECRET` | Random 32-byte hex secret: `openssl rand -hex 32` |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password (see below) |
| `CORS_ORIGINS` | Comma-separated allowed origins |

### 3. Generate admin password hash

```bash
node -e "const b=require('bcrypt'); const f=require('fs'); f.writeFileSync('hash.txt', b.hashSync('YOUR_PASSWORD', 10)); process.exit();" && cat hash.txt && rm hash.txt
```

Copy the output hash into `ADMIN_PASSWORD_HASH` in `.env`.

### 4. Start PostgreSQL and run migrations

```bash
# Start PostgreSQL if not running
systemctl restart postgresql

# Run migration (creates the `appointments` table)
npx prisma migrate deploy

# Or in development (creates and applies new migrations)
npx prisma migrate dev --name init
```

### 5. Start the dev server

```bash
npm run dev
```

Server runs at `http://127.0.0.1:4000`.

---

## API Endpoints

### Public

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/appointments` | Submit appointment request |
| `GET` | `/api/health` | Health check |

### Admin (requires `Authorization: Bearer <token>`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login → get JWT |
| `GET` | `/api/appointments` | List appointments |
| `PATCH` | `/api/appointments/:id` | Update appointment status |
| `DELETE` | `/api/appointments/:id` | Delete appointment |

---

## Acceptance Test

```bash
# Submit an appointment (expect 201)
curl -X POST http://localhost:4000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"name":"Ion Popescu","phone":"+37360123456","email":"ion@example.com","slot":"09:00","message":"Test"}'

# Admin login (expect 200 with token)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"YourPassword"}'

# List appointments (replace TOKEN)
curl http://localhost:4000/api/appointments \
  -H "Authorization: Bearer TOKEN"
```

---

## Production with Nginx

Add a location block to your nginx config to proxy the API:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Systemd Service

A service file is provided at `backend.service`. Copy to systemd and enable:

```bash
cp backend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now kids-of-lucia-backend
```
