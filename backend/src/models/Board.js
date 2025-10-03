const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Admin', 'Editor', 'Viewer'], default: 'Editor' },
}, { _id: false });

const boardSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  lists: [{ type: Schema.Types.ObjectId, ref: 'List' }],
}, { timestamps: true });

module.exports = mongoose.model('Board', boardSchema);
