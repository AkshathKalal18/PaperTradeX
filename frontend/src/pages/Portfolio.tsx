import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, ArrowUpRight, TrendingUp, DollarSign, Wallet } from 'lucide-react';

interface PortfolioItem {
  id: number;
  name: string;
  cashBalance: number;
  initialBalance: number;
  holdingsValue: number;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
}

export const Portfolio: React.FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolios = async () => {
    try {
      const res = await api.get('/portfolios');
      if (res.data.success) {
        // Fetch full detail for each portfolio to get PnL calculation
        const details = await Promise.all(
          res.data.data.map(async (p: any) => {
            const detailRes = await api.get(`/portfolios/${p.id}`);
            return detailRes.data.data;
          })
        );
        setPortfolios(details);
      }
    } catch (err) {
      console.error('Error fetching portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
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
          <h2 className="text-2xl font-bold tracking-tight">Portfolios</h2>
          <p className="text-sm text-mutedText mt-1">Manage and track your active trading portfolios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portfolios.map((portfolio) => {
          const isPositive = portfolio.totalPnl >= 0;
          return (
            <div key={portfolio.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{portfolio.name}</h3>
                    <p className="text-xs text-mutedText">ID: #{portfolio.id}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {isPositive ? '+' : ''}{Number(portfolio.totalPnlPercent).toFixed(2)}%
                </span>
              </div>

              {/* Value stats */}
              <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-4">
                <div>
                  <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider block">Total Balance</span>
                  <span className="text-sm font-bold block text-white mt-1">
                    ${Number(portfolio.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider block">Cash balance</span>
                  <span className="text-sm font-bold block text-glow mt-1">
                    ${Number(portfolio.cashBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider block">Stock Valuation</span>
                  <span className="text-sm font-bold block text-[#A78BFA] mt-1">
                    ${Number(portfolio.holdingsValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-mutedText">Initial:</span>
                  <span className="font-bold text-white">${Number(portfolio.initialBalance).toLocaleString()}</span>
                </div>
                <Link
                  to="/holdings"
                  className="bg-white/5 hover:bg-white/10 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5"
                >
                  <span>View Holdings</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
