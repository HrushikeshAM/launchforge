import { Router, Response } from 'express';
import Deployment from '../models/Deployment';
import Project from '../models/Project';
import { AuthRequest, authenticate } from '../middlewares/auth';
import { triggerPipeline, getBuildStatus } from '../services/jenkins.service';

const router = Router();

// Trigger a deployment for a project
router.post('/:projectId', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { projectId } = req.params;
    const { environment } = req.body; // e.g., 'prod' or 'dev'

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // 1. Trigger Jenkins
    const buildNumber = await triggerPipeline(project.githubRepoUrl, project.githubBranch, project.name);

    // 2. Create local Deployment record
    const deployment = new Deployment({
      projectId,
      environment: environment || 'dev',
      status: 'pending',
      buildNumber,
      triggeredBy: req.user?.id
    });
    
    await deployment.save();

    res.status(201).json({ message: 'Deployment triggered', deployment });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get all deployments for user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // A more advanced query might check if triggeredBy === req.user.id
    // or if the project belongs to user. For simplicity, we get deployments by user.
    const deployments = await Deployment.find({ triggeredBy: req.user?.id })
      .populate('projectId')
      .sort({ createdAt: -1 });
      
    // Auto-sync pending or running deployments with Jenkins
    const syncPromises = deployments
      .filter(dep => (dep.status === 'pending' || dep.status === 'running') && dep.buildNumber)
      .map(async (dep) => {
        try {
          const statusInfo = await getBuildStatus(dep.buildNumber!);
          let updated = false;
          if (!statusInfo.building && statusInfo.result) {
              dep.status = statusInfo.result === 'SUCCESS' ? 'success' : 'failed';
              if (dep.status === 'success') {
                dep.artifactUrl = `gs://${process.env.GCS_BUCKET_NAME}/${dep.buildNumber}.zip`;
              }
              updated = true;
          } else if (statusInfo.building && dep.status !== 'running') {
              dep.status = 'running';
              updated = true;
          }
          if (updated) await dep.save();
        } catch (e) {
            // Ignore error for individual build sync so we still return deployments
        }
      });

    if (syncPromises.length > 0) {
      await Promise.all(syncPromises);
    }
      
    res.json(deployments);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update status (frontend can poll this, then we fetch from Jenkins and update DB)
router.get('/:deploymentId/sync', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { deploymentId } = req.params;
    const deployment = await Deployment.findById(deploymentId);
    
    if (!deployment || !deployment.buildNumber) {
      return res.status(404).json({ error: 'Deployment or build number not found' });
    }

    // Just check Jenkins for status
    const statusInfo = await getBuildStatus(deployment.buildNumber);
    
    if (!statusInfo.building && statusInfo.result) {
        deployment.status = statusInfo.result === 'SUCCESS' ? 'success' : 'failed';
        if (deployment.status === 'success') {
          // Assume the artifact was uploaded as project-name-buildNumber.zip or similar
          // This is a naive assumption for the mini-project logic
          deployment.artifactUrl = `gs://${process.env.GCS_BUCKET_NAME}/${deployment.buildNumber}.zip`;
        }
        await deployment.save();
    } else if (statusInfo.building) {
        deployment.status = 'running';
        await deployment.save();
    }

    res.json(deployment);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to sync status' });
  }
});

export default router;
