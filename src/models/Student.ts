import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  codeforcesHandle: string;
  teacherId: mongoose.Types.ObjectId;
  currentRating?: number;
  maxRating?: number;
  lastSynced?: Date;
  contestHistory?: Array<{
    contestId: number;
    contestName: string;
    rank: number;
    ratingUpdateTimeSeconds: number;
    oldRating: number;
    newRating: number;
  }>;
  submissions?: Array<{
    submissionId: number;
    contestId: number;
    problemIndex: string;
    problemName: string;
    problemRating: number;
    creationTimeSeconds: number;
    verdict: string;
  }>;
  sendReminder?: boolean;
  reminderEmailsSent?: number;
  profileToken?: string;
}

const studentSchema = new Schema<IStudent>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  codeforcesHandle: { type: String, required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  currentRating: { type: Number, default: 0 },
  maxRating: { type: Number, default: 0 },
  lastSynced: { type: Date },
  contestHistory: [
    {
      contestId: { type: Number },
      contestName: { type: String },
      rank: { type: Number },
      ratingUpdateTimeSeconds: { type: Number },
      oldRating: { type: Number },
      newRating: { type: Number },
    },
  ],
  submissions: [
    {
      submissionId: { type: Number },
      contestId: { type: Number },
      problemIndex: { type: String },
      problemName: { type: String },
      problemRating: { type: Number },
      creationTimeSeconds: { type: Number },
      verdict: { type: String },
    },
  ],
  sendReminder: { type: Boolean, default: true },
  reminderEmailsSent: { type: Number, default: 0 },
  profileToken: { type: String, unique: true },
});

export default mongoose.model<IStudent>('Student', studentSchema);