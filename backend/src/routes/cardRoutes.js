const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const cardCtrl = require('../controllers/cardController');

router.post('/', protect, cardCtrl.createCard);
router.put('/:id', protect, cardCtrl.updateCard);
router.post('/move', protect, cardCtrl.moveCard);
router.delete('/:id', protect, cardCtrl.deleteCard);

router.post('/:id/comments', protect, cardCtrl.addComment);

module.exports = router;
