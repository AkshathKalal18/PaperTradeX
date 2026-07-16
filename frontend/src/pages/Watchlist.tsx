import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Star, Trash2, ArrowUpRight, ArrowDownRight, Eye, AlertCircle } from 'lucide-react';

interface WatchlistItem {
  id: number;
  symbol: string;
  companyName: string;
  lastPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  sector: string;
  exchange: string;
}

export const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const fetchWatchlist = async () => {
    try {
      const res = await api.get('/watchlist');
      if (res.data.success) {
        setWatchlist(res.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching watchlist:', err);
      setErrorMsg('Failed to load watchlist.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await api.delete(`/watchlist/${symbol}`);
      if (res.data.success) {
        setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
      }
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    }
  };

  useEffect(() => {
    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 10000); // refresh every 10s
    return () => clearInterval(interval);
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center space-x-2">
            <Star className="w-6 h-6 text-primary fill-primary" />
            <span>My Watchlist</span>
          </h2>
          <p className="text-sm text-mutedText mt-1">Monitor your favorite stocks and live market activities</p>
        </div>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-bold rounded-xl hover:bg-white/10 transition"
        >
          Discover Stocks
        </Link>
      </div>

      {errorMsg && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {watchlist.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-white/5 space-y-4">
          <Star className="w-12 h-12 text-mutedText mx-auto opacity-40" />
          <h3 className="font-extrabold text-white text-base">Your Watchlist is empty</h3>
          <p className="text-xs text-mutedText max-w-sm mx-auto">
            Add stocks to your watchlist by searching for symbols or browsing the dashboard.
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-5 py-2.5 bg-primary text-black font-extrabold text-xs rounded-xl shadow-lg shadow-primary/10 hover:opacity-90 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-mutedText uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Change</th>
                  <th className="px-6 py-4 text-right">Change %</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {watchlist.map((stock) => {
                  const isPositive = stock.changePercent >= 0;
                  const price = Number(stock.lastPrice);
                  return (
                    <tr
                      key={stock.symbol}
                      onClick={() => navigate(`/stocks/${stock.symbol}`)}
                      className="hover:bg-white/[0.02] cursor-pointer transition duration-150"
                    >
                      <td className="px-6 py-4 font-bold text-white uppercase text-sm">
                        {stock.symbol}
                      </td>
                      <td className="px-6 py-4 text-mutedText text-xs">
                        {stock.companyName}
                      </td>
                      <td className="px-6 py-4 text-right text-white font-extrabold text-sm">
                        ${price.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right text-xs font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                        <span className="flex items-center justify-end space-x-1">
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          <span>{isPositive ? '+' : ''}{Number(stock.change).toFixed(2)}</span>
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right text-xs font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                        {isPositive ? '+' : ''}{Number(stock.changePercent).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            title="View Stock details"
                            className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-mutedText hover:text-white hover:bg-white/10 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Remove from Watchlist"
                            onClick={(e) => handleRemove(stock.symbol, e)}
                            className="p-1.5 rounded-lg bg-danger/10 border border-danger/10 text-danger hover:bg-danger/25 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
