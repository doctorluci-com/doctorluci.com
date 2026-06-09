import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import { db } from '../db.js';

const router = Router();

// GET /api/download/book/:token
router.get('/book/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }

    // Verify token matches a valid BookPurchase
    const purchase = await db.bookPurchase.findUnique({
      where: { id: token },
    });

    if (!purchase || purchase.status !== 'completed') {
      return res.status(403).json({ error: 'Invalid or expired download link' });
    }

    // Serve the file securely
    const filePath = path.join(process.cwd(), 'private', 'doctorluci.pdf');
    
    res.download(filePath, 'Dr_Lucia_Gariuc_Sanatate_ORL.pdf', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Could not download the file' });
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;
