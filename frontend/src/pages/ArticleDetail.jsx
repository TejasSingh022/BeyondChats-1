import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articleAPI } from '../utils/api';

function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [rewritten, setRewritten] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('original');

  useEffect(() => {
    fetchArticle();
    fetchRewritten();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articleAPI.getArticle(id);
      if (response.success) {
        setArticle(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRewritten = async () => {
    try {
      const response = await articleAPI.getRewrittenArticle(id);
      if (response.success) {
        setRewritten(response.data);
      }
    } catch (err) {
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading article...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12 text-gray-600">
        Article not found.
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/"
        className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
      >
        ← Back to Articles
      </Link>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{article.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
          {article.author && <span>By {article.author}</span>}
          <span>{formatDate(article.publishedDate)}</span>
          <a
            href={article.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            View Original
          </a>
        </div>

        {rewritten && (
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('original')}
                className={`py-2 px-4 font-medium ${
                  activeTab === 'original'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setActiveTab('rewritten')}
                className={`py-2 px-4 font-medium ${
                  activeTab === 'rewritten'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Rewritten
              </button>
            </div>
          </div>
        )}

        <div className="prose max-w-none">
          {activeTab === 'original' ? (
            <div
              dangerouslySetInnerHTML={{ __html: article.htmlContent }}
              className="article-content"
            />
          ) : rewritten ? (
            <div>
              <div
                className="markdown-content whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: rewritten.rewrittenContent
                    .replace(/\n/g, '<br>')
                    .replace(/## /g, '<h2 class="text-2xl font-bold mt-6 mb-4">')
                    .replace(/# /g, '<h1 class="text-3xl font-bold mt-8 mb-4">')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
                }}
              />
              {rewritten.references && rewritten.references.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-xl font-bold mb-4">References</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {rewritten.references.map((ref, index) => (
                      <li key={index}>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {ref.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ArticleDetail;

