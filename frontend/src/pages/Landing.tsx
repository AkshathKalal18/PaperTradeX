import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Activity, Cpu, Award, Bot } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F9FAFB] relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-secondary to-primary flex items-center justify-center">
            <span className="font-extrabold text-black text-base">X</span>
          </div>
          <span className="font-bold text-lg tracking-wider">PaperTradeX</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-semibold hover:text-primary transition">Sign In</Link>
          <Link
            to="/register"
            className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all duration-300 transform hover:scale-[1.02]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center relative z-10 px-6 py-12 md:py-24">
        <div className="max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-primary font-semibold tracking-wide uppercase">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Virtual Stock Trading Simulator</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-text to-mutedText bg-clip-text text-transparent">
            Master the Markets Without the <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-glow">Financial Risk</span>
          </h1>

          <p className="text-mutedText text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Experience real-time stock simulation with professional analytical charts, mock balances, AI-assisted market insights, and a comprehensive Stripe-inspired dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-black font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-primary/10 hover:shadow-primary/25 transition-all duration-300 flex items-center justify-center space-x-2 group transform hover:scale-[1.02]"
            >
              <span>Start Trading Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3.5 rounded-xl font-semibold transition"
            >
              Access Account
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16">
            <div className="glass-card p-5 rounded-2xl text-center space-y-2">
              <Cpu className="w-6 h-6 text-primary mx-auto" />
              <h3 className="font-bold text-sm">Real-time Prices</h3>
              <p className="text-xs text-mutedText">Live-updating simulated feeds</p>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center space-y-2">
              <Shield className="w-6 h-6 text-[#A78BFA] mx-auto" />
              <h3 className="font-bold text-sm">Risk Free</h3>
              <p className="text-xs text-mutedText">$100k virtual cash balance</p>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center space-y-2">
              <Bot className="w-6 h-6 text-success mx-auto" />
              <h3 className="font-bold text-sm">AI Assistant</h3>
              <p className="text-xs text-mutedText">Smart trade recommendations</p>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center space-y-2">
              <Award className="w-6 h-6 text-danger mx-auto" />
              <h3 className="font-bold text-sm">Pro Analytical Tools</h3>
              <p className="text-xs text-mutedText">Premium candlestick charts</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 h-16 flex items-center justify-center text-xs text-mutedText relative z-10 px-6">
        <div>&copy; {new Date().getFullYear()} PaperTradeX. Built for elite portfolios.</div>
      </footer>
    </div>
  );
};
