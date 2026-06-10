import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { AppointmentStatus } from '@prisma/client';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

const router = Router();

// GET /api/availability/blocked-days — Get all blocked days from today onwards
router.get('/blocked-days', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = startOfDay(new Date());
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

    return res.status(200).json(blockedDays.map(b => b.date));
  } catch (error) {
    next(error);
  }
});

// GET /api/availability/booked-slots?date=YYYY-MM-DD — Get all confirmed slots for a specific date
router.get('/booked-slots', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;
    
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
    }

    const parsedDate = parseISO(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const start = startOfDay(parsedDate);
    const end = endOfDay(parsedDate);

    const appointments = await db.appointment.findMany({
      where: {
        preferredDate: {
          gte: start,
          lte: end,
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
