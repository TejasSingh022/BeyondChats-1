# BeyondChats Backend API

Node.js backend with Express and MongoDB for scraping and managing BeyondChats blog articles.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/beyondchats
NODE_ENV=development
```

3. Make sure MongoDB is running on your system.

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

All endpoints are prefixed with `/api/articles`

### Scrape Articles
- **POST** `/api/articles/scrape` - Scrapes the BeyondChats blogs page, finds the last pagination page, extracts the 5 oldest articles, and stores them in MongoDB.

### Create Article
- **POST** `/api/articles` - Create a new article
  ```json
  {
    "title": "Article Title",
    "author": "Author Name",
    "publishedDate": "2024-01-01",
    "articleUrl": "https://example.com/article",
    "htmlContent": "<html>...</html>"
  }
  ```

### List Articles
- **GET** `/api/articles` - Get all articles with pagination
  - Query parameters:
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 10)
    - `sortBy` - Field to sort by (default: publishedDate)
    - `sortOrder` - Sort order: `asc` or `desc` (default: desc)

### Get Single Article
- **GET** `/api/articles/:id` - Get article by ID

### Update Article
- **PUT** `/api/articles/:id` - Update article by ID

### Delete Article
- **DELETE** `/api/articles/:id` - Delete article by ID

## Project Structure

```
BeyondChats-1/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   └── Article.js           # Article schema
├── routes/
│   └── articles.js          # Article routes
├── services/
│   └── scraper.js           # Web scraping logic
├── server.js                # Express server
├── package.json
└── .env                     # Environment variables
```

