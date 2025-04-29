import mongoose, { Schema } from "mongoose";

const SavedPostSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
});
export const SavedPostModel = new mongoose.model("SavedPost", SavedPostSchema)
