import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(email, password, fullName);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F9FAFB] flex items-center justify-center relative px-4">
      {/* Decorative Glow */}
      <div className="absolute w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center shadow-lg">
              <span className="font-extrabold text-black text-lg">X</span>
            </div>
            <span className="font-bold text-xl tracking-wider">PaperTradeX</span>
          </Link>
          <h2 className="text-2xl font-bold">Create your account</h2>
          <p className="text-sm text-mutedText mt-1.5">Get $100k in virtual cash to start trading</p>
        </div>

        <div className="glass-card p-8 rounded-2xl border border-white/5 shadow-2xl">
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-xs px-4 py-2.5 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-mutedText">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#0B1020] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
                />
                <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-mutedText" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-mutedText">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#0B1020] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-mutedText" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-mutedText">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B1020] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-mutedText" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-secondary/95 text-text font-bold py-3 rounded-xl shadow-lg shadow-secondary/15 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Sign Up</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-mutedText">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
