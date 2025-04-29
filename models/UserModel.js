import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User'
    },
    credits: {
        type: Number,
        default: 0,
        min: 0
    },
    profileCompleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
export const UserModel = new mongoose.model("User", UserSchema)

