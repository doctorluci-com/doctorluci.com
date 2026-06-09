import { db } from '../db.js';
import { AppointmentInput } from '../schemas/appointment.js';
import { AppointmentStatus } from '@prisma/client';
import { sendEmail, buildDoctorEmailHtml, buildPatientEmailHtml, buildPatientConfirmedEmailHtml } from './mailer.js';
import { env } from '../env.js';
import { pino } from 'pino';

const logger = pino();

export async function createAppointment(data: AppointmentInput) {
  // 1. Persist the appointment to the database with status = PENDING
  const appointment = await db.appointment.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      message: data.message,
      slot: data.slot,
      status: AppointmentStatus.PENDING,
    },
  });

  // Log appointment creation without the message body to keep PII out of logs
  logger.info({
    appointmentId: appointment.id,
    slot: appointment.slot,
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
  const appointment = await db.appointment.update({
    where: { id },
    data: { status },
  });

  logger.info({ appointmentId: id, newStatus: status }, 'Appointment status updated');

  if (status === AppointmentStatus.CONFIRMED) {
    Promise.resolve().then(async () => {
      const html = buildPatientConfirmedEmailHtml({
        name: appointment.name,
        slot: appointment.slot,
      });
      await sendEmail({
        to: appointment.email,
        subject: 'Confirmarea programării dumneavoastră — Dr. Lucia Gariuc',
        html,
      });
    }).catch((err) => {
      logger.error({ error: err, appointmentId: id }, 'Failed to send confirmation email to patient');
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
