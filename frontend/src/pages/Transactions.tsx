import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { History, ArrowDownRight, ArrowUpRight, Search } from 'lucide-react';

interface Transaction {
  id: number;
  portfolioId: number;
  symbol: string;
  companyName: string;
  side: string;
  type: string;
  status: string;
  quantity: number;
  limitPrice: number | null;
  filledPrice: number;
  totalValue: number;
  createdAt: string;
}

export const Transactions: React.FC = () => {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [filteredTxns, setFilteredTxns] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/orders');
      if (res.data.success) {
        setTxns(res.data.data);
        setFilteredTxns(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toLowerCase();
    setSearchQuery(e.target.value);
    const filtered = txns.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.companyName.toLowerCase().includes(q) ||
        t.side.toLowerCase().includes(q)
    );
    setFilteredTxns(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
          <p className="text-sm text-mutedText mt-1">Audit trail of all stock purchase and sale operations</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Filter by symbol, name, side..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-[#111827]/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary transition"
          />
          <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-mutedText" />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {filteredTxns.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-mutedText text-xs">
            <History className="w-8 h-8 mx-auto opacity-40 mb-2" />
            <span>No transaction logs found matching search.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="text-mutedText border-b border-white/5 uppercase tracking-wider text-[10px] font-bold">
                  <th className="p-4">Symbol / Company</th>
                  <th className="p-4">Side</th>
                  <th className="p-4">Order Type</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Filled Price</th>
                  <th className="p-4">Total Value</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTxns.map((txn) => {
                  const isBuy = txn.side === 'BUY';
                  return (
                    <tr key={txn.id} className="hover:bg-white/[0.02]">
                      <td className="p-4">
                        <span className="font-extrabold text-white text-sm block">{txn.symbol}</span>
                        <span className="text-[10px] text-mutedText block max-w-44 truncate">{txn.companyName}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${isBuy ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                          {isBuy ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{txn.side}</span>
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-mutedText">{txn.type}</td>
                      <td className="p-4 font-bold text-text">{txn.quantity}</td>
                      <td className="p-4 text-white font-semibold">${Number(txn.filledPrice).toFixed(2)}</td>
                      <td className="p-4 font-bold text-glow-primary">${Number(txn.totalValue).toFixed(2)}</td>
                      <td className="p-4 text-mutedText">
                        {new Date(txn.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
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
