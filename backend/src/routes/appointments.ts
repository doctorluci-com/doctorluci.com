import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';
import { AppointmentSchema } from '../schemas/appointment.js';
import { db } from '../db.js';
import {
  createAppointment,
  listAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from '../services/appointments.js';
import { requireAdmin } from '../middleware/auth.js';
import { appointmentRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

// GET /api/appointments/confirm-public — Public one-click confirmation
router.get('/confirm-public', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idSchema = z.string().uuid('Invalid appointment ID format');
    const parsed = idSchema.safeParse(req.query.id);

    if (!parsed.success) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Eroare Confirmare</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f5f3ef; color: #1e2a35; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 32px; max-width: 480px; width: 100%; text-align: center; }
            h1 { color: #dc2626; font-size: 24px; margin-top: 0; font-family: Georgia, serif; }
            p { font-size: 15px; color: #4b5563; line-height: 1.6; }
            .btn { display: inline-block; margin-top: 20px; padding: 10px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 20px; font-weight: 600; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>❌ Link Invalid</h1>
            <p>Codul de programare furnizat nu este valid sau lipsește. Vă rugăm să verificați link-ul primit în email.</p>
            <a href="https://doctorluci.com" class="btn">Mergi la site</a>
          </div>
        </body>
        </html>
      `);
    }

    const id = parsed.data;

    // Check if appointment exists
    const appointment = await db.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Eroare Confirmare</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f5f3ef; color: #1e2a35; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 32px; max-width: 480px; width: 100%; text-align: center; }
            h1 { color: #dc2626; font-size: 24px; margin-top: 0; font-family: Georgia, serif; }
            p { font-size: 15px; color: #4b5563; line-height: 1.6; }
            .btn { display: inline-block; margin-top: 20px; padding: 10px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 20px; font-weight: 600; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>❌ Programarea nu a fost găsită</h1>
            <p>Programarea solicitată nu există sau a fost ștearsă din sistem.</p>
            <a href="https://doctorluci.com" class="btn">Mergi la site</a>
          </div>
        </body>
        </html>
      `);
    }

    // Update status to CONFIRMED
    await updateAppointmentStatus(id, AppointmentStatus.CONFIRMED);

    // Escape values for page display
    const escapeHtml = (unsafe: string): string =>
      unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Programare Confirmată</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f5f3ef; color: #1e2a35; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: white; border-radius: 16px; box-shadow: 0 4px 30px rgba(0,0,0,0.06); padding: 40px 32px; max-width: 500px; width: 100%; text-align: center; }
          .icon { display: inline-block; width: 64px; height: 64px; background: #ecfdf5; color: #059669; border-radius: 50%; line-height: 64px; font-size: 32px; margin-bottom: 20px; }
          h1 { color: #0d6e6e; font-size: 26px; margin: 0 0 10px 0; font-family: Georgia, serif; font-weight: normal; }
          p { font-size: 15px; color: #6b7280; line-height: 1.6; margin: 0 0 24px 0; }
          .details-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 24px; }
          .detail-row { margin-bottom: 12px; }
          .detail-row:last-child { margin-bottom: 0; }
          .label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; display: block; margin-bottom: 2px; }
          .value { font-size: 15px; color: #1e2a35; font-weight: 600; }
          .badge { display: inline-block; padding: 3px 10px; background: #d1fae5; color: #065f46; font-size: 12px; font-weight: 700; border-radius: 20px; letter-spacing: 0.5px; }
          .btn { display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #0d6e6e 0%, #0a8f8f 100%); color: white; text-decoration: none; border-radius: 24px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(13,110,110,0.15); }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✓</div>
          <h1>Programare Confirmată!</h1>
          <p>Cererea de programare a fost confirmată cu succes în sistem. Un email de confirmare a fost trimis către pacient.</p>
          
          <div class="details-box">
            <div class="detail-row">
              <span class="label">Pacient</span>
              <span class="value">${escapeHtml(appointment.name)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Ora Rezervată</span>
              <span class="value">${escapeHtml(appointment.slot)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status</span>
              <span class="badge">✓ Confirmată</span>
            </div>
          </div>

          <a href="https://doctorluci.com" class="btn">Mergi la site</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
});

const UpdateStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
});

const ListQuerySchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

// POST /api/appointments — public, rate-limited
router.post('/', appointmentRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AppointmentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'ValidationError',
        issues: parsed.error.issues,
      });
    }

    const appointment = await createAppointment(parsed.data);

    return res.status(201).json({
      id: appointment.id,
      status: appointment.status,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/appointments — admin only
router.get('/', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ListQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'ValidationError',
        issues: parsed.error.issues,
      });
    }

    const result = await listAppointments(parsed.data);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/appointments/:id — admin only
router.patch('/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const parsed = UpdateStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'ValidationError',
        issues: parsed.error.issues,
      });
    }

    const appointment = await updateAppointmentStatus(id, parsed.data.status);
    return res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/appointments/:id — admin only
router.delete('/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await deleteAppointment(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
