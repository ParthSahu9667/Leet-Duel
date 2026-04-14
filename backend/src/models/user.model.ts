import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  leetcodeUsername?: string; // Verified LeetCode username — required to compete in duels
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function(this: any) {
      // Password is required only if the user does not have a Google ID
      return !this.googleId;
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // sparse allows multiple null/undefined values for unique fields
  },
  leetcodeUsername: {
    type: String,
    unique: true,
    sparse: true, // Only set after user verifies via /account
  },
  refreshToken: {
    type: String,
  },
}, {
  timestamps: true,
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
