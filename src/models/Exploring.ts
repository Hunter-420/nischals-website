import mongoose, { Schema, Document } from 'mongoose';

export interface IExploringItem {
  title: string;
  completed: boolean;
}

export interface IExploring extends Document {
  category: string;
  order: number;
  items: IExploringItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ExploringItemSchema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const ExploringSchema: Schema = new Schema(
  {
    category: { type: String, required: true },
    order: { type: Number, default: 0 },
    items: [ExploringItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Exploring || mongoose.model<IExploring>('Exploring', ExploringSchema);
