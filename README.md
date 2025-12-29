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
SERPAPI_KEY=your_serpapi_key_here
GEMINI_API_KEY=your_gemini_key_here
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `SERPAPI_KEY` - SerpAPI key for Google searches
- `GEMINI_API_KEY` - Google Gemini API key for article rewriting

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

## Scripts

### Seed Database
```bash
node seed.js
```
Scrapes articles from BeyondChats and populates the database, skipping duplicates.

### Rewrite Articles (Combined Script)
```bash
node rewriteArticles.js
```
Complete pipeline that:
1. Fetches articles from MongoDB
2. Searches Google using SerpAPI for each article title
3. Scrapes competitor articles (first 2 valid blog/article pages, excluding BeyondChats)
4. Extracts clean markdown content from competitors
5. Rewrites original article using Gemini LLM to match competitor styles
6. Publishes rewritten article to database with references

Handles rate limits and failures gracefully. Sequential execution with clear console output.

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
├── seed.js                  # Database seeding script
├── searchArticles.js        # Google search script
├── package.json
└── .env                     # Environment variables
```

