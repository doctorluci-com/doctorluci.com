import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { startOfDay, parseISO } from 'date-fns';

const router = Router();

const BlockDaySchema = z.object({
  date: z.string().datetime(), // ISO string
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

    const date = startOfDay(parseISO(parsed.data.date));

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
