import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { sendEmail } from '../services/mailer.js';
import { env } from '../env.js';
import { newsletterRateLimiter } from '../middleware/rateLimit.js';
import { pino } from 'pino';

const logger = pino();
const router = Router();

const SubscriberSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name must not exceed 120 characters'),
  email: z.string().trim().email('Invalid email address').max(160, 'Email must not exceed 160 characters'),
  lang: z.string().optional().default('ro'),
});

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Premium email shell shared by both templates ──
function emailShell(body: string): string {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dr. Lucia Gariuc</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3ef;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ef;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);">
          <!-- Teal header bar -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d6e6e 0%,#0a8f8f 100%);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;letter-spacing:0.5px;">Dr. Lucia Gariuc</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Medic ORL · Doctor în Științe Medicale</p>
            </td>
          </tr>
          <!-- Body content -->
          <tr>
            <td style="padding:32px 32px 24px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#fafaf8;padding:20px 32px;border-top:1px solid #eee;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px;color:#9ca3af;line-height:1.5;">
                    <p style="margin:0;">Dr. Lucia Gariuc · Cabinet Medical ORL</p>
                    <p style="margin:2px 0 0;">Chișinău, Republica Moldova</p>
                  </td>
                  <td style="font-size:12px;color:#9ca3af;text-align:right;">
                    <a href="https://doctorluci.com" style="color:#0d6e6e;text-decoration:none;font-weight:600;">doctorluci.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:11px;color:#b0b0b0;text-align:center;">© 2026 Dr. Lucia Gariuc. Toate drepturile rezervate.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Doctor notification email ──
