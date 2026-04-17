import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/projects.routes';
import deploymentRoutes from './routes/deployments.routes';
import artifactRoutes from './routes/artifacts.routes';
import logRoutes from './routes/logs.routes';

dotenv.config({ path: '../.env' }); // Assuming we use root .env for both or backend handles env separately, but we'll use local relative traversal

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

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/launchforge';

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
