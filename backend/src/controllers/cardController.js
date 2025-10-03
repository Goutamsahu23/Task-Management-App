const Card = require('../models/Card');
const List = require('../models/List');
const Board = require('../models/Board');

exports.createCard = async (req, res) => {
  const { title, description, listId, dueDate, labels } = req.body;
  if (!title || !listId) return res.status(400).json({ message: 'Missing fields' });

  const list = await List.findById(listId);
  if (!list) return res.status(404).json({ message: 'List not found' });

  const board = await Board.findById(list.board);
  const member = board.members.find(m => m.user.toString() === req.user._id.toString());
  if (!member && board.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });

  const position = list.cards.length;
  const card = await Card.create({
    title,
    description,
    list: listId,
    board: list.board,
    position,
    dueDate: dueDate || null,
    labels: labels || []
  });

  list.cards.push(card._id);
  await list.save();

  card.activity.push({ text: `Card created: ${card.title}`, by: req.user._id });
  await card.save();

  return res.status(201).json(card);
};

exports.updateCard = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const card = await Card.findById(id);
  if (!card) return res.status(404).json({ message: 'Card not found' });

  const board = await Board.findById(card.board);
  const member = board.members.find(m => m.user.toString() === req.user._id.toString());
  if (!member && board.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });

  Object.assign(card, updates);
  card.activity.push({ text: `Card updated`, by: req.user._id });
  await card.save();
  return res.json(card);
};

exports.moveCard = async (req, res) => {
  const { cardId, toListId, position } = req.body;
  const card = await Card.findById(cardId);
  if (!card) return res.status(404).json({ message: 'Card not found' });

  const fromList = await List.findById(card.list);
  const toList = await List.findById(toListId);
  if (!toList) return res.status(404).json({ message: 'Destination list not found' });

  const board = await Board.findById(card.board);
  const member = board.members.find(m => m.user.toString() === req.user._id.toString());
  if (!member && board.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });

  fromList.cards = fromList.cards.filter(c => c.toString() !== card._id.toString());
  await fromList.save();

  toList.cards.splice(position >= 0 ? position : toList.cards.length, 0, card._id);
  await toList.save();

  card.list = toListId;
  card.position = position;
  card.activity.push({ text: `Moved to list ${toList.title}`, by: req.user._id });
  await card.save();

  return res.json(card);
};

exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const list = await List.findById(card.list);
    const board = await Board.findById(card.board);
    if (!list || !board) return res.status(404).json({ message: 'List or Board not found' });

    const member = board.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member && board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await List.findByIdAndUpdate(list._id, { $pull: { cards: card._id } });

    await Card.findByIdAndDelete(card._id);

    return res.json({ message: 'Card deleted' });
  } catch (err) {
    console.error('deleteCard error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.addComment = async (req, res) => {
  const { id } = req.params; // card id
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Comment text required' });

  const card = await Card.findById(id);
  if (!card) return res.status(404).json({ message: 'Card not found' });

  card.comments.push({ author: req.user._id, text });
  card.activity.push({ text: `Comment added`, by: req.user._id });
  await card.save();
  return res.json(card);
};
