import mongoose, { Schema, Document } from 'mongoose';

export interface ILibraryItem extends Document {
  title: string;
  author: string;
  type: 'book' | 'podcast' | 'article' | 'video';
  status: 'reading' | 'completed' | 'to-read';
  link?: string;
  coverImage?: string;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LibraryItemSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    type: { type: String, enum: ['book', 'podcast', 'article', 'video'], required: true },
    status: { type: String, enum: ['reading', 'completed', 'to-read'], default: 'completed' },
    link: { type: String },
    coverImage: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.LibraryItem || mongoose.model<ILibraryItem>('LibraryItem', LibraryItemSchema);
