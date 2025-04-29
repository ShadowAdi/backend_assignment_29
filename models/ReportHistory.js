import mongoose, { Schema } from "mongoose";

const ReportHistorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    reportedAt: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Resolved'],
        default: 'Pending'
    },
});

export const ReportHistoryModel = new mongoose.model("ReportHistory", ReportHistorySchema)
