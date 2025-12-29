require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Article = require('./models/Article');
const { scrapeOldestArticles } = require('./services/scraper');

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting to scrape articles...');
    const scrapedArticles = await scrapeOldestArticles();
    
    if (scrapedArticles.length === 0) {
      console.log('No articles found to scrape.');
      await mongoose.connection.close();
      process.exit(0);
    }
    
    console.log(`Found ${scrapedArticles.length} articles. Checking for duplicates...`);
    
    const existingUrls = await Article.find({}, { articleUrl: 1 }).lean();
    const existingUrlSet = new Set(existingUrls.map(article => article.articleUrl));
    
    const newArticles = scrapedArticles.filter(article => !existingUrlSet.has(article.articleUrl));
    
    if (newArticles.length === 0) {
      console.log('All articles already exist in database. No new articles to add.');
      await mongoose.connection.close();
      process.exit(0);
    }
    
    console.log(`Adding ${newArticles.length} new article(s) to database...`);
    
    for (const articleData of newArticles) {
      try {
        const article = new Article(articleData);
        await article.save();
        console.log(`Added: ${articleData.title}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`Skipped duplicate: ${articleData.title}`);
        } else {
          console.error(`Error saving ${articleData.title}:`, error.message);
        }
      }
    }
    
    console.log('Database seeding completed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();

