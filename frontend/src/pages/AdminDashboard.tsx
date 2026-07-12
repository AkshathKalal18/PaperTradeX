import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldAlert, Users, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalPortfolios: number;
  totalTradeVolume: number;
}

interface UserRecord {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

interface TransactionRecord {
  id: number;
  user: string;
  symbol: string;
  side: string;
  quantity: number;
  filledPrice: number;
  status: string;
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [txns, setTxns] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'txns'>('users');

  const fetchAdminData = async () => {
    try {
      const statsRes = await api.get('/admin/dashboard');
      if (statsRes.data.success) setStats(statsRes.data.data);

      const usersRes = await api.get('/admin/users');
      if (usersRes.data.success) setUsers(usersRes.data.data);

      const txnsRes = await api.get('/admin/transactions');
      if (txnsRes.data.success) setTxns(txnsRes.data.data);
    } catch (err) {
      console.error('Error fetching admin details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error('Role update failed:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
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
        <h2 className="text-2xl font-bold tracking-tight flex items-center space-x-2 text-danger">
          <ShieldAlert className="w-6 h-6" />
          <span>Admin Controls</span>
        </h2>
        <p className="text-sm text-mutedText mt-1">Global platform metrics, user controls, and transaction ledger audits</p>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider block flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Total Users</span>
            </span>
            <span className="text-2xl font-extrabold block text-white mt-1.5">{stats.totalUsers}</span>
          </div>
          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider block flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Total Orders</span>
            </span>
            <span className="text-2xl font-extrabold block text-white mt-1.5">{stats.totalOrders}</span>
          </div>
          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider block flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-success" />
              <span>Portfolios</span>
            </span>
            <span className="text-2xl font-extrabold block text-white mt-1.5">{stats.totalPortfolios}</span>
          </div>
          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider block flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              <span>Total Volume</span>
            </span>
            <span className="text-2xl font-extrabold block text-glow mt-1.5">
              ${Number(stats.totalTradeVolume).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/5 space-x-6 text-xs uppercase tracking-wider font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 focus:outline-none transition ${activeTab === 'users' ? 'border-b-2 border-danger text-danger' : 'text-mutedText hover:text-text'}`}
        >
          User Accounts
        </button>
        <button
          onClick={() => setActiveTab('txns')}
          className={`pb-3 focus:outline-none transition ${activeTab === 'txns' ? 'border-b-2 border-danger text-danger' : 'text-mutedText hover:text-text'}`}
        >
          Platform Transactions
        </button>
      </div>

      {/* Tab Contents */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="text-mutedText border-b border-white/5 uppercase tracking-wider text-[10px] font-bold">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-bold text-white">{u.fullName}</td>
                    <td className="p-4 text-mutedText">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${u.role === 'ADMIN' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-mutedText">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRoleToggle(u.id, u.role)}
                        className="text-xs hover:underline text-danger font-semibold bg-danger/5 px-2.5 py-1 rounded-lg border border-danger/10"
                      >
                        Toggle Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="text-mutedText border-b border-white/5 uppercase tracking-wider text-[10px] font-bold">
                  <th className="p-4">User</th>
                  <th className="p-4">Asset</th>
                  <th className="p-4">Side</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {txns.map(t => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-semibold text-text">{t.user}</td>
                    <td className="p-4 font-extrabold text-white">{t.symbol}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${t.side === 'BUY' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {t.side}
                      </span>
                    </td>
                    <td className="p-4 text-mutedText">{t.quantity}</td>
                    <td className="p-4 font-semibold text-white">${Number(t.filledPrice).toFixed(2)}</td>
                    <td className="p-4">
                      <span className="text-success font-semibold">{t.status}</span>
                    </td>
                    <td className="p-4 text-mutedText">{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
