# BeyondChats Backend

Node.js backend API for scraping, managing, and rewriting blog articles.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/beyondchats
NODE_ENV=development
SERPAPI_KEY=your_serpapi_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Scripts

### Rewrite Articles
```bash
node rewriteArticles.js
```

Complete pipeline that fetches articles, searches for competitors, scrapes content, rewrites using Gemini LLM, and stores rewritten articles.

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── articleController.js # Business logic
├── middleware/
│   ├── errorHandler.js      # Error handling
│   ├── timeout.js           # Request timeout
│   └── validator.js         # Input validation
├── models/
│   ├── Article.js           # Article schema
│   └── RewrittenArticle.js # RewrittenArticle schema
├── routes/
│   └── articles.js          # API routes
├── services/
│   └── scraper.js           # Web scraping service
├── utils/
│   ├── AppError.js          # Custom error class
│   ├── responseHelper.js   # Response helpers
│   └── retry.js            # Retry utility
├── rewriteArticles.js       # Article rewriting script
└── server.js               # Express server
```

