const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { scrapeOldestArticles } = require('../services/scraper');

router.post('/scrape', async (req, res) => {
  try {
    const articles = await scrapeOldestArticles();
    const savedArticles = [];
    
    for (const articleData of articles) {
      const existingArticle = await Article.findOne({ articleUrl: articleData.articleUrl });
      
      if (existingArticle) {
        existingArticle.title = articleData.title;
        existingArticle.author = articleData.author;
        existingArticle.publishedDate = articleData.publishedDate;
        existingArticle.htmlContent = articleData.htmlContent;
        await existingArticle.save();
        savedArticles.push(existingArticle);
      } else {
        const newArticle = new Article(articleData);
        await newArticle.save();
        savedArticles.push(newArticle);
      }
    }
    
    res.status(201).json({
      success: true,
      count: savedArticles.length,
      data: savedArticles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json({
      success: true,
      data: article
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: 'Article with this URL already exists'
      });
    } else {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const sortBy = req.query.sortBy || 'publishedDate';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    const articles = await Article.find()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
    
    const total = await Article.countDocuments();
    
    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

router.put('/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    } else if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: 'Article with this URL already exists'
      });
    } else {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

module.exports = router;

