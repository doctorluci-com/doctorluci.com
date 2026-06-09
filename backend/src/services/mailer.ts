import nodemailer from 'nodemailer';
import { env } from '../env.js';
import { pino } from 'pino';

const logger = pino();

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: env.MAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info({ messageId: info.messageId, to }, 'Email sent successfully');
    return info;
  } catch (error) {
    // Log the error but do not rethrow, so email failures never crash the API response
    logger.error({ error, to, subject }, 'Failed to send email notification');
  }
}

// Shared layout wrapper for all premium doctor & patient emails
export function emailShell(body: string): string {
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

export function buildDoctorEmailHtml(appointment: {
  id: string;
  name: string;
  phone: string;
  email: string;
  slot: string;
  message?: string | null;
}) {
  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#f0fdf4;border-radius:14px;line-height:56px;text-align:center;">
        <span style="font-size:28px;">📅</span>
      </div>
    </div>
    <h2 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1e2a35;text-align:center;">Programare Nouă Primită</h2>
    <p style="margin:0 0 24px;text-align:center;color:#6b7280;font-size:14px;">Ați primit o cerere nouă de programare de pe site-ul doctorluci.com.</p>

    <!-- Info card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:20px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Nume Pacient</span><br>
                <span style="font-size:15px;color:#1e2a35;font-weight:600;">${escapeHtml(appointment.name)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Telefon</span><br>
                <a href="tel:${escapeHtml(appointment.phone)}" style="font-size:15px;color:#0d6e6e;font-weight:600;text-decoration:none;">${escapeHtml(appointment.phone)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Email</span><br>
                <a href="mailto:${escapeHtml(appointment.email)}" style="font-size:15px;color:#0d6e6e;font-weight:600;text-decoration:none;">${escapeHtml(appointment.email)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Ora Rezervată</span><br>
                <span style="display:inline-block;margin-top:4px;padding:3px 10px;background:#e0f2fe;color:#0369a1;font-size:13px;font-weight:700;border-radius:20px;letter-spacing:0.5px;">${escapeHtml(appointment.slot)}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${appointment.message ? `
      <p style="margin:24px 0 8px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Mesaj de la pacient:</p>
      <div style="padding:16px 20px;background:#f9fafb;border-left:4px solid #0d6e6e;border-radius:0 8px 8px 0;font-size:14px;color:#374151;line-height:1.6;font-style:italic;">
        ${escapeHtml(appointment.message)}
      </div>
    ` : ''}

    <!-- Quick action links for mobile convenience -->
    <div style="margin-top:28px;text-align:center;">
      <a href="https://doctorluci.com/api/appointments/confirm-public?id=${appointment.id}" style="display:inline-block;margin:6px;padding:12px 24px;background:#0d6e6e;color:#ffffff;text-decoration:none;border-radius:24px;font-size:14px;font-weight:700;box-shadow:0 4px 12px rgba(13,110,110,0.2);">✓ Confirmă Programarea</a>
      <div style="margin-top:8px;">
        <a href="tel:${escapeHtml(appointment.phone)}" style="display:inline-block;margin:4px;padding:8px 16px;background:#f3f4f6;color:#1e2a35;text-decoration:none;border-radius:20px;font-size:12px;font-weight:600;border:1px solid #e5e7eb;">📞 Sună Pacientul</a>
        <a href="mailto:${escapeHtml(appointment.email)}?subject=${encodeURIComponent('Programare Dr. Lucia Gariuc')}" style="display:inline-block;margin:4px;padding:8px 16px;background:#f3f4f6;color:#1e2a35;text-decoration:none;border-radius:20px;font-size:12px;font-weight:600;border:1px solid #e5e7eb;">✉️ Scrie Email</a>
      </div>
    </div>

    <p style="margin:24px 0 0;text-align:center;font-size:12px;color:#9ca3af;font-style:italic;">Acest email a fost generat automat de doctorluci.com</p>
  `;
  return emailShell(body);
}

export function buildPatientEmailHtml(appointment: {
  name: string;
  slot: string;
}) {
  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:linear-gradient(135deg,#ecfdf5,#d1fae5);border-radius:50%;line-height:56px;text-align:center;">
        <span style="font-size:28px;">📅</span>
      </div>
    </div>
    <h2 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1e2a35;text-align:center;">Cerere de programare înregistrată</h2>
    
    <div style="margin:24px 0;padding:24px;background:linear-gradient(135deg,#f0fdfa 0%,#ecfdf5 100%);border-radius:12px;border-left:4px solid #0d6e6e;">
      <p style="margin:0 0 12px;font-size:15px;color:#1e2a35;">Bună ziua, <strong>${escapeHtml(appointment.name)}</strong>,</p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">Vă mulțumim pentru completarea cererii de programare la cabinetul <strong>Dr. Lucia Gariuc</strong> (Medic ORL / Doctor în Științe Medicale).</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">Am recepționat detaliile solicitării dumneavoastră:</p>
    </div>

    <!-- Appointment slot info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;">
                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Ora Solicitată</span><br>
                <span style="font-size:15px;color:#1e2a35;font-weight:600;">${escapeHtml(appointment.slot)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;">
                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Statut Cerere</span><br>
                <span style="display:inline-block;margin-top:4px;padding:3px 10px;background:#fef3c7;color:#d97706;font-size:12px;font-weight:700;border-radius:20px;letter-spacing:0.5px;">În așteptarea confirmării</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6;">Dr. Lucia Gariuc sau un reprezentant al cabinetului vă va contacta în cel mai scurt timp prin telefon sau email pentru a confirma programarea definitivă.</p>
    <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.6;">Dacă aveți întrebări suplimentare sau doriți să modificați cererea, vă rugăm să ne contactați.</p>

    <p style="margin:0;font-size:14px;color:#1e2a35;">Cu respect,<br><strong style="color:#0d6e6e;">Dr. Lucia Gariuc</strong></p>
  `;
  return emailShell(body);
}

export function buildPatientConfirmedEmailHtml(appointment: {
  name: string;
  slot: string;
}) {
  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:linear-gradient(135deg,#ecfdf5,#d1fae5);border-radius:50%;line-height:56px;text-align:center;">
        <span style="font-size:28px;">✅</span>
      </div>
    </div>
    <h2 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1e2a35;text-align:center;">Programare Confirmată</h2>
    
    <div style="margin:24px 0;padding:24px;background:linear-gradient(135deg,#f0fdfa 0%,#ecfdf5 100%);border-radius:12px;border-left:4px solid #0d6e6e;">
      <p style="margin:0 0 12px;font-size:15px;color:#1e2a35;">Bună ziua, <strong>${escapeHtml(appointment.name)}</strong>,</p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">Vă confirmăm cu bucurie că programarea dumneavoastră la cabinetul <strong>Dr. Lucia Gariuc</strong> a fost confirmată cu succes!</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">Iată detaliile programării confirmate:</p>
    </div>

    <!-- Appointment slot info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;">
                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Ora Confirmată</span><br>
                <span style="font-size:15px;color:#0d6e6e;font-weight:700;">${escapeHtml(appointment.slot)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;">
                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Statut Programare</span><br>
                <span style="display:inline-block;margin-top:4px;padding:3px 10px;background:#d1fae5;color:#065f46;font-size:12px;font-weight:700;border-radius:20px;letter-spacing:0.5px;">✓ Confirmată</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6;">Vă rugăm să vă prezentați la cabinet cu câteva minute înainte de ora stabilită. Dacă intervin modificări în programul dumneavoastră, vă rugăm să ne anunțați din timp.</p>

    <p style="margin:24px 0 0;font-size:14px;color:#1e2a35;">Vă așteptăm cu drag,<br><strong style="color:#0d6e6e;">Dr. Lucia Gariuc</strong></p>
  `;
  return emailShell(body);
}

export function buildNewsletterEmailHtml(name: string, lang = 'ro') {
  const normalizedLang = (lang || 'ro').toLowerCase().slice(0, 2);

  const content: Record<string, {
    title: string;
    greeting: string;
    intro: string;
    sec1Title: string;
    sec1Text: string;
    sec2Title: string;
    sec2Text: string;
    sec3Title: string;
    sec3Text: string;
    sec4Title: string;
    sec4Text: string;
    ctaText: string;
    footerText: string;
  }> = {
    ro: {
      title: "Ghidul tău de Sănătate ORL",
      greeting: `Bună ziua, <strong>${escapeHtml(name)}</strong>,`,
      intro: "Felicitări! Ai făcut primul pas spre o viață mai sănătoasă. Iată câteva sfaturi esențiale pentru îngrijirea urechilor, nasului și gâtului, pregătite special de <strong>Dr. Lucia Gariuc</strong>.",
      sec1Title: "1. Urechi (Igiena corectă)",
      sec1Text: "Evită bețișoarele de urechi! Canalul auditiv are capacitatea de a se curăța singur. Bețișoarele pot împinge ceara adânc, formând dopuri sau provocând leziuni ale timpanului.",
      sec2Title: "2. Nas (Curățare și hidratare)",
      sec2Text: "Folosește soluții saline sau apă de mare pentru lavaj nazal zilnic. Acest lucru ajută la îndepărtarea prafului, alergenilor și menține mucoasa nazală hidratată.",
      sec3Title: "3. Gât (Protecție și voce)",
      sec3Text: "Menține o hidratare corespunzătoare consumând suficientă apă. Evită băuturile extrem de reci sau fierbinți și protejează-ți gâtul de fum sau aer excesiv de uscat.",
      sec4Title: "4. Când să consulți un medic?",
      sec4Text: "Dacă experimentezi scăderi bruște de auz, dureri persistente, răgușeală care durează mai mult de 2 săptămâni sau dificultăți la înghițire, este important să programezi o consultație de specialitate.",
      ctaText: "Programează o Consultație",
      footerText: "Cabinet Medical ORL Dr. Lucia Gariuc • Chişinău, Republica Moldova",
    },
    en: {
      title: "Your ENT Health Guide",
      greeting: `Hello <strong>${escapeHtml(name)}</strong>,`,
      intro: "Congratulations! You have taken the first step toward a healthier life. Here are some essential tips for ear, nose, and throat care, prepared especially by <strong>Dr. Lucia Gariuc</strong>.",
      sec1Title: "1. Ears (Proper Hygiene)",
      sec1Text: "Avoid cotton swabs (Q-tips)! The ear canal is self-cleaning. Cotton swabs can push earwax deeper, leading to blockages or eardrum injuries.",
      sec2Title: "2. Nose (Cleansing & Hydration)",
      sec2Text: "Use saline sprays or seawater solutions for daily nasal irrigation. This helps remove dust and allergens while keeping the nasal mucosa hydrated.",
      sec3Title: "3. Throat (Protection & Voice)",
      sec3Text: "Stay well-hydrated by drinking enough water. Avoid extremely cold or hot beverages, and protect your throat from smoke or excessively dry air.",
      sec4Title: "4. When to see a doctor?",
      sec4Text: "If you experience sudden hearing loss, persistent pain, hoarseness lasting more than 2 weeks, or difficulty swallowing, it's important to schedule a specialist consultation.",
      ctaText: "Book a Consultation",
      footerText: "ENT Medical Office Dr. Lucia Gariuc • Chișinău, Republic of Moldova",
    },
    ru: {
      title: "Ваше руководство по ЛОР-здоровью",
      greeting: `Здравствуйте, <strong>${escapeHtml(name)}</strong>!`,
      intro: "Поздравляем! Вы сделали первый шаг к более здоровой жизни. Вот несколько основных советов по уходу за ушами, носом и горлом, подготовленных специально <strong>доктором Лучией Гарюк</strong>.",
      sec1Title: "1. Уши (Правильная гигиена)",
      sec1Text: "Избегайте ватных палочек! Слуховой проход очищается самостоятельно. Ватные палочки могут протолкнуть серу глубже, образуя пробки или повреждая барабанную перепонку.",
      sec2Title: "2. Нос (Очищение и увлажнение)",
      sec2Text: "Используйте солевые растворы или морскую воду для ежедневного промывания носа. Это помогает удалить пыль, аллергены и увлажняет слизистую оболочку.",
      sec3Title: "3. Горло (Защита и голос)",
      sec3Text: "Пейте достаточное количество воды. Избегайте слишком холодных или горячих напитков, защищайте горло от дыма и сухого воздуха.",
      sec4Title: "4. Когда обращаться к врачу?",
      sec4Text: "При резком снижении слуха, постоянной боли, охриплости более 2 недель или трудностях при глотании важно записаться на консультацию к специалисту.",
      ctaText: "Записаться на консультацию",
      footerText: "Кабинет ЛОР-врача Д-ра Лучии Гарюк • Кишинёв, Республика Молдова",
    },
    es: {
      title: "Tu guía de salud ORL",
      greeting: `Hola <strong>${escapeHtml(name)}</strong>,`,
      intro: "¡Felicidades! Has dado el primer paso hacia una vida más saludable. Aquí tienes algunos consejos esenciales para el cuidado de oídos, nariz y garganta, preparados especialmente por la <strong>Dra. Lucia Gariuc</strong>.",
      sec1Title: "1. Oídos (Higiene correcta)",
      sec1Text: "¡Evita los bastoncillos de algodón! El canal auditivo se limpia solo. Los bastoncillos pueden empujar el cerumen hacia adentro, formando tapones o dañando el tímpano.",
      sec2Title: "2. Nariz (Limpieza e hidratación)",
      sec2Text: "Usa soluciones salinas o agua de mar para el lavado nasal diario. Esto ayuda a eliminar polvo y alérgenos y mantiene hidratada la mucosa.",
      sec3Title: "3. Garganta (Protección y voz)",
      sec3Text: "Mantén una buena hidratación bebiendo suficiente agua. Evita bebidas extremadamente frías o calientes y protege la garganta del humo o aire seco.",
      sec4Title: "4. ¿Cuándo consultar a un médico?",
      sec4Text: "Si experimentas pérdida repentina de audición, dolor persistente, ronquera de más de 2 semanas o dificultad para tragar, es importante programar una consulta.",
      ctaText: "Reservar Cita",
      footerText: "Consulta Médica ORL Dra. Lucia Gariuc • Chișinău, República de Moldavia",
    }
  };

  const t = content[normalizedLang] || content.en;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        h2 { color: #0d9488; margin-top: 0; border-bottom: 2px solid #0d9488; padding-bottom: 8px; font-family: serif; }
        .section-box { background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .section-title { font-weight: bold; color: #0f766e; margin-bottom: 5px; }
        .footer { margin-top: 30px; font-size: 0.875rem; color: #6b7280; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #0d9488; color: #fff; text-decoration: none; border-radius: 20px; font-weight: bold; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${escapeHtml(t.title)}</h2>
        <p>${t.greeting}</p>
        <p>${t.intro}</p>
        
        <div class="section-box">
          <div class="section-title">${escapeHtml(t.sec1Title)}</div>
          <p style="margin: 0;">${escapeHtml(t.sec1Text)}</p>
        </div>

        <div class="section-box">
          <div class="section-title">${escapeHtml(t.sec2Title)}</div>
          <p style="margin: 0;">${escapeHtml(t.sec2Text)}</p>
        </div>

        <div class="section-box">
          <div class="section-title">${escapeHtml(t.sec3Title)}</div>
          <p style="margin: 0;">${escapeHtml(t.sec3Text)}</p>
        </div>

        <div class="section-box">
          <div class="section-title">${escapeHtml(t.sec4Title)}</div>
          <p style="margin: 0;">${escapeHtml(t.sec4Text)}</p>
        </div>

        <p style="text-align: center;">
          <a href="https://doctorluci.com#appointment" class="button" style="color: #ffffff;">${escapeHtml(t.ctaText)}</a>
        </p>

        <div class="footer">
          ${escapeHtml(t.footerText)}
        </div>
      </div>
    </body>
    </html>
  `;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildBookEmailHtml(lang = 'ro', purchaseId: string) {
  const normalizedLang = (lang || 'ro').toLowerCase().slice(0, 2);

  const t: Record<string, { subject: string; greeting: string; p1: string; p2: string; cta: string; }> = {
    ro: {
      subject: 'Cartea ta a sosit!',
      greeting: `Bună ziua!`,
      p1: 'Îți mulțumim pentru achiziție. Găsești mai jos link-ul pentru a descărca ghidul complet de sănătate ORL.',
      p2: 'Sperăm să îți fie de folos în călătoria ta spre un stil de viață mai sănătos.',
      cta: 'Descarcă Cartea',
    },
    en: {
      subject: 'Your book has arrived!',
      greeting: `Hello!`,
      p1: 'Thank you for your purchase. Below is the link to download your complete ENT health guide.',
      p2: 'We hope it helps you on your journey to a healthier lifestyle.',
      cta: 'Download Book',
    },
    ru: {
      subject: 'Ваша книга прибыла!',
      greeting: `Здравствуйте!`,
      p1: 'Спасибо за покупку. Ниже приведена ссылка для скачивания полного руководства по ЛОР-здоровью.',
      p2: 'Надеемся, это поможет вам на пути к здоровому образу жизни.',
      cta: 'Скачать книгу',
    },
    es: {
      subject: '¡Tu libro ha llegado!',
      greeting: `¡Hola!`,
      p1: 'Gracias por tu compra. A continuación encontrarás el enlace para descargar tu guía completa de salud ORL.',
      p2: 'Esperamos que te sea útil en tu camino hacia un estilo de vida más saludable.',
      cta: 'Descargar Libro',
    },
  };

  const c = t[normalizedLang] || t.en;
  
  const downloadUrl = `https://doctorluci.com/api/download/book/${purchaseId}`;

  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:linear-gradient(135deg,#ecfdf5,#d1fae5);border-radius:50%;line-height:56px;text-align:center;">
        <span style="font-size:28px;">📖</span>
      </div>
    </div>
    <h2 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1e2a35;text-align:center;">${escapeHtml(c.subject)}</h2>

    <div style="margin:24px 0;padding:24px;background:linear-gradient(135deg,#f0fdfa 0%,#ecfdf5 100%);border-radius:12px;border-left:4px solid #0d6e6e;">
      <p style="margin:0 0 12px;font-size:15px;color:#1e2a35;">${c.greeting}</p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">${c.p1}</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${c.p2}</p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:8px;">
      <a href="${downloadUrl}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#0d6e6e 0%,#0a8f8f 100%);color:#ffffff;text-decoration:none;border-radius:25px;font-size:14px;font-weight:600;letter-spacing:0.3px;">${escapeHtml(c.cta)}</a>
    </div>
  `;
  return emailShell(body);
}
