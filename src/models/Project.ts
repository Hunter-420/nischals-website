import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  technologies: string[];
  coreProblem?: string;
  resultMetric?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String },
    liveUrl: { type: String },
    githubUrl: { type: String },
    featured: { type: Boolean, default: false },
    technologies: [{ type: String }],
    coreProblem: { type: String },
    resultMetric: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
