import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, Plus, Minus, ShieldAlert, Award, Bookmark, BookmarkCheck, Globe } from 'lucide-react';

interface StockDetail {
  id: number;
  symbol: string;
  companyName: string;
  lastPrice: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume?: number;
  sector: string;
  exchange: string;
  logo?: string;
  weburl?: string;
  updatedAt?: string;
}

interface Portfolio {
  id: number;
  cashBalance: number;
}

interface Holding {
  symbol: string;
  quantity: number;
  averageCost: number;
}

export const StockDetails: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  
  const [stock, setStock] = useState<StockDetail | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holding, setHolding] = useState<Holding | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  
  // Trade Form states
  const [quantity, setQuantity] = useState(1);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [type, setType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStockDetails = async () => {
    if (!symbol) return;
    try {
      // 1. Get stock details
      const detailRes = await api.get(`/stocks/${symbol.toUpperCase()}`);
      if (detailRes.data.success) {
        setStock(detailRes.data.data);
      }

      // 2. Get user portfolios & check holdings
      const portRes = await api.get('/portfolios');
      if (portRes.data.success && portRes.data.data.length > 0) {
        const port = portRes.data.data[0];
        setPortfolio(port);
        
        // Get holdings
        const holdingsRes = await api.get(`/portfolios/${port.id}/holdings`);
        if (holdingsRes.data.success) {
          const match = holdingsRes.data.data.find((h: any) => h.symbol.toUpperCase() === symbol.toUpperCase());
          setHolding(match || null);
        }
      }

      // 3. Check watchlist status
      const watchRes = await api.get('/watchlist');
      if (watchRes.data.success) {
        const match = watchRes.data.data.some((w: any) => w.symbol.toUpperCase() === symbol.toUpperCase());
        setInWatchlist(match);
      }
    } catch (err) {
      console.error('Error loading stock details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockDetails();
    const interval = setInterval(async () => {
      if (!symbol) return;
      try {
        const res = await api.get(`/stocks/${symbol.toUpperCase()}`);
        if (res.data.success) {
          setStock(res.data.data);
        }
      } catch (err) {
        console.error('Interval update failed:', err);
      }
    }, 20000); // 20s interval — matches cache TTL
    return () => clearInterval(interval);
  }, [symbol]);

  // TradingView Advanced Chart Widget Integration
  useEffect(() => {
    if (loading || !stock) return;

    const containerId = 'tradingview_chart_container';
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    // Resolve exchange for TradingView symbol notation
    let exchange = stock.exchange || 'NASDAQ';
    const exchangeUpper = exchange.toUpperCase();
    if (exchangeUpper === 'NEW YORK STOCK EXCHANGE' || exchangeUpper === 'NYSE MKT' || exchangeUpper === 'BATS') {
      exchange = 'NYSE';
    } else if (exchangeUpper === 'NASDAQ NMS - GLOBAL MARKET' || exchangeUpper === 'NASDAQ NMS' || exchangeUpper === 'NMS') {
      exchange = 'NASDAQ';
    } else if (exchangeUpper === 'CBOE BZX U.S. EQUITIES EXCHANGE') {
      exchange = 'CBOE';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `${exchange}:${stock.symbol}`,
      interval: 'D',
      timezone: 'America/New_York',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: 'rgba(11, 16, 32, 0)',
      gridColor: 'rgba(255, 255, 255, 0.04)',
      allow_symbol_change: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      withdateranges: true,
      range: '12M',
      hide_side_toolbar: false,
    });

    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [loading, symbol, stock?.symbol]);

  const toggleWatchlist = async () => {
    if (!stock) return;
    try {
      if (inWatchlist) {
        await api.delete(`/watchlist/${stock.symbol}`);
        setInWatchlist(false);
      } else {
        await api.post(`/watchlist/${stock.symbol}`);
        setInWatchlist(true);
      }
    } catch (err) {
      console.error('Watchlist toggle failed:', err);
    }
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stock || !portfolio) return;
    setActionLoading(true);
    setStatusMsg(null);

    try {
      const orderReq = {
        portfolioId: portfolio.id,
        symbol: stock.symbol,
        side,
        type,
        quantity,
        limitPrice: type === 'LIMIT' ? Number(limitPrice) : null,
      };

      const res = await api.post('/orders', orderReq);
      if (res.data.success) {
        setStatusMsg({ type: 'success', text: `Order executed! Successfully ${side.toLowerCase()}ed ${quantity} shares of ${stock.symbol}.` });
        fetchStockDetails();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Transaction failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !stock) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPositive = stock.changePercent >= 0;
  const currentPrice = Number(stock.lastPrice);
  const estimatedCost = currentPrice * quantity;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Chart and Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header Block */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              {stock.logo && (
                <img
                  src={stock.logo}
                  alt={stock.symbol}
                  className="w-10 h-10 rounded-xl bg-white p-1 border border-white/10"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-3xl font-extrabold text-white">{stock.symbol}</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase tracking-wider text-mutedText">
                    {stock.exchange}
                  </span>
                  <button
                    onClick={toggleWatchlist}
                    className="p-1.5 hover:bg-white/5 rounded-full border border-white/5 transition"
                  >
                    {inWatchlist ? (
                      <BookmarkCheck className="w-4.5 h-4.5 text-primary animate-pulse" />
                    ) : (
                      <Bookmark className="w-4.5 h-4.5 text-mutedText" />
                    )}
                  </button>
                </div>
                <h1 className="text-sm text-mutedText mt-0.5">{stock.companyName}</h1>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-3xl font-black text-glow text-white">${currentPrice.toFixed(2)}</h3>
            <p className={`text-sm font-bold ${isPositive ? 'text-success' : 'text-danger'} mt-1`}>
              {isPositive ? '+' : ''}{Number(stock.change).toFixed(2)} ({isPositive ? '+' : ''}{Number(stock.changePercent).toFixed(2)}%)
            </p>
          </div>
        </div>

        {/* Candlestick Chart (TradingView Advanced Chart Widget) */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-mutedText font-semibold uppercase tracking-wider">TradingView Real-time Chart</span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold text-success uppercase tracking-widest">Live</span>
            </span>
          </div>
          <div className="tradingview-widget-container rounded-xl overflow-hidden bg-[#131722] border border-white/5" style={{ height: '500px' }}>
            <div id="tradingview_chart_container" className="w-full h-full" />
          </div>
        </div>

        {/* Key Stats Block */}
        <div className="glass-card p-6 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-6 border border-white/5">
          <div>
            <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider">Open</span>
            <span className="text-sm font-bold block text-white mt-1">
              ${stock.open ? Number(stock.open).toFixed(2) : Number(stock.lastPrice).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider">High / Low</span>
            <span className="text-sm font-bold block text-white mt-1">
              ${stock.high ? Number(stock.high).toFixed(2) : (Number(stock.lastPrice) * 1.01).toFixed(2)} / ${stock.low ? Number(stock.low).toFixed(2) : (Number(stock.lastPrice) * 0.99).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider">Prev Close</span>
            <span className="text-sm font-bold block text-white mt-1">
              ${Number(stock.previousClose).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider">Volume</span>
            <span className="text-sm font-bold block text-white mt-1">
              {stock.volume ? stock.volume.toLocaleString() : '1,500,000'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider">Sector / Industry</span>
            <span className="text-sm font-bold block text-white mt-1">
              {stock.sector || 'Technology'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider">Exchange</span>
            <span className="text-sm font-bold block text-white mt-1">
              {stock.exchange || 'NASDAQ'}
            </span>
          </div>
          {stock.weburl && (
            <div className="col-span-2">
              <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider">Website</span>
              <a
                href={stock.weburl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold text-primary hover:underline flex items-center space-x-1 mt-1"
              >
                <Globe className="w-3.5 h-3.5 inline" />
                <span>Visit Company Site</span>
              </a>
            </div>
          )}
        </div>
      </div>


      {/* Trade Widget */}
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative">
          <h3 className="font-extrabold text-lg border-b border-white/5 pb-4 mb-4">Place Order</h3>

          {statusMsg && (
            <div className={`px-4 py-2.5 rounded-lg text-xs mb-4 border ${
              statusMsg.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'
            }`}>
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleTrade} className="space-y-5">
            {/* Side selector */}
            <div className="grid grid-cols-2 gap-2 bg-[#0B1020] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                  side === 'BUY' ? 'bg-success text-black' : 'text-mutedText hover:text-text'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                  side === 'SELL' ? 'bg-danger text-text' : 'text-mutedText hover:text-text'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <button
                type="button"
                onClick={() => setType('MARKET')}
                className={`py-1.5 rounded-lg border transition ${
                  type === 'MARKET' ? 'border-primary text-primary font-bold bg-primary/5' : 'border-white/5 text-mutedText'
                }`}
              >
                Market Order
              </button>
              <button
                type="button"
                onClick={() => setType('LIMIT')}
                className={`py-1.5 rounded-lg border transition ${
                  type === 'LIMIT' ? 'border-primary text-primary font-bold bg-primary/5' : 'border-white/5 text-mutedText'
                }`}
              >
                Limit Order
              </button>
            </div>

            {/* Qty Input */}
            <div className="space-y-2">
              <label className="text-[10px] text-mutedText uppercase font-bold tracking-wider">Shares Quantity</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-[#0B1020] border border-white/10 hover:border-primary flex items-center justify-center transition"
                >
                  <Minus className="w-4 h-4 text-text" />
                </button>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-[#0B1020] border border-white/10 rounded-xl py-2.5 text-center font-bold text-sm focus:outline-none focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-xl bg-[#0B1020] border border-white/10 hover:border-primary flex items-center justify-center transition"
                >
                  <Plus className="w-4 h-4 text-text" />
                </button>
              </div>
            </div>

            {/* Limit Price Input if type is LIMIT */}
            {type === 'LIMIT' && (
              <div className="space-y-2">
                <label className="text-[10px] text-mutedText uppercase font-bold tracking-wider">Limit Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder={currentPrice.toString()}
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="w-full bg-[#0B1020] border border-white/10 rounded-xl py-2.5 px-4 font-bold text-sm focus:outline-none focus:border-primary transition"
                />
              </div>
            )}

            {/* Estimated calculations */}
            <div className="space-y-2 border-t border-white/5 pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-mutedText">Cash Balance</span>
                <span className="font-semibold text-text">
                  ${portfolio ? Number(portfolio.cashBalance).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedText">Position Owned</span>
                <span className="font-semibold text-text">
                  {holding ? `${holding.quantity} shares` : '0 shares'}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 text-sm">
                <span className="font-bold text-white">Estimated Cost</span>
                <span className="font-black text-glow">${estimatedCost.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className={`w-full font-extrabold py-3.5 rounded-xl transition flex items-center justify-center space-x-2 text-sm ${
                side === 'BUY' ? 'bg-success text-black' : 'bg-danger text-text'
              }`}
            >
              {actionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Place {side === 'BUY' ? 'Buy' : 'Sell'} Order</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
