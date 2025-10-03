const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const boardCtrl = require('../controllers/boardController');

router.post('/', protect, boardCtrl.createBoard);
router.get('/', protect, boardCtrl.getBoardsForUser);
router.get('/:id', protect, boardCtrl.getBoardById);
router.put('/:id', protect, boardCtrl.renameBoard);
router.delete('/:id', protect, boardCtrl.deleteBoard);

router.post('/:id/invite', protect, boardCtrl.inviteMember);
router.post('/:id/change-role', protect, boardCtrl.changeMemberRole);

module.exports = router;
