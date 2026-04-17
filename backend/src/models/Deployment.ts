import mongoose, { Schema, Document } from 'mongoose';

export interface IDeployment extends Document {
  projectId: mongoose.Types.ObjectId;
  environment: string; // 'dev', 'staging', 'prod'
  status: string; // 'pending', 'running', 'success', 'failed'
  buildNumber?: number;
  artifactUrl?: string;
  triggeredBy: mongoose.Types.ObjectId;
  createdAt: Date;
  completedAt?: Date;
}

const DeploymentSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  environment: { type: String, enum: ['dev', 'staging', 'prod'], default: 'dev' },
  status: { type: String, enum: ['pending', 'running', 'success', 'failed'], default: 'pending' },
  buildNumber: { type: Number },
  artifactUrl: { type: String },
  triggeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export default mongoose.model<IDeployment>('Deployment', DeploymentSchema);
