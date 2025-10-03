const path = require('path');
const fs = require('fs');
const Card = require('../models/Card');
const mongoose = require('mongoose');


const createMulter = (multer) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const cardId = req.params.cardId;
      const uploadPath = path.join(__dirname, '../../uploads/cards', cardId);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      // prefix timestamp to avoid duplicates
      const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
      cb(null, safe);
    }
  });

  const fileFilter = (req, file, cb) => {
    
    cb(null, true);
  };

  return multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } }); // 20 MB limit
};

exports.createMulter = createMulter;


exports.uploadAttachment = async (req, res) => {
  try {
    const { cardId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cardId)) return res.status(400).json({ message: 'Invalid cardId' });

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    // multer put files in req.files (array) or req.file (single) depending on field name
    const files = req.files && req.files.length ? req.files : (req.file ? [req.file] : []);
    if (!files.length) return res.status(400).json({ message: 'No file uploaded' });

    const attachments = files.map(f => ({
      filename: f.filename,
      originalname: f.originalname,
      url: `/uploads/cards/${cardId}/${f.filename}`,
      mimetype: f.mimetype,
      size: f.size,
      uploadedBy: req.user && req.user._id
    }));

    // append to card.attachments
    card.attachments = card.attachments.concat(attachments);
    await card.save();

    // populate uploadedBy for returned attachments (if desired)
    await card.populate({ path: 'attachments.uploadedBy', select: 'name email' });

    return res.status(201).json({ attachments: card.attachments });
  } catch (err) {
    console.error('uploadAttachment error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.deleteAttachment = async (req, res) => {
  try {
    const { cardId, attachmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cardId)) return res.status(400).json({ message: 'Invalid cardId' });

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    // Try to find attachment by _id or filename
    let att = null;
    // 1) if attachments are mongoose subdocs with _id
    if (card.attachments && card.attachments.id && typeof card.attachments.id === 'function') {
      att = card.attachments.id(attachmentId);
    }
    // 2) otherwise, fallback to find by _id string or by filename
    if (!att && Array.isArray(card.attachments)) {
      att = card.attachments.find(a => {
        if (!a) return false;
        if (a._id && String(a._id) === String(attachmentId)) return true;
        if (a.filename && String(a.filename) === String(attachmentId)) return true;
        return false;
      });
    }

    if (!att) return res.status(404).json({ message: 'Attachment not found' });

    // Build disk path to file (att.url expected like '/uploads/cards/<cardId>/<filename>')
    const diskPath = att.url && att.url.startsWith('/')
      ? path.join(process.cwd(), att.url) // uses project root
      : path.join(__dirname, '../../', att.url || '');

    // Remove file if exists
    if (fs.existsSync(diskPath)) {
      try {
        fs.unlinkSync(diskPath);
      } catch (err) {
        console.warn('Failed to unlink file', diskPath, err);
      }
    } else {
      // try alternative path: uploads/cards/<cardId>/<filename>
      if (att.filename) {
        const alt = path.join(__dirname, '../../uploads/cards', cardId, att.filename);
        if (fs.existsSync(alt)) {
          try { fs.unlinkSync(alt); } catch (e) { /* ignore */ }
        }
      }
    }

    // Remove attachment from card.attachments array (works whether subdoc or plain object)
    card.attachments = (card.attachments || []).filter(a => {
      if (!a) return false;
      if (a._id && String(a._id) === String(attachmentId)) return false;
      if (a.filename && String(a.filename) === String(attachmentId)) return false;
      // else keep
      return true;
    });

    await card.save();

    return res.json({ message: 'Attachment deleted' });
  } catch (err) {
    console.error('deleteAttachment error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
