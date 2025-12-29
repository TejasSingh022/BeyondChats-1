require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const TurndownService = require('turndown');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const SERPAPI_KEY = process.env.SERPAPI_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let geminiClient = null;

if (GEMINI_API_KEY) {
  geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
}

const isBlogOrArticlePage = (html, url) => {
  if (!html) return false;
  
  const $ = cheerio.load(html);
  const bodyText = $('body').text().toLowerCase();
  
  const blogIndicators = [
    'article',
    'blog',
    'post',
    'entry',
    'content',
    'author',
    'published',
    'date'
  ];
  
  const indicatorCount = blogIndicators.filter(indicator => 
    bodyText.includes(indicator) || 
    $('article, .article, .blog-post, .post, .entry').length > 0
  ).length;
  
  const hasMainContent = $('article, .content, .post-content, .entry-content, main').length > 0;
  const hasTitle = $('h1, h2, .title, .entry-title').length > 0;
  
  return indicatorCount >= 2 && hasMainContent && hasTitle;
};

const isValidHtmlContent = (html) => {
  if (!html || html.length < 500) return false;
  
  try {
    const $ = cheerio.load(html);
    const body = $('body');
    return body.length > 0 && body.text().trim().length > 200;
  } catch (error) {
    return false;
  }
};

const searchWithSerpAPI = async (query) => {
  if (!SERPAPI_KEY) {
    throw new Error('SERPAPI_KEY not found in environment variables');
  }
  
  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        api_key: SERPAPI_KEY,
        q: query,
        engine: 'google',
        num: 10
      },
      timeout: 10000
    });
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    const results = response.data.organic_results || [];
    return results.map(result => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet
    }));
  } catch (error) {
    if (error.response && error.response.status === 429) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    throw error;
  }
};

const performGoogleSearch = async (query) => {
  if (!SERPAPI_KEY) {
    throw new Error('SERPAPI_KEY not found in environment variables');
  }
  
  return await searchWithSerpAPI(query);
};

const fetchHtmlContent = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      maxRedirects: 5
    });
    
    if (isValidHtmlContent(response.data)) {
      return response.data;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const isBeyondChatsUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('beyondchats.com');
  } catch (error) {
    return false;
  }
};

const convertHtmlToMarkdown = (html) => {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**'
  });
  
  let markdown = turndownService.turndown(html);
  
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/^\s+|\s+$/gm, '')
    .trim();
  
  return markdown;
};

const rewriteArticleWithLLM = async (originalContent, competitorArticles) => {
  if (!geminiClient) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }
  
  const competitor1 = competitorArticles[0];
  const competitor2 = competitorArticles[1];
  
  const prompt = `You are an expert content writer. Rewrite the following original article to match the structure, formatting, depth, and SEO style of the two competitor articles provided, while keeping the core topic and main message of the original article unchanged.

Original Article:
${originalContent}

Competitor Article 1:
${competitor1.markdownContent}

Competitor Article 2:
${competitor2.markdownContent}

Instructions:
1. Maintain the core topic and main message from the original article
2. Match the structure, formatting style, and depth of the competitor articles
3. Use similar SEO techniques, heading structure, and content organization
4. Keep the writing engaging and informative
5. Output the rewritten article in markdown format
6. Do not include any meta information, just the article content

Rewritten Article:`;

  try {
    const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rewrittenContent = response.text().trim();
    
    rewrittenContent += `\n\n## References\n\n`;
    rewrittenContent += `1. [${competitor1.title}](${competitor1.url})\n`;
    rewrittenContent += `2. [${competitor2.title}](${competitor2.url})`;
    
    return rewrittenContent;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      throw new Error('LLM_RATE_LIMIT_EXCEEDED');
    }
    throw error;
  }
};

const extractMainContent = (html) => {
  const $ = cheerio.load(html);
  
  const unwantedSelectors = [
    'nav',
    'header',
    'footer',
    'aside',
    '.nav',
    '.navbar',
    '.navigation',
    '.header',
    '.footer',
    '.sidebar',
    '.ad',
    '.ads',
    '.advertisement',
    '.advertising',
    '.ad-container',
    '.ad-wrapper',
    '[class*="ad-"]',
    '[id*="ad-"]',
    '[class*="advertisement"]',
    '[id*="advertisement"]',
    '.cookie',
    '.cookie-banner',
    '.cookie-consent',
    '.gdpr',
    '.privacy-banner',
    '[class*="cookie"]',
    '[id*="cookie"]',
    '.social-share',
    '.share-buttons',
    '.comments',
    '.comment-section',
    '.related-posts',
    '.related-articles',
    '.newsletter',
    '.subscribe',
    '.popup',
    '.modal',
    '.overlay',
    'script',
    'style',
    'noscript',
    'iframe[src*="ads"]',
    'iframe[src*="advertisement"]',
    '.menu',
    '.menu-item',
    '.breadcrumb',
    '.tags',
    '.tag-list',
    '.author-box',
    '.author-info',
    '.post-meta',
    '.entry-meta'
  ];
  
  unwantedSelectors.forEach(selector => {
    $(selector).remove();
  });
  
  const contentSelectors = [
    'article',
    'main article',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.content',
    '.post-body',
    '.article-body',
    '[role="main"]',
    'main',
    '.main-content',
    '.article-text',
    '.post-text'
  ];
  
  let mainContent = null;
  
  for (const selector of contentSelectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      const text = element.text().trim();
      if (text.length > 300) {
        mainContent = element;
        break;
      }
    }
  }
  
  if (!mainContent) {
    const body = $('body');
    const paragraphs = body.find('p');
    if (paragraphs.length > 3) {
      mainContent = $('<div>').append(paragraphs);
    } else {
      mainContent = body;
    }
  }
  
  mainContent.find('img').each((i, elem) => {
    const $img = $(elem);
    const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
    if (!src || src.includes('data:image')) {
      $img.remove();
    }
  });
  
  const cleanedHtml = mainContent.html() || '';
  
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**'
  });
  
  let markdown = turndownService.turndown(cleanedHtml);
  
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/^\s+|\s+$/gm, '')
    .trim();
  
  return markdown;
};

