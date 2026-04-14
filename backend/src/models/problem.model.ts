import mongoose, { Document, Schema } from 'mongoose';

// ─── Problem Interface ───────────────────────────────────────────
// Represents a competitive-programming problem stored in the DB.
// Each problem has a difficulty tier, a time limit for duels,
// and an array of test cases for automated judging.
export interface IProblem extends Document {
  title: string;
  slug: string;              // URL-friendly identifier (e.g., "two-sum")
  description: string;       // Problem statement (markdown/HTML)
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;         // Minutes allowed per duel for this problem
  tags: string[];            // e.g. ["array", "hash-table"]
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblem>({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  timeLimit: {
    type: Number,
    required: true,
    default: 30, // 30-minute default time limit
  },
  tags: [{
    type: String,
  }],
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
  }],
}, {
  timestamps: true,
});

// Index on difficulty for fast $sample aggregation queries
problemSchema.index({ difficulty: 1 });

const Problem = mongoose.model<IProblem>('Problem', problemSchema);
export default Problem;
