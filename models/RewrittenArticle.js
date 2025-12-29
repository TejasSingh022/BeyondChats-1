const mongoose = require('mongoose');

const rewrittenArticleSchema = new mongoose.Schema({
  originalArticleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    index: true
  },
  rewrittenContent: {
    type: String,
    required: true
  },
  references: [{
    title: String,
    url: String
  }],
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

rewrittenArticleSchema.index({ originalArticleId: 1 });

module.exports = mongoose.model('RewrittenArticle', rewrittenArticleSchema);

