import mongoose, {  Schema } from "mongoose";

const CreditHistorySchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['login', 'profile_completion', 'feed_interaction', 'admin_adjustment'],
      required: true
    },
    credits: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
export const CreditHistory = new mongoose.model("CreditHistory", CreditHistorySchema)

