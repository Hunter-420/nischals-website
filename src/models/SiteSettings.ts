import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  title: string;
  description: string;
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
  aboutText: string;
  resumeUrl?: string;
  resumeExperience?: string;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema: Schema = new Schema(
  {
    title: { type: String, required: true, default: 'My Portfolio' },
    description: { type: String, required: true, default: 'Personal Engineering Portfolio' },
    socialLinks: {
      github: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
      email: { type: String },
    },
    aboutText: { type: String, default: '' },
    resumeUrl: { type: String },
    resumeExperience: { type: String, default: '' },
    skills: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
