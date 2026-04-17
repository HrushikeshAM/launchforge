import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth';
import { listArtifacts, getArtifactStream, deleteArtifact } from '../services/gcs.service';

const router = Router();

// List all artifacts
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const artifacts = await listArtifacts();
    res.json(artifacts);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error listing artifacts' });
  }
});

// Download an artifact
router.get('/download/:filename', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { filename } = req.params;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    const readStream = getArtifactStream(filename as string);
    
    readStream.on('error', (err) => {
        console.error('Stream error:', err);
        res.status(404).end();
    });

    readStream.pipe(res);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error downloading artifact' });
  }
});

// Delete an artifact
router.delete('/:filename', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { filename } = req.params;
    const result = await deleteArtifact(filename as string);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete artifact' });
  }
});

export default router;
