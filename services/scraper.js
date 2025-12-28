const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://beyondchats.com/blogs/';

const getLastPageNumber = async () => {
  try {
    const response = await axios.get(BASE_URL);
    const $ = cheerio.load(response.data);
    
    let maxPage = 1;
    
    const paginationSelectors = [
      '.pagination a',
      '.page-numbers a',
      '.pagination .page-numbers a',
      'a[href*="/page/"]',
      '.pagination li a',
      '.wp-pagenavi a',
      'nav a[href*="page"]'
    ];
    
    paginationSelectors.forEach(selector => {
      $(selector).each((i, elem) => {
        const href = $(elem).attr('href');
        const text = $(elem).text().trim();
        
        if (href) {
          const pageMatch = href.match(/\/page[\/\-]?(\d+)/i);
          if (pageMatch) {
            const pageNum = parseInt(pageMatch[1]);
            if (pageNum > maxPage) maxPage = pageNum;
          }
        }
        
        const textNum = parseInt(text);
        if (!isNaN(textNum) && textNum > maxPage) {
          maxPage = textNum;
        }
      });
    });
    
    if (maxPage === 1) {
      let currentPage = 2;
      let foundLast = false;
      
      while (currentPage <= 100 && !foundLast) {
        try {
          const testUrl = `${BASE_URL}page/${currentPage}/`;
          const testResponse = await axios.get(testUrl, { timeout: 5000 });
          const test$ = cheerio.load(testResponse.data);
          const hasContent = test$('article, .post, .blog-post, [class*="article"]').length > 0;
          
          if (hasContent) {
            maxPage = currentPage;
            currentPage++;
          } else {
            foundLast = true;
          }
        } catch (error) {
          foundLast = true;
        }
      }
    }
    
    return maxPage;
  } catch (error) {
    console.error('Error finding last page:', error.message);
    return 1;
  }
};

const extractArticlesFromPage = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    const articles = [];
    const articleSelectors = [
      'article',
      '.post',
      '.blog-post',
      '.entry',
      '[class*="article"]',
      '[class*="blog-item"]',
      '[class*="post-item"]',
      '.blog-entry'
    ];
    
    articleSelectors.forEach(selector => {
      $(selector).each((i, elem) => {
        const $elem = $(elem);
        
        const titleSelectors = ['h1 a', 'h2 a', 'h3 a', 'h1', 'h2', 'h3', '.title a', '.entry-title a', '[class*="title"] a'];
        let title = '';
        let articleUrl = '';
        
        for (const titleSel of titleSelectors) {
          const titleElem = $elem.find(titleSel).first();
          if (titleElem.length) {
            title = titleElem.text().trim();
            if (titleSel.includes(' a')) {
              articleUrl = titleElem.attr('href');
            } else {
              const link = titleElem.find('a').first();
              if (link.length) articleUrl = link.attr('href');
            }
            if (title && articleUrl) break;
          }
        }
        
        if (!title || !articleUrl) {
          const mainLink = $elem.find('a').first();
          if (mainLink.length && !articleUrl) {
            articleUrl = mainLink.attr('href');
            title = mainLink.text().trim() || title;
          }
        }
        
        if (!title || !articleUrl) return;
        
        if (!articleUrl.startsWith('http')) {
          articleUrl = new URL(articleUrl, BASE_URL).href;
        }
        
        const authorSelectors = ['.author', '[class*="author"]', '.by-author', '.post-author', '.entry-author', 'a[rel="author"]'];
        let author = null;
        for (const authorSel of authorSelectors) {
          const authorElem = $elem.find(authorSel).first();
          if (authorElem.length) {
            author = authorElem.text().trim();
            if (author) break;
          }
        }
        
        const dateSelectors = ['.date', '.published-date', '[class*="date"]', 'time', '.entry-date', '.post-date'];
        let publishedDate = null;
        for (const dateSel of dateSelectors) {
          const dateElem = $elem.find(dateSel).first();
          if (dateElem.length) {
            const dateText = dateElem.attr('datetime') || dateElem.attr('title') || dateElem.text().trim();
            publishedDate = new Date(dateText);
            if (!isNaN(publishedDate.getTime())) break;
            publishedDate = null;
          }
        }
        
        if (!publishedDate) {
          publishedDate = new Date();
        }
        
        articles.push({
          title,
          author: author || null,
          publishedDate,
          articleUrl
        });
      });
    });
    
    return articles;
  } catch (error) {
    console.error(`Error scraping page ${url}:`, error.message);
    return [];
  }
};

const getArticleContent = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching article content from ${url}:`, error.message);
    return null;
  }
};

const scrapeOldestArticles = async () => {
  try {
    const lastPage = await getLastPageNumber();
    console.log(`Found last page: ${lastPage}`);
    
    let allArticles = [];
    
    const lastPageUrl = lastPage === 1 ? BASE_URL : `${BASE_URL}page/${lastPage}/`;
    const lastPageArticles = await extractArticlesFromPage(lastPageUrl);
    allArticles.push(...lastPageArticles);
    
    if (allArticles.length === 0) {
      const firstPageArticles = await extractArticlesFromPage(BASE_URL);
      allArticles.push(...firstPageArticles);
    }
    
    for (let i = lastPage - 1; i >= 1 && allArticles.length < 10; i--) {
      const pageUrl = `${BASE_URL}page/${i}/`;
      const pageArticles = await extractArticlesFromPage(pageUrl);
      allArticles.push(...pageArticles);
    }
    
    const uniqueArticles = [];
    const seenUrls = new Set();
    
    for (const article of allArticles) {
      if (!seenUrls.has(article.articleUrl)) {
        seenUrls.add(article.articleUrl);
        uniqueArticles.push(article);
      }
    }
    
    uniqueArticles.sort((a, b) => {
      const dateA = new Date(a.publishedDate).getTime();
      const dateB = new Date(b.publishedDate).getTime();
      return dateA - dateB;
    });
    
    const oldestFive = uniqueArticles.slice(0, 5);
    
    const articlesWithContent = [];
    for (const article of oldestFive) {
      const htmlContent = await getArticleContent(article.articleUrl);
      if (htmlContent) {
        articlesWithContent.push({
          ...article,
          htmlContent
        });
      }
    }
    
    return articlesWithContent;
  } catch (error) {
    console.error('Error scraping oldest articles:', error.message);
    throw error;
  }
};

module.exports = {
  scrapeOldestArticles,
  getLastPageNumber,
  extractArticlesFromPage,
  getArticleContent
};

