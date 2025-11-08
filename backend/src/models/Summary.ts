import mongoose, { Document, Schema } from 'mongoose';

export interface SummaryStats {
  total: number;
  emergency: number;
  urgent: number;
  normal: number;
}

export interface ISummary extends Document {
  community: string;
  dateISO: string;
  summaryText: string;
  stats: SummaryStats;
  createdAt: Date;
}

const SummarySchema = new Schema<ISummary>({
  community: {
    type: String,
    required: true,
    index: true,
  },
  dateISO: {
    type: String,
    required: true,
  },
  summaryText: {
    type: String,
    required: true,
  },
  stats: {
    total: { type: Number, required: true },
    emergency: { type: Number, required: true },
    urgent: { type: Number, required: true },
    normal: { type: Number, required: true },
  },
}, {
  timestamps: true,
});

// Unique compound index for community + date
SummarySchema.index({ community: 1, dateISO: 1 }, { unique: true });

export const Summary = mongoose.model<ISummary>('Summary', SummarySchema);

