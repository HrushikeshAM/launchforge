import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth';
import { getBuildLogs, getBuildStatus } from '../services/jenkins.service';

const router = Router();

// Get Jenkins logs for a build
router.get('/:buildNumber', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const buildNumber = parseInt(req.params.buildNumber as string, 10);
    if (isNaN(buildNumber)) {
      return res.status(400).json({ error: 'Invalid build number' });
    }

    const logs = await getBuildLogs(buildNumber);
    const status = await getBuildStatus(buildNumber).catch(() => ({ building: false, result: 'UNKNOWN' }));

    res.json({ logs, status });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error while fetching logs' });
  }
});

export default router;
