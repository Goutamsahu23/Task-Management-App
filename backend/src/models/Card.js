// src/models/Card.js (showing only the relevant addition)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const attachmentSchema = new Schema({
  filename: String,
  originalname: String,
  url: String,
  mimetype: String,
  size: Number,
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const cardSchema = new Schema({
  title: String,
  description: String,
  labels: [String],
  dueDate: Date,
  status: String,
  list: { type: Schema.Types.ObjectId, ref: 'List' },
  board: { type: Schema.Types.ObjectId, ref: 'Board' },
  comments: [{ /*...*/ }],
  activity: [{ /*...*/ }],
  attachments: [attachmentSchema],
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);
