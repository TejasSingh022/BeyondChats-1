const AppError = require('../utils/AppError');

const validateMongoId = (req, res, next) => {
  const { id } = req.params;
  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError('Invalid ID format', 400));
  }
  next();
};

const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  if (page && (isNaN(page) || page < 1)) {
    return next(new AppError('Page must be a positive integer', 400));
  }

  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    return next(new AppError('Limit must be between 1 and 100', 400));
  }

  next();
};

const validateArticle = (req, res, next) => {
  const { title, articleUrl, htmlContent, publishedDate } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(new AppError('Title is required and must be a non-empty string', 400));
  }

  if (!articleUrl || typeof articleUrl !== 'string' || articleUrl.trim().length === 0) {
    return next(new AppError('Article URL is required and must be a valid URL', 400));
  }

  try {
    new URL(articleUrl);
  } catch (error) {
    return next(new AppError('Article URL must be a valid URL', 400));
  }

  if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.trim().length === 0) {
    return next(new AppError('HTML content is required and must be a non-empty string', 400));
  }

  if (publishedDate) {
    const date = new Date(publishedDate);
    if (isNaN(date.getTime())) {
      return next(new AppError('Published date must be a valid date', 400));
    }
  }

  next();
};

const validateRewrittenArticle = (req, res, next) => {
  const { rewrittenContent, references } = req.body;

  if (!rewrittenContent || typeof rewrittenContent !== 'string' || rewrittenContent.trim().length === 0) {
    return next(new AppError('Rewritten content is required and must be a non-empty string', 400));
  }

  if (references) {
    if (!Array.isArray(references)) {
      return next(new AppError('References must be an array', 400));
    }

    for (const ref of references) {
      if (!ref.title || !ref.url) {
        return next(new AppError('Each reference must have a title and url', 400));
      }
      try {
        new URL(ref.url);
      } catch (error) {
        return next(new AppError(`Invalid URL in references: ${ref.url}`, 400));
      }
    }
  }

  next();
};

module.exports = {
  validateMongoId,
  validatePagination,
  validateArticle,
  validateRewrittenArticle
};

