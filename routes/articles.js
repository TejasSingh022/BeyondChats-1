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

router.post('/scrape', scrapeArticles);
router.post('/', createArticle);
router.get('/', getArticles);
router.get('/:id', getArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);
router.post('/:id/rewritten', createRewrittenArticle);
router.get('/:id/rewritten', getRewrittenArticle);

module.exports = router;

