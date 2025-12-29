# Complete File Structure and Contents

## Root Files

### server.js
Express server with error handling, timeout middleware, and graceful shutdown

### package.json
Dependencies: express, mongoose, axios, cheerio, dotenv, cors, turndown, @google/generative-ai

### rewriteArticles.js
Standalone script for article rewriting pipeline

### searchArticles.js
Legacy search script (can be removed if not needed)

## Config

### config/database.js
MongoDB connection with timeout and error handling

## Controllers

### controllers/articleController.js
All article business logic:
- scrapeArticles
- createArticle
- getArticles
- getArticle
- updateArticle
- deleteArticle
- createRewrittenArticle
- getRewrittenArticle

## Middleware

### middleware/errorHandler.js
- Global error handler
- asyncHandler wrapper for async functions
- Development/production error responses

### middleware/timeout.js
Request timeout middleware (30s default)

### middleware/validator.js
Input validation:
- validateMongoId
- validatePagination
- validateArticle
- validateRewrittenArticle

## Models

### models/Article.js
Article schema with indexes

### models/RewrittenArticle.js
RewrittenArticle schema with references

## Routes

### routes/articles.js
API routes with validation and error handling

## Services

### services/scraper.js
Web scraping with retry logic and timeouts

## Utils

### utils/AppError.js
Custom error class for operational errors

### utils/responseHelper.js
Consistent API response helpers:
- sendSuccessResponse
- sendErrorResponse
- sendPaginatedResponse

### utils/retry.js
Retry utility with exponential backoff

## Production Features

1. **Error Handling**: Global error handler with async wrapper
2. **Timeouts**: Request timeout middleware (30s)
3. **Retries**: Automatic retry for external API calls (3 attempts, exponential backoff)
4. **Validation**: Input validation for all endpoints
5. **Consistent Responses**: Standardized API response format
6. **Database**: Connection timeouts and error handling
7. **Graceful Shutdown**: SIGTERM and unhandled rejection handling

