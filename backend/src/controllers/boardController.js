const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card'); 

exports.createBoard = async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: 'Title required' });

  const board = await Board.create({
    title,
    description,
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'Admin' }]
  });
  return res.status(201).json(board);
};

exports.getBoardsForUser = async (req, res) => {
  const userId = req.user._id;
  const boards = await Board.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ]
  }).populate('owner', 'name email').lean();
  return res.json(boards);
};

exports.getBoardById = async (req, res) => {
  const { id } = req.params;
  const board = await Board.findById(id)
    .populate('members.user', 'name email')
    .populate({ path: 'lists', populate: { path: 'cards' } });
  if (!board) return res.status(404).json({ message: 'Board not found' });
  return res.json(board);
};

exports.renameBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body; 

    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isMember = board.members.find(m => m.user.toString() === req.user._id.toString());
    const isAdmin = board.owner.toString() === req.user._id.toString() || (isMember && isMember.role === 'Admin');
    if (!isAdmin) return res.status(403).json({ message: 'Forbidden' });

    if (typeof title !== 'undefined') board.title = title;
    if (typeof description !== 'undefined') board.description = description;

    await board.save();
    const populated = await Board.findById(board._id)
      .populate('members.user', 'name email')
      .populate({ path: 'lists', populate: { path: 'cards' } });

    return res.json(populated);
  } catch (err) {
    console.error('renameBoard error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};




exports.deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can delete' });
    }

    await Card.deleteMany({ board: board._id });

    await List.deleteMany({ board: board._id });

    await Board.findByIdAndDelete(board._id);

    return res.json({ message: 'Board deleted' });
  } catch (err) {
    console.error('deleteBoard error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.inviteMember = async (req, res) => {
  const { id } = req.params; // board id
  const { userId, role } = req.body; // userId to invite
  const board = await Board.findById(id);
  if (!board) return res.status(404).json({ message: 'Board not found' });

  const isMember = board.members.find(m => m.user.toString() === req.user._id.toString());
  const isAdmin = board.owner.toString() === req.user._id.toString() || (isMember && isMember.role === 'Admin');
  if (!isAdmin) return res.status(403).json({ message: 'Forbidden' });

  if (board.members.find(m => m.user.toString() === userId)) {
    return res.status(400).json({ message: 'User already member' });
  }

  board.members.push({ user: userId, role: role || 'Editor' });
  await board.save();
  return res.json(board);
};

exports.changeMemberRole = async (req, res) => {
  const { id } = req.params; // board id
  const { userId, role } = req.body;
  const board = await Board.findById(id);
  if (!board) return res.status(404).json({ message: 'Board not found' });

  const isMember = board.members.find(m => m.user.toString() === req.user._id.toString());
  const isAdmin = board.owner.toString() === req.user._id.toString() || (isMember && isMember.role === 'Admin');
  if (!isAdmin) return res.status(403).json({ message: 'Forbidden' });

  const mem = board.members.find(m => m.user.toString() === userId);
  if (!mem) return res.status(404).json({ message: 'Member not found' });
  mem.role = role;
  await board.save();
  return res.json(board);
};
