import { Request, Response } from 'express';
import { syncCodeforcesData } from '../utils/codeforcesSync';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const triggerSync = async (req: AuthRequest, res: Response):Promise<any> => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized: No teacher ID' });
    }

    const { studentId } = req.body;
    await syncCodeforcesData(studentId);
    res.json({ message: 'Sync triggered successfully' });
  } catch (error: unknown) {
    console.error('Sync error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};