import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Newspaper, TrendingUp, AlertCircle, Clock, ExternalLink } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  symbol: string;
  companyName: string;
  source: string;
  sentiment?: string;
  publishedAt: string;
  url: string;
  summary: string;
  thumbnail?: string;
}

export const News: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      const res = await api.get('/news');
      if (res.data.success) {
        setArticles(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center space-x-2">
          <Newspaper className="w-6 h-6 text-primary" />
          <span>Market News</span>
        </h2>
        <p className="text-sm text-mutedText mt-1">Real-time market insights and financial intelligence coverage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4 border border-white/5 hover:border-primary/20 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-primary font-bold">{article.source}</span>
                {article.sentiment && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-mutedText border border-white/10">
                    {article.sentiment}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {article.thumbnail && (
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full sm:w-24 h-24 object-cover rounded-xl bg-white/5 border border-white/5 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="space-y-2 flex-1">
                  <h3 className="font-extrabold text-white text-base leading-snug hover:text-primary transition">
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      {article.title}
                    </a>
                  </h3>
                  <p className="text-xs text-mutedText leading-relaxed line-clamp-3">{article.summary}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/5 pt-3">
              <div className="flex items-center space-x-2 text-[10px] text-mutedText">
                <span className="font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">
                  {article.symbol}
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </span>
              </div>
              
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 rounded-xl bg-primary text-black text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-primary/10"
              >
                <span>Open Original Article</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

