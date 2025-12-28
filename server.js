require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const articleRoutes = require('./routes/articles');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/articles', articleRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'BeyondChats API',
    endpoints: {
      scrape: 'POST /api/articles/scrape',
      create: 'POST /api/articles',
      list: 'GET /api/articles',
      get: 'GET /api/articles/:id',
      update: 'PUT /api/articles/:id',
      delete: 'DELETE /api/articles/:id'
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

