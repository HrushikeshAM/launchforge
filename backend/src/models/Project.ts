import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  githubRepoUrl: string;
  githubBranch: string;
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  githubRepoUrl: { type: String, required: true },
  githubBranch: { type: String, required: true, default: 'main' },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProject>('Project', ProjectSchema);
