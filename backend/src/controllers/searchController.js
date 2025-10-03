const Card = require('../models/Card');
const Board = require('../models/Board');
const List = require('../models/List');
const mongoose = require('mongoose');

exports.searchCards = async (req, res) => {
  try {
    const { q = '', labels, board, dueFrom, dueTo, status } = req.query;

    const pipeline = [];

    if (labels) {
      const arr = labels.split(',').map(s => s.trim()).filter(Boolean);
      if (arr.length) pipeline.push({ $match: { labels: { $in: arr } } });
    }

    if (q && q.trim()) {
      const term = q.trim();
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: term, $options: 'i' } },
            { description: { $regex: term, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      { $lookup: { from: 'boards', localField: 'board', foreignField: '_id', as: 'boardDoc' } },
      { $unwind: { path: '$boardDoc', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'lists', localField: 'list', foreignField: '_id', as: 'listDoc' } },
      { $unwind: { path: '$listDoc', preserveNullAndEmptyArrays: true } }
    );

    if (board) {
      if (mongoose.Types.ObjectId.isValid(board)) {
        pipeline.push({ $match: { board: mongoose.Types.ObjectId(board) } });
      } else {
        pipeline.push({ $match: { 'boardDoc.title': { $regex: board, $options: 'i' } } });
      }
    }

    if (q && q.trim()) {
      const term = q.trim();
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: term, $options: 'i' } },
            { description: { $regex: term, $options: 'i' } },
            { 'boardDoc.title': { $regex: term, $options: 'i' } },
            { 'listDoc.title': { $regex: term, $options: 'i' } },
          ]
        }
      });
    }

    if (status) {
      pipeline.push({ $match: { status } });
    }

    if (dueFrom || dueTo) {
      const match = {};
      if (dueFrom) match.$gte = new Date(dueFrom);
      if (dueTo) {
        const toDate = new Date(dueTo);
        if (toDate.toString() !== 'Invalid Date') {
          toDate.setHours(23, 59, 59, 999);
        }
        match.$lte = toDate;
      }
      pipeline.push({ $match: { dueDate: match } });
    }

    pipeline.push({
      $project: {
        title: 1,
        description: 1,
        labels: 1,
        dueDate: 1,
        status: 1,
        list: 1,
        board: 1,
        comments: 1,
        activity: 1,
        boardTitle: '$boardDoc.title',
        listTitle: '$listDoc.title'
      }
    });

    pipeline.push({ $limit: 500 });

    const results = await Card.aggregate(pipeline);
    return res.json(results);
  } catch (err) {
    console.error('searchCards error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