function buildDoctorNotificationHtml(name: string, email: string, lang: string): string {
  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#f0fdf4;border-radius:14px;line-height:56px;text-align:center;">
        <span style="font-size:28px;">📬</span>
      </div>
    </div>
    <h2 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1e2a35;text-align:center;">Solicitare Nouă pentru Ghidul ORL</h2>
    <p style="margin:0 0 24px;text-align:center;color:#6b7280;font-size:14px;">Un vizitator al site-ului doctorluci.com a solicitat ghidul gratuit.</p>

    <!-- Info card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:20px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
                <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;">Nume</span><br>
                <span style="font-size:15px;color:#1e2a35;font-weight:600;">${escapeHtml(name)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
                <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;">Email</span><br>
                <a href="mailto:${escapeHtml(email)}" style="font-size:15px;color:#0d6e6e;font-weight:600;text-decoration:none;">${escapeHtml(email)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;">Limba pe site</span><br>
                <span style="display:inline-block;margin-top:4px;padding:3px 10px;background:#e0f2fe;color:#0369a1;font-size:12px;font-weight:700;border-radius:20px;letter-spacing:0.5px;">${escapeHtml(lang.toUpperCase())}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin-top:24px;">
      <a href="mailto:${escapeHtml(email)}?subject=${encodeURIComponent('Ghidul ORL — Dr. Lucia Gariuc')}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#0d6e6e 0%,#0a8f8f 100%);color:#ffffff;text-decoration:none;border-radius:25px;font-size:14px;font-weight:600;letter-spacing:0.3px;">✉️&nbsp; Trimite Ghidul Manual</a>
    </div>

    <p style="margin:20px 0 0;text-align:center;font-size:13px;color:#9ca3af;font-style:italic;">Acest email a fost generat automat de sistemul doctorluci.com</p>
  `;
  return emailShell(body);
}

// ── Requester confirmation email (localized) ──
function buildRequesterConfirmationHtml(name: string, lang: string): string {
  const t: Record<string, { subject: string; greeting: string; p1: string; p2: string; cta: string; note: string }> = {
    ro: {
      subject: 'Solicitarea ta a fost primită',
      greeting: `Bună ziua, <strong>${escapeHtml(name)}</strong>!`,
      p1: 'Mulțumim pentru interesul față de sănătatea ta! Am primit solicitarea ta pentru <strong>Ghidul Gratuit de Sănătate ORL</strong>.',
      p2: '<strong>Dr. Lucia Gariuc</strong> va analiza solicitarea și îți va trimite ghidul pe email în cel mai scurt timp posibil.',
      cta: 'Vizitează Site-ul',
      note: 'Între timp, dacă ai nevoie urgentă de o consultație ORL, poți programa o vizită direct pe site-ul nostru.',
    },
    en: {
      subject: 'Your request has been received',
      greeting: `Hello, <strong>${escapeHtml(name)}</strong>!`,
      p1: 'Thank you for your interest in your health! We have received your request for the <strong>Free ENT Health Guide</strong>.',
      p2: '<strong>Dr. Lucia Gariuc</strong> will review your request and send you the guide by email as soon as possible.',
      cta: 'Visit the Website',
      note: 'In the meantime, if you need an urgent ENT consultation, you can book a visit directly on our website.',
    },
    ru: {
      subject: 'Ваш запрос получен',
      greeting: `Здравствуйте, <strong>${escapeHtml(name)}</strong>!`,
      p1: 'Благодарим вас за интерес к вашему здоровью! Мы получили ваш запрос на <strong>Бесплатное руководство по ЛОР-здоровью</strong>.',
      p2: '<strong>Доктор Лучия Гарюк</strong> рассмотрит ваш запрос и отправит вам руководство по электронной почте в ближайшее время.',
      cta: 'Посетить сайт',
      note: 'Тем временем, если вам нужна срочная ЛОР-консультация, вы можете записаться на приём прямо на нашем сайте.',
    },
    es: {
      subject: 'Tu solicitud ha sido recibida',
      greeting: `Hola, <strong>${escapeHtml(name)}</strong>!`,
      p1: '¡Gracias por tu interés en tu salud! Hemos recibido tu solicitud de la <strong>Guía Gratuita de Salud ORL</strong>.',
      p2: 'La <strong>Dra. Lucia Gariuc</strong> revisará tu solicitud y te enviará la guía por correo electrónico lo antes posible.',
      cta: 'Visita el Sitio Web',
      note: 'Mientras tanto, si necesitas una consulta ORL urgente, puedes reservar una cita directamente en nuestro sitio web.',
    },
  };

  const c = t[lang] || t.en;

  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:linear-gradient(135deg,#ecfdf5,#d1fae5);border-radius:50%;line-height:56px;text-align:center;">
        <span style="font-size:28px;">✅</span>
      </div>
    </div>
    <h2 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1e2a35;text-align:center;">${escapeHtml(c.subject)}</h2>

    <div style="margin:24px 0;padding:24px;background:linear-gradient(135deg,#f0fdfa 0%,#ecfdf5 100%);border-radius:12px;border-left:4px solid #0d6e6e;">
      <p style="margin:0 0 12px;font-size:15px;color:#1e2a35;">${c.greeting}</p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">${c.p1}</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${c.p2}</p>
    </div>

    <p style="margin:0 0 24px;font-size:13px;color:#6b7280;text-align:center;line-height:1.6;">${escapeHtml(c.note)}</p>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:8px;">
      <a href="https://doctorluci.com#appointment" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#0d6e6e 0%,#0a8f8f 100%);color:#ffffff;text-decoration:none;border-radius:25px;font-size:14px;font-weight:600;letter-spacing:0.3px;">${escapeHtml(c.cta)}</a>
    </div>
  `;
  return emailShell(body);
}

// POST /api/newsletter/subscribe
router.post('/subscribe', newsletterRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = SubscriberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'ValidationError',
        issues: parsed.error.issues,
      });
    }

    const { name, email, lang } = parsed.data;

    // Check if already subscribed
    let subscriber = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      subscriber = await db.newsletterSubscriber.create({
        data: { name, email },
      });
      logger.info({ email }, 'New newsletter subscriber registered');
    } else {
      logger.info({ email }, 'Existing subscriber requested guide again');
    }

    const normalizedLang = lang.toLowerCase().slice(0, 2);

    // Trigger async email sending
    Promise.resolve().then(async () => {
      // 1. Send confirmation email to the requester
      const requesterSubjects: Record<string, string> = {
        ro: 'Solicitarea ta a fost primită — Dr. Lucia Gariuc',
        en: 'Your request has been received — Dr. Lucia Gariuc',
        ru: 'Ваш запрос получен — Д-р Лучия Гарюк',
        es: 'Tu solicitud ha sido recibida — Dra. Lucia Gariuc',
      };

      await sendEmail({
        to: email,
        subject: requesterSubjects[normalizedLang] || requesterSubjects.en,
        html: buildRequesterConfirmationHtml(name, normalizedLang),
      });

      // 2. Send notification to the doctor
      await sendEmail({
        to: env.DOCTOR_EMAIL,
        subject: `Solicitare Ghid ORL — ${name}`,
        html: buildDoctorNotificationHtml(name, email, normalizedLang),
      });

    }).catch((err) => {
      logger.error({ error: err }, 'Error in newsletter notification pipeline');
    });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