const processArticle = async (article, index, total) => {
  console.log(`\n[${index + 1}/${total}] Processing: ${article.title}`);
  
  try {
    await delay(1000);
    
    const searchQuery = article.title;
    const searchResults = await performGoogleSearch(searchQuery);
    
    const filteredResults = searchResults.filter(result => 
      !isBeyondChatsUrl(result.link)
    );
    
    if (filteredResults.length === 0) {
      console.log(`  No non-BeyondChats results found`);
      return null;
    }
    
    const validPages = [];
    
    for (const result of filteredResults.slice(0, 5)) {
      if (validPages.length >= 2) break;
      
      try {
        await delay(500);
        const htmlContent = await fetchHtmlContent(result.link);
        
        if (htmlContent && isBlogOrArticlePage(htmlContent, result.link)) {
          const markdownContent = extractMainContent(htmlContent);
          
          if (markdownContent && markdownContent.length > 200) {
            validPages.push({
              title: result.title,
              url: result.link,
              snippet: result.snippet,
              markdownContent: markdownContent
            });
            console.log(`  Found valid page: ${result.link}`);
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    if (validPages.length === 0) {
      console.log(`  No valid blog/article pages found`);
      return null;
    }
    
    if (validPages.length < 2) {
      console.log(`  Need at least 2 competitor articles for rewriting`);
      return null;
    }
    
    console.log(`  Rewriting article with LLM...`);
    
    const originalMarkdown = convertHtmlToMarkdown(article.htmlContent);
    const rewrittenContent = await rewriteArticleWithLLM(originalMarkdown, validPages.slice(0, 2));
    
    console.log(`  Article rewritten successfully`);
    
    const referencesMatch = rewrittenContent.match(/## References\n\n(.*?)$/s);
    let references = [];
    
    if (referencesMatch) {
      const refsText = referencesMatch[1];
      const refLines = refsText.split('\n').filter(line => line.trim());
      
      references = refLines.map(line => {
        const match = line.match(/^\d+\.\s*\[(.*?)\]\((.*?)\)/);
        if (match) {
          return {
            title: match[1],
            url: match[2]
          };
        }
        return null;
      }).filter(ref => ref !== null);
    }
    
    if (references.length === 0) {
      references = validPages.slice(0, 2).map(page => ({
        title: page.title,
        url: page.url
      }));
    }
    
    console.log(`  Publishing rewritten article to API...`);
    
    try {
      const publishResponse = await axios.post(
        `${API_BASE_URL}/api/articles/${article._id}/rewritten`,
        {
          rewrittenContent: rewrittenContent,
          references: references
        },
        {
          timeout: 10000
        }
      );
      
      if (publishResponse.data.success) {
        console.log(`  Rewritten article published successfully`);
      }
    } catch (error) {
      console.log(`  Error publishing rewritten article: ${error.message}`);
    }
    
    return {
      articleTitle: article.title,
      articleId: article._id,
      relatedPages: validPages.slice(0, 2),
      rewrittenContent: rewrittenContent
    };
    
  } catch (error) {
    if (error.message === 'RATE_LIMIT_EXCEEDED' || error.message === 'LLM_RATE_LIMIT_EXCEEDED') {
      console.log(`  Rate limit exceeded. Waiting 60 seconds...`);
      await delay(60000);
      return await processArticle(article, index, total);
    }
    
    console.log(`  Error: ${error.message}`);
    return null;
  }
};

const fetchArticlesFromAPI = async () => {
  try {
    let allArticles = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await axios.get(`${API_BASE_URL}/api/articles`, {
        params: {
          page: page,
          limit: 100
        },
        timeout: 10000
      });
      
      if (response.data.success && response.data.data) {
        allArticles.push(...response.data.data);
        
        if (page >= response.data.pages) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }
    
    return allArticles;
  } catch (error) {
    console.error(`Error fetching articles from API: ${error.message}`);
    throw error;
  }
};

const main = async () => {
  try {
    console.log('Fetching articles from API...');
    const articles = await fetchArticlesFromAPI();
    
    if (articles.length === 0) {
      console.log('No articles found in database.');
      process.exit(0);
    }
    
    console.log(`Found ${articles.length} article(s). Starting search...\n`);
    
    const results = [];
    
    for (let i = 0; i < articles.length; i++) {
      const result = await processArticle(articles[i], i, articles.length);
      if (result) {
        results.push(result);
      }
      
      if (i < articles.length - 1) {
        await delay(2000);
      }
    }
    
    console.log(`\n\n=== Results Summary ===`);
    console.log(`Total articles processed: ${articles.length}`);
    console.log(`Articles rewritten: ${results.length}`);
    
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.articleTitle}`);
      console.log(`   Competitor URLs:`);
      result.relatedPages.forEach((page, pageIndex) => {
        console.log(`   ${pageIndex + 1}. ${page.url}`);
      });
      if (result.rewrittenContent) {
        console.log(`   Rewritten content generated (${result.rewrittenContent.length} chars)`);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
};

main();

