import mongoose, { Document, Schema } from 'mongoose';

export type UrgencyLevel = 'normal' | 'urgent' | 'emergency';
export type CategoryType = 'Safety' | 'Events' | 'Lost & Found' | 'Public Works' | 'General';
export type PostStatus = 'active' | 'removed' | 'flagged';

export interface IPost extends Document {
  userId: string;
  community: string;
  text: string;
  imageUrl?: string;
  
  // AI enrichment - from Gemini
  category: CategoryType;
  categoryScore: number;
  entities: string[]; // People, places, organizations extracted by Gemini
  tags: string[];
  
  // AI enrichment - from HuggingFace
  urgency: UrgencyLevel;
  urgencyScore: number;
  
  // Meta
  createdAt: Date;
  location?: string;
  status: PostStatus;
}

const PostSchema = new Schema<IPost>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  community: {
    type: String,
    required: true,
    index: true,
  },
  text: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  // Gemini extraction fields
  category: {
    type: String,
    enum: ['Safety', 'Events', 'Lost & Found', 'Public Works', 'General'],
    default: 'General',
    index: true,
  },
  categoryScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1,
  },
  entities: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  // HuggingFace urgency classification
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal',
    index: true,
  },
  urgencyScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1,
  },
  location: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'removed', 'flagged'],
    default: 'active',
    index: true,
  },
}, {
  timestamps: true,
});

// Compound indexes
PostSchema.index({ community: 1, createdAt: -1 });
PostSchema.index({ urgency: 1, createdAt: -1 });
PostSchema.index({ community: 1, status: 1, createdAt: -1 });

// Text index for search
PostSchema.index({ text: 'text', tags: 'text', category: 'text' });

export const Post = mongoose.model<IPost>('Post', PostSchema);

