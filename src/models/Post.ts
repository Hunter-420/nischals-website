import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string; // HTML or JSON from Tiptap
  excerpt: string;
  keyTakeaway?: string;
  coverImage?: string;
  published: boolean;
  publishedAt: Date;
  primaryDomain?: string;
  tags: string[];
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    keyTakeaway: { type: String },
    coverImage: { type: String },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
    primaryDomain: { type: String, default: '' },
    tags: [{ type: String }],
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
