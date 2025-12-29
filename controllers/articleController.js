const Article = require('../models/Article');
const RewrittenArticle = require('../models/RewrittenArticle');
const { scrapeOldestArticles } = require('../services/scraper');
const AppError = require('../utils/AppError');
const { sendSuccessResponse, sendPaginatedResponse } = require('../utils/responseHelper');

const scrapeArticles = async (req, res, next) => {
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
  
  sendSuccessResponse(res, 201, { articles: savedArticles, count: savedArticles.length });
};

const createArticle = async (req, res, next) => {
  const article = new Article(req.body);
  await article.save();
  sendSuccessResponse(res, 201, article);
};

const getArticles = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const sortBy = req.query.sortBy || 'publishedDate';
  const allowedSortFields = ['title', 'author', 'publishedDate', 'scrapedAt', 'createdAt'];
  if (!allowedSortFields.includes(sortBy)) {
    return next(new AppError('Invalid sort field', 400));
  }
  
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  
  const articles = await Article.find()
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
  
  const total = await Article.countDocuments();
  
  sendPaginatedResponse(res, articles, total, page, limit);
};

const getArticle = async (req, res, next) => {
  const article = await Article.findById(req.params.id);
  
  if (!article) {
    return next(new AppError('Article not found', 404));
  }
  
  sendSuccessResponse(res, 200, article);
};

const updateArticle = async (req, res, next) => {
  const article = await Article.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!article) {
    return next(new AppError('Article not found', 404));
  }
  
  sendSuccessResponse(res, 200, article);
};

const deleteArticle = async (req, res, next) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  
  if (!article) {
    return next(new AppError('Article not found', 404));
  }
  
  sendSuccessResponse(res, 200, {});
};

const createRewrittenArticle = async (req, res, next) => {
  const originalArticle = await Article.findById(req.params.id);
  
  if (!originalArticle) {
    return next(new AppError('Original article not found', 404));
  }
  
  const existingRewritten = await RewrittenArticle.findOne({ 
    originalArticleId: req.params.id 
  });
  
  if (existingRewritten) {
    existingRewritten.rewrittenContent = req.body.rewrittenContent;
    existingRewritten.references = req.body.references;
    existingRewritten.generatedAt = new Date();
    await existingRewritten.save();
    
    return sendSuccessResponse(res, 200, existingRewritten, 'Rewritten article updated');
  }
  
  const rewrittenArticle = new RewrittenArticle({
    originalArticleId: req.params.id,
    rewrittenContent: req.body.rewrittenContent,
    references: req.body.references,
    generatedAt: new Date()
  });
  
  await rewrittenArticle.save();
  
  sendSuccessResponse(res, 201, rewrittenArticle);
};

const getRewrittenArticle = async (req, res, next) => {
  const rewrittenArticle = await RewrittenArticle.findOne({ 
    originalArticleId: req.params.id 
  }).populate('originalArticleId');
  
  if (!rewrittenArticle) {
    return next(new AppError('Rewritten article not found', 404));
  }
  
  sendSuccessResponse(res, 200, rewrittenArticle);
};

module.exports = {
  scrapeArticles,
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  createRewrittenArticle,
  getRewrittenArticle
};
