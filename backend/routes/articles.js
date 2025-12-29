const express = require('express');
const router = express.Router();
const {
  scrapeArticles,
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  createRewrittenArticle,
  getRewrittenArticle
} = require('../controllers/articleController');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  validateMongoId,
  validatePagination,
  validateArticle,
  validateRewrittenArticle
} = require('../middleware/validator');

router.post('/scrape', asyncHandler(scrapeArticles));
router.post('/', validateArticle, asyncHandler(createArticle));
router.get('/', validatePagination, asyncHandler(getArticles));
router.get('/:id', validateMongoId, asyncHandler(getArticle));
router.put('/:id', validateMongoId, validateArticle, asyncHandler(updateArticle));
router.delete('/:id', validateMongoId, asyncHandler(deleteArticle));
router.post('/:id/rewritten', validateMongoId, validateRewrittenArticle, asyncHandler(createRewrittenArticle));
router.get('/:id/rewritten', validateMongoId, asyncHandler(getRewrittenArticle));

module.exports = router;

