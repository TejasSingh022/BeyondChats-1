const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    default: null,
    trim: true
  },
  publishedDate: {
    type: Date,
    required: true
  },
  articleUrl: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

articleSchema.index({ articleUrl: 1 });
articleSchema.index({ publishedDate: 1 });

module.exports = mongoose.model('Article', articleSchema);

