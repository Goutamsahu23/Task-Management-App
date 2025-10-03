const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const listRoutes = require('./routes/listRoutes');
const cardRoutes = require('./routes/cardRoutes');
const searchRoutes = require('./routes/searchRoutes');
const path = require('path');
const attachmentRoutes = require('./routes/attachmentRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // body parser

app.get('/', (req, res) => res.send('Task Management API'));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', attachmentRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
