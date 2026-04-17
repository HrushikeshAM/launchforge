import { Router, Response } from 'express';
import Project from '../models/Project';
import Deployment from '../models/Deployment';
import { AuthRequest, authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    // Fast top-level stats
    const totalProjects = await Project.countDocuments({ ownerId: userId });
    
    const userDeployments = await Deployment.find({ triggeredBy: userId })
      .populate('projectId')
      .sort({ createdAt: -1 });

    let successfulDeploys = 0;
    let failedBuilds = 0;
    const activeEnvironmentsSet = new Set<string>();

    userDeployments.forEach(dep => {
      if (dep.status === 'success') successfulDeploys++;
      if (dep.status === 'failed') failedBuilds++;
      if (dep.environment) activeEnvironmentsSet.add(dep.environment);
    });

    // Chart Aggregation for the last 7 days
    const chartData: { name: string, builds: number, errors: number, dateKey: string }[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      chartData.push({
        name: dayName,
        builds: 0,
        errors: 0,
        dateKey: d.toDateString() // for matching later
      });
    }

    // Populate chart array
    userDeployments.forEach(dep => {
      const depDate = dep.createdAt;
      // We only care about the last 7 days roughly
      const diffTime = Math.abs(new Date().getTime() - depDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) {
        const dStr = depDate.toDateString();
        const chartEntry = chartData.find(c => c.dateKey === dStr);
        if (chartEntry) {
          chartEntry.builds++;
          if (dep.status === 'failed') chartEntry.errors++;
        }
      }
    });

    // Cleanup dateKey so it isn't sent unnecessarily
    const finalChartData = chartData.map(c => ({
      name: c.name,
      builds: c.builds,
      errors: c.errors
    }));

    // Recent activity grouping (limit to latest 4)
    const recentActivity = userDeployments.slice(0, 4).map((dep: any) => {
      let activityText = '';
      if (dep.status === 'success') activityText = `Build #${dep.buildNumber || '0'} passed`;
      else if (dep.status === 'failed') activityText = `Build #${dep.buildNumber || '0'} failed`;
      else if (dep.status === 'running') activityText = `Build #${dep.buildNumber || '0'} is running`;
      else activityText = 'Deployment queued';

      return {
        time: dep.createdAt, // Send raw date, frontend parses it
        text: activityText,
        env: dep.projectId?.name ? `${dep.projectId.name} • ${dep.environment}` : dep.environment
      };
    });

    res.json({
      stats: {
        totalProjects,
        successfulDeploys,
        failedBuilds,
        activeEnvironments: activeEnvironmentsSet.size
      },
      chartData: finalChartData,
      recentActivity
    });
  } catch (error: any) {
    console.error('Error generating dashboard stats', error);
    res.status(500).json({ error: 'Server error pulling dashboard metrics' });
  }
});

export default router;
