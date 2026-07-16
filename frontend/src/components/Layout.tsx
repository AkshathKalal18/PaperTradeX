import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard,
  Briefcase,
  History,
  TrendingUp,
  Newspaper,
  Bot,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Search,
  Star
} from 'lucide-react';

interface TickerStock {
  symbol: string;
  lastPrice: number;
  changePercent: number;
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tickerStocks, setTickerStocks] = useState<TickerStock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Fetch ticker stock data every 10 seconds to simulate live ticks
  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const res = await api.get('/stocks');
        if (res.data.success) {
          setTickerStocks(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching ticker:', err);
      }
    };
    fetchTicker();
    const interval = setInterval(fetchTicker, 10000);
    return () => clearInterval(interval);
  }, []);

  // Debounced live search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 1) {
        try {
          const res = await api.get(`/stocks?q=${searchQuery}`);
          if (res.data.success) {
            setSuggestions(res.data.data);
          }
        } catch (err) {
          console.error('Error fetching search suggestions:', err);
        }
      } else {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stocks/${searchQuery.trim().toUpperCase()}`);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { name: 'Watchlist', path: '/watchlist', icon: Star },
    { name: 'Holdings', path: '/holdings', icon: TrendingUp },
    { name: 'Transactions', path: '/transactions', icon: History },
    { name: 'News', path: '/news', icon: Newspaper },
    { name: 'AI Assistant', path: '/ai', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F9FAFB] flex flex-col font-sans">
      {/* Live Ticker Bar */}
      <div className="w-full bg-[#111827]/80 backdrop-blur-md border-b border-white/5 h-10 overflow-hidden flex items-center select-none text-xs">
        <div className="bg-primary/20 text-primary border-r border-white/5 px-4 h-full flex items-center font-bold tracking-wider uppercase text-[10px]">
          Live Ticker
        </div>
        <div className="flex-1 overflow-x-auto scrollbar-none flex items-center space-x-6 px-4 py-1 animate-marquee whitespace-nowrap">
          {tickerStocks.map((stock) => {
            const isPositive = stock.changePercent >= 0;
            return (
              <Link
                key={stock.symbol}
                to={`/stocks/${stock.symbol}`}
                className="flex items-center space-x-1.5 hover:bg-white/5 px-2 py-0.5 rounded transition"
              >
                <span className="font-bold text-white">{stock.symbol}</span>
                <span className="text-mutedText">${Number(stock.lastPrice).toFixed(2)}</span>
                <span className={`font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                  {isPositive ? '+' : ''}{Number(stock.changePercent).toFixed(2)}%
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-[#111827]/40 backdrop-blur-xl border-r border-white/5 p-4 justify-between shrink-0">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 px-2 py-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="font-extrabold text-black text-lg">X</span>
              </div>
              <div>
                <h1 className="font-bold text-base tracking-wide bg-gradient-to-r from-white via-[#F9FAFB] to-primary bg-clip-text text-transparent">
                  PaperTradeX
                </h1>
                <p className="text-[10px] text-mutedText tracking-wider uppercase font-semibold">Pro Platform</p>
              </div>
            </div>

            {/* Search Stock Form with Live Suggestions */}
            <div className="px-2 relative">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search stock symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0B1020]/80 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-text focus:outline-none focus:border-primary transition"
                />
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-mutedText" />
              </form>

              {suggestions.length > 0 && (
                <div className="absolute left-2 right-2 mt-1 bg-[#111827] border border-white/15 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto scrollbar-none divide-y divide-white/5">
                  {suggestions.map((s) => (
                    <div
                      key={s.symbol}
                      onClick={() => {
                        navigate(`/stocks/${s.symbol}`);
                        setSearchQuery('');
                        setSuggestions([]);
                      }}
                      className="px-3 py-2 hover:bg-white/5 cursor-pointer text-left transition flex items-center justify-between"
                    >
                      <div>
                        <span className="text-white font-bold text-xs block">{s.symbol}</span>
                        <span className="text-[10px] text-mutedText block truncate max-w-[140px]">{s.companyName}</span>
                      </div>
                      <span className="text-[10px] font-bold text-primary">${Number(s.lastPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary border-l-2 border-primary font-medium'
                        : 'text-mutedText hover:bg-white/5 hover:text-text'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}


              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-danger/10 text-danger border-l-2 border-danger font-medium'
                      : 'text-mutedText hover:bg-white/5 hover:text-text'
                  }`}
                >
                  <ShieldAlert className="w-4.5 h-4.5" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="space-y-4 border-t border-white/5 pt-4">
            <div className="flex items-center space-x-3 px-2">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate">{user?.fullName}</p>
                <p className="text-[10px] text-mutedText truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/10 transition"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Sidebar (Mobile Toggle) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <aside className="relative flex flex-col w-64 bg-[#111827] border-r border-white/5 p-4 justify-between h-full">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 py-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-secondary to-primary flex items-center justify-center">
                      <span className="font-extrabold text-black text-base">X</span>
                    </div>
                    <span className="font-bold text-sm">PaperTradeX</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/5 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm ${
                          isActive ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-mutedText'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm ${
                        location.pathname.startsWith('/admin') ? 'bg-danger/10 text-danger border-l-2 border-danger' : 'text-mutedText'
                      }`}
                    >
                      <ShieldAlert className="w-4.5 h-4.5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </nav>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-danger/10 transition"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Sign Out</span>
              </button>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Navbar */}
          <header className="h-14 border-b border-white/5 px-4 flex items-center justify-between md:justify-end bg-[#111827]/10 backdrop-blur-md">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1 hover:bg-white/5 rounded">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-mutedText block uppercase font-bold tracking-wider">Status</span>
                <span className="text-xs text-success flex items-center space-x-1 justify-end font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block animate-ping" />
                  <span>Market Live</span>
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
