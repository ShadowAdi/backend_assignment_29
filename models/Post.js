import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Post Schema
const PostSchema = new Schema({
  source: {
    type: String,
    enum: ['Reddit', 'Twitter'],
    required: true
  },
  postId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  }
});


export const PostModel = mongoose.model('Post', PostSchema);