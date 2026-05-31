import mongoose, { Schema, Document } from 'mongoose';

export interface INowItem {
  category: string; // e.g. "Exploring", "Projects", "Books", "Podcasts"
  items: string[];
}

export interface INow extends Document {
  content: string; // Rich HTML from Tiptap (optional legacy)
  sections: INowItem[];
  previous: INowItem[];
  addons: INowItem[];
  updatedAt: Date;
  createdAt: Date;
}

const NowSchema: Schema = new Schema(
  {
    content: { type: String, default: '' },
    sections: [
      {
        category: { type: String, required: true },
        items: [{ type: String }],
      },
    ],
    previous: [
      {
        category: { type: String, required: true },
        items: [{ type: String }],
      },
    ],
    addons: [
      {
        category: { type: String, required: true },
        items: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Now || mongoose.model<INow>('Now', NowSchema);
