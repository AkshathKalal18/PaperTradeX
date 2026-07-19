import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  Activity,
  Plus,
  ArrowRight,
  Bookmark
} from 'lucide-react';

interface PortfolioSummary {
  id: number;
  name: string;
  cashBalance: number;
  initialBalance: number;
  holdingsValue: number;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
}

interface Stock {
  symbol: string;
  companyName: string;
  lastPrice: number;
  changePercent: number;
  change: number;
}

interface Transaction {
  id: number;
  symbol: string;
  side: string;
  quantity: number;
  filledPrice: number;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [gainers, setGainers] = useState<Stock[]>([]);
  const [losers, setLosers] = useState<Stock[]>([]);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [marketOpen, setMarketOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock growth trend data for the area chart
  const pnlTrendData = [
    { name: 'Mon', value: 98000 },
    { name: 'Tue', value: 99500 },
    { name: 'Wed', value: 98800 },
    { name: 'Thu', value: 101200 },
    { name: 'Fri', value: 100500 },
    { name: 'Sat', value: 102100 },
    { name: 'Sun', value: portfolio ? Number(portfolio.totalValue) : 100000 }
  ];

  const fetchDashboardData = async () => {
    try {
      // 1. Get user portfolios
      const portRes = await api.get('/portfolios');
      let portId = null;
      if (portRes.data.success && portRes.data.data.length > 0) {
        const portDetail = await api.get(`/portfolios/${portRes.data.data[0].id}`);
        setPortfolio(portDetail.data.data);
        portId = portRes.data.data[0].id;
      }

      // 2. Get watchlist
      const watchRes = await api.get('/watchlist');
      if (watchRes.data.success) {
        setWatchlist(watchRes.data.data);
      }

      // 3. Get gainers & losers
      const gainRes = await api.get('/stocks/market/gainers');
      if (gainRes.data.success) setGainers(gainRes.data.data);

      const loseRes = await api.get('/stocks/market/losers');
      if (loseRes.data.success) setLosers(loseRes.data.data);

      // 4. Get recent transactions
      if (portId) {
        const txnRes = await api.get(`/orders/portfolio/${portId}`);
        if (txnRes.data.success) {
          setRecentTxns(txnRes.data.data.slice(0, 5));
        }
      }

      // 5. Fetch live market status
      try {
        const statusRes = await api.get('/stocks/market/status');
        if (statusRes.data.success) {
          setMarketOpen(statusRes.data.data.isOpen === true);
        }
      } catch {
        // Fallback: local time check
        const now = new Date();
        const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const day = estTime.getDay();
        const h = estTime.getHours();
        const m = estTime.getMinutes();
        if (day === 0 || day === 6) setMarketOpen(false);
        else setMarketOpen(h * 60 + m >= 9 * 60 + 30 && h * 60 + m <= 16 * 60);
      }
    } catch (err) {
      console.error('Error fetching dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate allocation metrics
  const cash = portfolio ? Number(portfolio.cashBalance) : 100000;
  const holdings = portfolio ? Number(portfolio.holdingsValue) : 0;
  const pieData = [
    { name: 'Cash', value: cash, color: '#00E5FF' },
    { name: 'Holdings', value: holdings, color: '#7C3AED' }
  ];

  const totalPnl = portfolio ? Number(portfolio.totalPnl) : 0;
  const totalPnlPercent = portfolio ? Number(portfolio.totalPnlPercent) : 0;
  const isPnlPositive = totalPnl >= 0;

  const isMarketOpen = marketOpen;

  return (
    <div className="space-y-6">
      {/* Market Status & Indices Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-mutedText font-semibold uppercase tracking-wider">Market Status:</span>
          {isMarketOpen ? (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-success/15 border border-success/20 text-success text-[10px] font-bold uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span>Active / Open</span>
            </span>
          ) : isMarketOpen === false ? (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-danger/15 border border-danger/20 text-danger text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-danger opacity-75" />
              <span>Closed</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-mutedText text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-mutedText" />
              <span>Checking...</span>
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 w-full md:w-auto text-xs">
          <div className="bg-[#0B1020]/60 border border-white/5 rounded-xl px-4 py-2 text-center md:text-left flex items-center justify-between space-x-3">
            <div>
              <span className="text-[9px] text-mutedText font-bold uppercase tracking-wider block">S&amp;P 500</span>
              <span className="font-extrabold text-white block mt-0.5">SPY</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isMarketOpen ? 'text-success bg-success/10' : 'text-mutedText bg-white/5'}`}>{isMarketOpen ? 'LIVE' : 'CLOSED'}</span>
          </div>
          <div className="bg-[#0B1020]/60 border border-white/5 rounded-xl px-4 py-2 text-center md:text-left flex items-center justify-between space-x-3">
            <div>
              <span className="text-[9px] text-mutedText font-bold uppercase tracking-wider block">NASDAQ</span>
              <span className="font-extrabold text-white block mt-0.5">QQQ</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isMarketOpen ? 'text-success bg-success/10' : 'text-mutedText bg-white/5'}`}>{isMarketOpen ? 'LIVE' : 'CLOSED'}</span>
          </div>
          <div className="bg-[#0B1020]/60 border border-white/5 rounded-xl px-4 py-2 text-center md:text-left flex items-center justify-between space-x-3">
            <div>
              <span className="text-[9px] text-mutedText font-bold uppercase tracking-wider block">Dow Jones</span>
              <span className="font-extrabold text-white block mt-0.5">DIA</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isMarketOpen ? 'text-success bg-success/10' : 'text-mutedText bg-white/5'}`}>{isMarketOpen ? 'LIVE' : 'CLOSED'}</span>
          </div>
        </div>
      </div>

      {/* Top Banner Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Portfolio Value Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-mutedText font-semibold uppercase tracking-wider">Portfolio Value</p>
              <h3 className="text-3xl font-extrabold mt-2 text-glow">
                ${portfolio ? Number(portfolio.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '100,000.00'}
              </h3>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2 text-xs text-mutedText">
            <span className="font-semibold text-text">Initial:</span>
            <span>${portfolio ? Number(portfolio.initialBalance).toLocaleString() : '100,000.00'}</span>
          </div>
        </div>

        {/* Profit / Loss Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-mutedText font-semibold uppercase tracking-wider">Total Profit / Loss</p>
              <h3 className={`text-3xl font-extrabold mt-2 ${isPnlPositive ? 'text-success' : 'text-danger'}`}>
                {isPnlPositive ? '+' : ''}${totalPnl.toFixed(2)}
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl border ${isPnlPositive ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'}`}>
              {isPnlPositive ? <TrendingUp className="w-5 h-5 text-success" /> : <TrendingDown className="w-5 h-5 text-danger" />}
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2 text-xs">
            <span className={`font-semibold px-2 py-0.5 rounded-full ${isPnlPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
              {isPnlPositive ? '+' : ''}{totalPnlPercent.toFixed(2)}%
            </span>
            <span className="text-mutedText">all-time performance</span>
          </div>
        </div>

        {/* Buying Power / Cash balance */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-mutedText font-semibold uppercase tracking-wider">Buying Power (Cash)</p>
              <h3 className="text-3xl font-extrabold mt-2 text-[#7C3AED] text-glow-purple">
                ${portfolio ? Number(portfolio.cashBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '100,000.00'}
              </h3>
            </div>
            <div className="p-2.5 bg-secondary/10 rounded-xl border border-secondary/20">
              <PieIcon className="w-5 h-5 text-secondary" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2 text-xs text-mutedText">
            <span className="font-semibold text-text">Invested:</span>
            <span>${portfolio ? Number(portfolio.holdingsValue).toLocaleString() : '0.00'}</span>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-primary" />
              <span>Performance Trend</span>
            </h3>
            <span className="text-xs text-mutedText">Past 7 days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlTrendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#4B5563" fontSize={11} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#4B5563" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="font-bold text-sm uppercase tracking-wider flex items-center space-x-2 mb-4">
            <PieIcon className="w-4 h-4 text-secondary" />
            <span>Asset Allocation</span>
          </h3>
          <div className="h-44 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] uppercase text-mutedText font-semibold">Holdings</span>
              <span className="text-lg font-bold">
                {portfolio && Number(portfolio.totalValue) > 0
                  ? ((holdings / Number(portfolio.totalValue)) * 100).toFixed(0)
                  : '0'}%
              </span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-2 text-mutedText">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span>Cash Balance</span>
              </span>
              <span className="font-bold">${cash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-2 text-mutedText">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                <span>Stock Assets</span>
              </span>
              <span className="font-bold">${holdings.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tickers / Gainers / Losers grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="glass-card p-6 rounded-2xl">
          <h4 className="font-bold text-sm uppercase tracking-wider text-success mb-4 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Top Gainers</span>
          </h4>
          <div className="divide-y divide-white/5">
            {gainers.map((stock) => (
              <Link
                key={stock.symbol}
                to={`/stocks/${stock.symbol}`}
                className="flex items-center justify-between py-3 hover:bg-white/5 px-2 rounded-lg transition"
              >
                <div>
                  <span className="font-bold block">{stock.symbol}</span>
                  <span className="text-xs text-mutedText">{stock.companyName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold block">${Number(stock.lastPrice).toFixed(2)}</span>
                  <span className="text-xs font-semibold text-success">
                    +{Number(stock.changePercent).toFixed(2)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="glass-card p-6 rounded-2xl">
          <h4 className="font-bold text-sm uppercase tracking-wider text-danger mb-4 flex items-center space-x-2">
            <TrendingDown className="w-4 h-4" />
            <span>Top Losers</span>
          </h4>
          <div className="divide-y divide-white/5">
            {losers.map((stock) => (
              <Link
                key={stock.symbol}
                to={`/stocks/${stock.symbol}`}
                className="flex items-center justify-between py-3 hover:bg-white/5 px-2 rounded-lg transition"
              >
                <div>
                  <span className="font-bold block">{stock.symbol}</span>
                  <span className="text-xs text-mutedText">{stock.companyName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold block">${Number(stock.lastPrice).toFixed(2)}</span>
                  <span className="text-xs font-semibold text-danger">
                    {Number(stock.changePercent).toFixed(2)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Watchlist & Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist Section */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm uppercase tracking-wider flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-primary" />
              <span>Watchlist</span>
            </h4>
            <Link to="/portfolio" className="text-xs text-primary hover:underline flex items-center space-x-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {watchlist.length === 0 ? (
            <div className="text-center py-8 text-xs text-mutedText">
              Your watchlist is empty. Search for symbols to add them!
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-72 overflow-y-auto pr-1">
              {watchlist.map((stock) => {
                const isPositive = stock.changePercent >= 0;
                return (
                  <div key={stock.symbol} className="flex justify-between items-center py-3">
                    <Link to={`/stocks/${stock.symbol}`} className="hover:opacity-85">
                      <span className="font-bold block text-sm">{stock.symbol}</span>
                      <span className="text-[10px] text-mutedText truncate block max-w-32">{stock.companyName}</span>
                    </Link>
                    <div className="text-right">
                      <span className="font-bold block text-sm">${Number(stock.lastPrice).toFixed(2)}</span>
                      <span className={`text-[10px] font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                        {isPositive ? '+' : ''}{Number(stock.changePercent).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-secondary" />
              <span>Recent Orders</span>
            </h4>
            <Link to="/transactions" className="text-xs text-secondary hover:underline flex items-center space-x-1">
              <span>Full history</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentTxns.length === 0 ? (
            <div className="text-center py-8 text-xs text-mutedText">
              No transactions placed yet. Try buying a stock!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-mutedText border-b border-white/5 uppercase tracking-wider">
                    <th className="py-2.5">Asset</th>
                    <th className="py-2.5">Type</th>
                    <th className="py-2.5">Qty</th>
                    <th className="py-2.5">Filled Price</th>
                    <th className="py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentTxns.map((txn) => (
                    <tr key={txn.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 font-bold text-white">{txn.symbol}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${txn.side === 'BUY' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                          {txn.side}
                        </span>
                      </td>
                      <td className="py-3 text-mutedText">{txn.quantity}</td>
                      <td className="py-3 font-semibold">${Number(txn.filledPrice).toFixed(2)}</td>
                      <td className="py-3 text-mutedText">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
