require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const articleRoutes = require('./routes/articles');
const { errorHandler } = require('./middleware/errorHandler');
const timeout = require('./middleware/timeout');

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(timeout(30000));

app.use('/api/articles', articleRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BeyondChats API',
    endpoints: {
      scrape: 'POST /api/articles/scrape',
      create: 'POST /api/articles',
      list: 'GET /api/articles',
      get: 'GET /api/articles/:id',
      update: 'PUT /api/articles/:id',
      delete: 'DELETE /api/articles/:id',
      createRewritten: 'POST /api/articles/:id/rewritten',
      getRewritten: 'GET /api/articles/:id/rewritten'
    }
  });
});

app.all('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Can't find ${req.originalUrl} on this server!`
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});

