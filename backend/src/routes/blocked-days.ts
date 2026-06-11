import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * Helper: parse a date string (either "YYYY-MM-DD" or a full ISO datetime)
 * and always return a Date pinned to UTC midnight of that calendar day.
 * This avoids day-shifting that occurs when date-fns startOfDay()
 * interprets the value in the server's local timezone.
 */
function toUTCMidnight(dateStr: string): Date {
  // Extract just the YYYY-MM-DD portion regardless of input format
  const dayPart = dateStr.substring(0, 10); // "2026-08-10"
  const [y, m, d] = dayPart.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)); // UTC midnight
}

const BlockDaySchema = z.object({
  // Accept both "YYYY-MM-DD" and full ISO datetime strings
  date: z.string().refine(
    (val) => /^\d{4}-\d{2}-\d{2}/.test(val),
    { message: 'date must start with YYYY-MM-DD format' }
  ),
  reason: z.string().optional(),
});

// GET /api/blocked-days — Get all blocked days (Admin)
router.get('/', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = await db.blockedDay.findMany({
      orderBy: { date: 'asc' },
    });
    return res.status(200).json(days);
  } catch (error) {
    next(error);
  }
});

// POST /api/blocked-days — Block a new day
router.post('/', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = BlockDaySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'ValidationError',
        issues: parsed.error.issues,
      });
    }

    const date = toUTCMidnight(parsed.data.date);

    // Upsert to avoid duplicates
    const blockedDay = await db.blockedDay.upsert({
      where: { date },
      update: { reason: parsed.data.reason },
      create: {
        date,
        reason: parsed.data.reason,
      },
    });

    return res.status(201).json(blockedDay);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/blocked-days/:id — Unblock a day
router.delete('/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await db.blockedDay.delete({
      where: { id },
    });
    return res.status(204).send();
  } catch (error) {
    // Ignore error if it doesn't exist
    return res.status(204).send();
  }
});

export default router;
