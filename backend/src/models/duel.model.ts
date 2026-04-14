import mongoose, { Document, Schema } from 'mongoose';

// ─── Duel Interface ──────────────────────────────────────────────
// Represents a single 1v1 duel session between two players.
// Lifecycle: waiting → active → completed
export interface IDuel extends Document {
  roomId: string;                       // 6-char alphanumeric room code
  players: {
    userId: mongoose.Types.ObjectId;    // Reference to User document
    socketId: string;                   // Socket.io connection ID
    username: string;                   // Display name for UI
    leetcodeUsername: string;           // Verified LeetCode username for submission polling
  }[];
  problemSlug: string | null;           // LeetCode problem slug (e.g. "two-sum")
  problemTitle: string | null;          // Problem title for display
  status: 'waiting' | 'active' | 'completed';
  winnerId: mongoose.Types.ObjectId | null;    // Set when match ends
  difficulty: 'easy' | 'medium' | 'hard' | null;
  startTime: Date | null;              // When the problem was assigned
  endTime: Date | null;                // When a player solved it
  createdAt: Date;
  updatedAt: Date;
}

const duelSchema = new Schema<IDuel>({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  players: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    socketId: { type: String, required: true },
    username: { type: String, required: true },
    leetcodeUsername: { type: String, required: true },
  }],
  problemSlug: {
    type: String,
    default: null,
  },
  problemTitle: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed'],
    default: 'waiting',
  },
  winnerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: null,
  },
  startTime: {
    type: Date,
    default: null,
  },
  endTime: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

const Duel = mongoose.model<IDuel>('Duel', duelSchema);
export default Duel;
