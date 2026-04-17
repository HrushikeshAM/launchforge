import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/projects.routes';
import deploymentRoutes from './routes/deployments.routes';
import artifactRoutes from './routes/artifacts.routes';
import logRoutes from './routes/logs.routes';
import settingsRoutes from './routes/settings.routes';
import dashboardRoutes from './routes/dashboard.routes';

import { ensureEnv } from './services/env.service';

ensureEnv(); // Auto-create .env or append keys BEFORE dotenv reads it

dotenv.config({ path: '../.env' }); 

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/deploy', deploymentRoutes);
app.use('/artifacts', artifactRoutes);
app.use('/logs', logRoutes);
app.use('/settings', settingsRoutes);
app.use('/dashboard', dashboardRoutes);

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/launchforge';

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB. Config might be missing, waiting for UI Setup Wizard.', err.message);
  });

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

