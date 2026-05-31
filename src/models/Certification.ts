import mongoose, { Schema, Document } from 'mongoose';

export interface ICertification extends Document {
  title: string;
  issuer: string;
  date: Date;
  expiryDate?: Date;
  url?: string;        // Credly / verify URL
  image?: string;      // Badge image (Azure Blob URL)
  credentialId?: string;
  skills?: string[];   // Skills demonstrated
  createdAt: Date;
  updatedAt: Date;
}

const CertificationSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: Date, required: true },
    expiryDate: { type: Date },
    url: { type: String },
    image: { type: String },
    credentialId: { type: String },
    skills: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Certification || mongoose.model<ICertification>('Certification', CertificationSchema);
