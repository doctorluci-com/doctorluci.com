import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import { AppointmentStatus } from '@prisma/client';

const router = Router();

/**
 * Returns UTC midnight for "today" (the current UTC date).
 */
function todayUTCMidnight(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Parse a "YYYY-MM-DD" string into a Date at UTC midnight.
 */
function toUTCMidnight(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// GET /api/availability/blocked-days — Get all blocked days from today onwards
router.get('/blocked-days', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = todayUTCMidnight();
    const blockedDays = await db.blockedDay.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      select: {
        date: true,
      },
    });

    // Return dates as YYYY-MM-DD strings to avoid client-side timezone confusion
    return res.status(200).json(blockedDays.map(b => {
      const d = b.date;
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }));
  } catch (error) {
    next(error);
  }
});

// GET /api/availability/booked-slots?date=YYYY-MM-DD — Get all confirmed slots for a specific date
router.get('/booked-slots', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;
    
    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
    }

    const start = toUTCMidnight(date);
    // End of day = next day at UTC midnight
    const [y, m, d] = date.split('-').map(Number);
    const end = new Date(Date.UTC(y, m - 1, d + 1)); // start of next day

    const appointments = await db.appointment.findMany({
      where: {
        preferredDate: {
          gte: start,
          lt: end,
        },
        status: AppointmentStatus.CONFIRMED,
      },
      select: {
        slot: true,
      },
    });

    return res.status(200).json(appointments.map(a => a.slot));
  } catch (error) {
    next(error);
  }
});

export default router;
