const List = require('../models/List');
const Board = require('../models/Board');

const Card = require('../models/Card'); 

exports.createList = async (req, res) => {
  const { boardId, title } = req.body;
  if (!title || !boardId) return res.status(400).json({ message: 'Missing fields' });

  const board = await Board.findById(boardId);
  if (!board) return res.status(404).json({ message: 'Board not found' });

  const member = board.members.find(m => m.user.toString() === req.user._id.toString());
  if (!member && board.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });

  const position = board.lists.length;
  const list = await List.create({ title, board: boardId, position });

  board.lists.push(list._id);
  await board.save();
  return res.status(201).json(list);
};

exports.renameList = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const list = await List.findById(id);
  if (!list) return res.status(404).json({ message: 'List not found' });

  const board = await Board.findById(list.board);
  const member = board.members.find(m => m.user.toString() === req.user._id.toString());
  if (!member && board.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });

  list.title = title || list.title;
  await list.save();
  return res.json(list);
};


exports.deleteList = async (req, res) => {
  try {
    const { id } = req.params; // list id
    const list = await List.findById(id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    const board = await Board.findById(list.board);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const member = board.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member && board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Card.deleteMany({ list: list._id });

    await Board.findByIdAndUpdate(board._id, { $pull: { lists: list._id } });

    await List.findByIdAndDelete(list._id);

    return res.json({ message: 'List deleted' });
  } catch (err) {
    console.error('deleteList error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.reorderLists = async (req, res) => {
  try {
    const { boardId, order } = req.body;
    if (!boardId || !Array.isArray(order)) {
      return res.status(400).json({ message: 'boardId and order array are required' });
    }

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const userId = req.user && req.user._id;
    const isOwner = board.owner && board.owner.toString() === String(userId);
    const isMember = board.members && board.members.some(m => String(m.user) === String(userId));
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const providedIds = order.map(o => String(o.listId));
    const currentIds = (board.lists || []).map(id => String(id));

    const validProvided = providedIds.filter(id => currentIds.includes(id));

    const newOrderIds = [...validProvided];

    currentIds.forEach(id => {
      if (!newOrderIds.includes(id)) newOrderIds.push(id);
    });

    board.lists = newOrderIds.map(id => mongoose.Types.ObjectId(id));
    await board.save();


    const populated = await Board.findById(board._id)
      .populate('members.user', 'name email')
      .populate({ path: 'lists', options: { sort: {  } }, populate: { path: 'cards' } });

    return res.json(populated);
  } catch (err) {
    console.error('reorderLists error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
