import { Router, Response } from 'express';
import Project from '../models/Project';
import { AuthRequest, authenticate } from '../middlewares/auth';

const router = Router();

// Get all projects for logged-in user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const projects = await Project.find({ ownerId: req.user?.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new project
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, githubRepoUrl, githubBranch } = req.body;
    
    const project = new Project({
      name,
      githubRepoUrl,
      githubBranch: githubBranch || 'main',
      ownerId: req.user?.id
    });
    
    await project.save();
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
