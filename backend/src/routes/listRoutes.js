const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const listCtrl = require('../controllers/listController');

router.post('/', protect, listCtrl.createList);
router.put('/:id', protect, listCtrl.renameList);
router.delete('/:id', protect, listCtrl.deleteList);
router.post('/reorder', protect, listCtrl.reorderLists);


module.exports = router;
