import mongoose, { Document, Schema } from 'mongoose';

export interface IFriendGroup extends Document {
  user: mongoose.Types.ObjectId;
  friends: string[];
}

const friendGroupSchema = new Schema<IFriendGroup>({
  user: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  friends: [{ type: String, required: true }]
}, { timestamps: true });

export default mongoose.model<IFriendGroup>('FriendGroup', friendGroupSchema);
