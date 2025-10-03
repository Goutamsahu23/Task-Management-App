const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listSchema = new Schema({
  title: { type: String, required: true },
  board: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  position: { type: Number, default: 0 },
  cards: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);
