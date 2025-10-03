const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const attachmentSchema = new Schema({
  filename: String,
  url: String,
  uploadedAt: { type: Date, default: Date.now }
}, { _id: true });

const activitySchema = new Schema({
  text: String,
  by: { type: Schema.Types.ObjectId, ref: 'User' },
  at: { type: Date, default: Date.now }
}, { _id: true });

const cardSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  list: { type: Schema.Types.ObjectId, ref: 'List', required: true },
  board: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  position: { type: Number, default: 0 },
  dueDate: { type: Date },
  labels: [{ type: String }],
  attachments: [attachmentSchema],
  comments: [commentSchema],
  activity: [activitySchema],
  completed: { type: Boolean, default: false },
}, { timestamps: true });

cardSchema.index({ title: 'text', description: 'text' });


module.exports = mongoose.model('Card', cardSchema);
