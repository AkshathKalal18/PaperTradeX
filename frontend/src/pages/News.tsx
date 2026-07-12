import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Newspaper, TrendingUp, AlertCircle, Clock } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  symbol: string;
  companyName: string;
  source: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  publishedAt: string;
  url: string;
  summary: string;
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

  const getSentimentStyle = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'bg-success/15 text-success border border-success/20';
      case 'NEGATIVE':
        return 'bg-danger/15 text-danger border border-danger/20';
      default:
        return 'bg-white/5 text-mutedText border border-white/10';
    }
  };

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
          <div key={article.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-primary font-bold">{article.source}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSentimentStyle(article.sentiment)}`}>
                  {article.sentiment}
                </span>
              </div>
              <h3 className="font-extrabold text-white text-base leading-snug hover:text-primary transition">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              </h3>
              <p className="text-xs text-mutedText leading-relaxed">{article.summary}</p>
            </div>

            <div className="flex justify-between items-center text-[10px] text-mutedText border-t border-white/5 pt-3">
              <span className="font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {article.symbol}
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(article.publishedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
