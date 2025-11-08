import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAlert extends Document {
  type: string;
  community: string;
  reason: string;
  posts: Types.ObjectId[];
  createdAt: Date;
}

const AlertSchema = new Schema<IAlert>({
  type: {
    type: String,
    required: true,
  },
  community: {
    type: String,
    required: true,
    index: true,
  },
  reason: {
    type: String,
    required: true,
  },
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post',
  }],
}, {
  timestamps: true,
});

// Index for querying recent alerts by community
AlertSchema.index({ community: 1, createdAt: -1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);

