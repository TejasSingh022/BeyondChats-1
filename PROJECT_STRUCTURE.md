# Project Structure

```
BeyondChats-1/
├── config/
│   └── database.js                    # MongoDB connection configuration
├── controllers/
│   └── articleController.js          # Article business logic controllers
├── middleware/
│   ├── errorHandler.js                # Global error handling middleware
│   ├── timeout.js                     # Request timeout middleware
│   └── validator.js                   # Input validation middleware
├── models/
│   ├── Article.js                     # Article MongoDB schema
│   └── RewrittenArticle.js            # RewrittenArticle MongoDB schema
├── routes/
│   └── articles.js                    # Article API routes
├── services/
│   └── scraper.js                     # Web scraping service with retry logic
├── utils/
│   ├── AppError.js                    # Custom error class
│   ├── responseHelper.js              # Consistent API response helpers
│   └── retry.js                       # Retry utility for external API calls
├── rewriteArticles.js                 # Standalone article rewriting script
├── searchArticles.js                  # Legacy search script
├── server.js                          # Express server entry point
├── package.json                       # Dependencies and scripts
├── .env                               # Environment variables
├── .gitignore                         # Git ignore rules
└── README.md                          # Project documentation
```

## Key Features

### Production-Ready Features

1. **Error Handling**
   - Global error handler middleware
   - Custom AppError class for operational errors
   - Async error wrapper (asyncHandler)
   - Proper error responses in dev/prod modes

2. **Request Timeouts**
   - Configurable timeout middleware (30s default)
   - Prevents hanging requests

3. **Input Validation**
   - MongoDB ID validation
   - Pagination validation
   - Article data validation
   - Rewritten article validation

4. **Retry Logic**
   - Automatic retry for failed HTTP requests
   - Exponential backoff
   - Configurable retry attempts

5. **Consistent API Responses**
   - Standardized success/error response format
   - Pagination response helper
   - Consistent error messages

6. **Database**
   - Connection timeout configuration
   - Error handling and reconnection logic
   - Graceful shutdown handling

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10,
  "data": [...]
}
```

