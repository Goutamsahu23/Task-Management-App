const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware'); // ensure this exists
const { createMulter, uploadAttachment, deleteAttachment } = require('../controllers/attachmentController');
const multer = require('multer');

const upload = createMulter(multer);

// single or multiple? We'll accept multiple files under field 'files'
router.post('/cards/:cardId/attachments', protect, upload.array('files', 6), uploadAttachment);
router.delete('/cards/:cardId/attachments/:attachmentId', protect, deleteAttachment);

module.exports = router;