import { db } from '../db.js';
import { AppointmentInput } from '../schemas/appointment.js';
import { AppointmentStatus } from '@prisma/client';
import {
  sendEmail,
  buildDoctorEmailHtml,
  buildPatientEmailHtml,
  buildPatientConfirmedEmailHtml,
  buildPatientRejectedEmailHtml,
} from './mailer.js';
import { env } from '../env.js';
import { pino } from 'pino';

const logger = pino();

/**
 * Parse a date string (YYYY-MM-DD or full ISO) to UTC midnight.
 * Returns null if the input is falsy or invalid.
 */
function toUTCMidnight(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const dayPart = dateStr.substring(0, 10); // "YYYY-MM-DD"
  const [y, m, d] = dayPart.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Check if a given date + slot already has a CONFIRMED or PENDING appointment.
 * Returns the conflicting appointment if found, or null otherwise.
 * Optionally excludes a specific appointment ID (for self-checks during status updates).
 */
async function findSlotConflict(
  preferredDate: Date,
  slot: string,
  excludeId?: string,
) {
  const nextDay = new Date(preferredDate.getTime() + 24 * 60 * 60 * 1000);

  const where: any = {
    preferredDate: { gte: preferredDate, lt: nextDay },
    slot,
    status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  return db.appointment.findFirst({ where });
}

export async function createAppointment(data: AppointmentInput) {
  const parsedDate = toUTCMidnight(data.preferredDate);

  // --- Double-booking guard at submission time ---
  if (parsedDate) {
    const conflict = await findSlotConflict(parsedDate, data.slot);
    if (conflict) {
      const err = new Error(
        `Slot ${data.slot} on this date is already booked or pending confirmation.`
      );
      (err as any).statusCode = 409;
      throw err;
    }
  }

  // 1. Persist the appointment to the database with status = PENDING
  const appointment = await db.appointment.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      message: data.message,
      slot: data.slot,
      preferredDate: parsedDate,
      status: AppointmentStatus.PENDING,
    },
  });

  // Log appointment creation without the message body to keep PII out of logs
  logger.info({
    appointmentId: appointment.id,
    slot: appointment.slot,
    preferredDate: parsedDate?.toISOString(),
    status: appointment.status,
  }, 'Appointment successfully created in database');

  // 2. Trigger asynchronous email sending
  // Wrap in a separate context to prevent any nodemailer delays/failures from blocking the API response
  Promise.resolve().then(async () => {
    // Send to doctor
    const doctorHtml = buildDoctorEmailHtml(appointment);
    await sendEmail({
      to: env.DOCTOR_EMAIL,
      subject: `Programare nouă — ${appointment.name} la ora ${appointment.slot}`,
      html: doctorHtml,
    });

    // Send confirmation to patient
    const patientHtml = buildPatientEmailHtml({
      name: appointment.name,
      slot: appointment.slot,
    });
    await sendEmail({
      to: appointment.email,
      subject: 'Confirmarea cererii de programare — Dr. Lucia Gariuc',
      html: patientHtml,
    });
  }).catch((err) => {
    logger.error({ error: err }, 'Error in async email notification pipeline');
  });

  return appointment;
}

export async function listAppointments(filters: {
  status?: AppointmentStatus;
  limit?: number;
  offset?: number;
}) {
  const { status, limit = 50, offset = 0 } = filters;

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const [total, items] = await Promise.all([
    db.appointment.count({ where }),
    db.appointment.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    total,
    limit,
    offset,
    items,
  };
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  // --- Double-booking guard at confirmation time ---
  if (status === AppointmentStatus.CONFIRMED) {
    const appointment = await db.appointment.findUnique({ where: { id } });
    if (!appointment) {
      const err = new Error('Appointment not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (appointment.preferredDate) {
      const dateAtMidnight = toUTCMidnight(appointment.preferredDate.toISOString());
      if (dateAtMidnight) {
        const conflict = await findSlotConflict(dateAtMidnight, appointment.slot, id);
        if (conflict) {
          const err = new Error(
            `Cannot confirm: slot ${appointment.slot} on this date is already ${conflict.status === AppointmentStatus.CONFIRMED ? 'confirmed' : 'pending'} for another patient (${conflict.name}).`
          );
          (err as any).statusCode = 409;
          throw err;
        }
      }
    }
  }

  const appointment = await db.appointment.update({
    where: { id },
    data: { status },
  });

  logger.info({ appointmentId: id, newStatus: status }, 'Appointment status updated');

  // Trigger asynchronous email notifications based on the new status
  if (status === AppointmentStatus.CONFIRMED || status === AppointmentStatus.CANCELLED) {
    Promise.resolve().then(async () => {
      let html = '';
      let subject = '';

      if (status === AppointmentStatus.CONFIRMED) {
        subject = 'Confirmarea programării dumneavoastră — Dr. Lucia Gariuc';
        html = buildPatientConfirmedEmailHtml({
          name: appointment.name,
          slot: appointment.slot,
        });
      } else {
        subject = 'Anularea programării dumneavoastră — Dr. Lucia Gariuc';
        html = buildPatientRejectedEmailHtml({
          name: appointment.name,
          slot: appointment.slot,
        });
      }

      logger.debug({ appointmentId: id, status, recipient: appointment.email }, 'Attempting to send status update email');

      await sendEmail({
        to: appointment.email,
        subject,
        html,
      });
    }).catch((err) => {
      logger.error({
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        appointmentId: id,
        targetStatus: status
      }, 'Critical failure in the async status email notification pipeline');
    });
  }

  return appointment;
}

export async function deleteAppointment(id: string) {
  const appointment = await db.appointment.delete({
    where: { id },
  });

  logger.info({ appointmentId: id }, 'Appointment permanently deleted');
  return appointment;
}

