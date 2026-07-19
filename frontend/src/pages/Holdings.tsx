import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { TrendingUp, TrendingDown, ArrowUpRight, ShoppingBag } from 'lucide-react';

interface Holding {
  id: number;
  stockId: number;
  symbol: string;
  companyName: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  currentValue: number;
  investedValue: number;
  pnl: number;
  pnlPercent: number;
  change: number;
  changePercent: number;
}

export const Holdings: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHoldings = async () => {
    try {
      const portRes = await api.get('/portfolios');
      if (portRes.data.success && portRes.data.data.length > 0) {
        const portId = portRes.data.data[0].id;
        const res = await api.get(`/portfolios/${portId}/holdings`);
        if (res.data.success) {
          setHoldings(res.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching holdings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
    const interval = setInterval(fetchHoldings, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate global portfolio statistics from holdings
  const totalInvested = holdings.reduce((sum, item) => sum + Number(item.investedValue), 0);
  const totalCurrent = holdings.reduce((sum, item) => sum + Number(item.currentValue), 0);
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Stock Holdings</h2>
        <p className="text-sm text-mutedText mt-1">Track open positions, average acquisition costs, and current market valuations</p>
      </div>

      {/* Summary Cards */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider block">Total Investment</span>
            <span className="text-2xl font-extrabold block text-white mt-1">
              ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider block">Current Value</span>
            <span className="text-2xl font-extrabold block text-glow mt-1">
              ${totalCurrent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider block">Holdings PnL</span>
            <span className={`text-2xl font-extrabold block mt-1 ${totalPnl >= 0 ? 'text-success' : 'text-danger'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} ({totalPnlPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {holdings.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <ShoppingBag className="w-12 h-12 text-mutedText mx-auto animate-bounce" />
            <div className="text-sm text-mutedText">Your portfolio has no active positions yet.</div>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-1.5 bg-primary text-black font-bold text-xs px-4 py-2 rounded-xl transition"
            >
              <span>Explore Stocks</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="text-mutedText border-b border-white/5 uppercase tracking-wider text-[10px] font-bold">
                  <th className="p-4">Symbol</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Avg Cost</th>
                  <th className="p-4">Market Price</th>
                  <th className="p-4">Invested Value</th>
                  <th className="p-4">Current Value</th>
                  <th className="p-4 text-right">Returns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {holdings.map((item) => {
                  const isPositive = item.pnl >= 0;
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="p-4">
                        <Link to={`/stocks/${item.symbol}`} className="hover:opacity-85 block">
                          <span className="font-extrabold text-white text-sm block">{item.symbol}</span>
                          <span className="text-[10px] text-mutedText block max-w-44 truncate">{item.companyName}</span>
                        </Link>
                      </td>
                      <td className="p-4 font-semibold text-text">{item.quantity}</td>
                      <td className="p-4 text-mutedText">${Number(item.averageCost).toFixed(2)}</td>
                      <td className="p-4 font-bold text-white">${Number(item.currentPrice).toFixed(2)}</td>
                      <td className="p-4 text-mutedText">${Number(item.investedValue).toFixed(2)}</td>
                      <td className="p-4 font-bold text-text">${Number(item.currentValue).toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <span className={`font-bold block ${isPositive ? 'text-success' : 'text-danger'}`}>
                          {isPositive ? '+' : ''}${Number(item.pnl).toFixed(2)}
                        </span>
                        <span className={`text-[10px] font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                          {isPositive ? '+' : ''}{Number(item.pnlPercent).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
