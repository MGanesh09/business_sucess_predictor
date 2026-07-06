'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { 
  TrendingUp, PlusCircle, FileText, MapPin, 
  CheckCircle, ShieldAlert, DollarSign, Calendar
} from 'lucide-react';
import { getCurrencySetting, formatAmount, CurrencyType } from '../../lib/currency';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell, CartesianGrid 
} from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

export default function DashboardPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currency, setCurrency] = useState<CurrencyType>('USD');

  useEffect(() => {
    setCurrency(getCurrencySetting());
    const handleCurrencyChange = () => setCurrency(getCurrencySetting());
    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(u);
        const data = await api.get('/predictions/list');
        setPredictions(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-800 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 h-96 bg-gray-800 rounded-xl" />
          <div className="h-96 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalRuns = predictions.length;
  const highViability = predictions.filter(p => p.successPrediction.probability >= 75).length;
  
  const avgSuccess = totalRuns > 0 
    ? Math.round(predictions.reduce((acc, p) => acc + p.successPrediction.probability, 0) / totalRuns)
    : 0;

  const avgProfit = totalRuns > 0 
    ? Math.round(predictions.reduce((acc, p) => acc + p.revenuePrediction.yearlyProfit, 0) / totalRuns)
    : 0;

  // Chart 1: Category Distribution
  const categoryCount: Record<string, number> = {};
  predictions.forEach(p => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });
  const pieData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  // Chart 2: Success Probability vs Budget correlation
  const barData = predictions
    .slice()
    .reverse()
    .slice(-10) // Take last 10 entries
    .map(p => ({
      name: p.businessName.substring(0, 10),
      budget: Math.round(p.budget / 1000), // in thousands
      success: p.successPrediction.probability,
    }));

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome Back, {user?.name || 'Entrepreneur'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here is a summary of your simulated business spots.</p>
        </div>
        <Link href="/dashboard/new-prediction" className="glass-button-primary flex items-center gap-2 text-sm py-2.5">
          <PlusCircle className="h-4 w-4" />
          New Prediction
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Simulations Run</span>
            <h3 className="text-2xl font-extrabold text-white mt-1.5">{totalRuns}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">High Viability Spots</span>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1.5">{highViability}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg. Success Rating</span>
            <h3 className="text-2xl font-extrabold text-white mt-1.5">{avgSuccess}%</h3>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <PlusCircle className="h-5 w-5 rotate-45" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg. Projected Profit</span>
            <h3 className="text-2xl font-extrabold text-white mt-1.5">{formatAmount(avgProfit, currency)}/yr</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {predictions.length === 0 ? (
        /* Empty State Card */
        <div className="glass-panel p-12 rounded-3xl border-white/5 text-center flex flex-col items-center justify-center max-w-3xl mx-auto mt-10">
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-6">
            <TrendingUp className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Simulations Found</h2>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed mb-8">
            You haven't run any business predictions yet. Define your business category and select a coordinates map to forecast success!
          </p>
          <Link href="/dashboard/new-prediction" className="glass-button-primary text-sm py-3 px-8 flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Analyze First Location
          </Link>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Success vs Budget Bar Chart */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Success vs Budget correlation</h3>
              <div className="h-80 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis yAxisId="left" orientation="left" stroke="#6366f1" label={{ value: 'Success Score (%)', angle: -90, position: 'insideLeft', fill: '#6366f1' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#a855f7" label={{ value: `Budget (${currency === 'INR' ? '₹' : '$'}K)`, angle: 90, position: 'insideRight', fill: '#a855f7' }} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'budget') return [currency === 'INR' ? `₹${(Number(value) * 83).toLocaleString()}K` : `$${value}K`, 'Budget'];
                        if (name === 'success') return [`${value}%`, 'Success Rating'];
                        return [value, name];
                      }}
                      contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }} 
                    />
                    <Bar yAxisId="left" dataKey="success" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="budget" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Categories Analyzed</h3>
              <div className="h-80 w-full text-xs relative flex flex-col justify-center items-center">
                {pieData.length === 0 ? (
                  <div className="text-gray-500">No category distribution data</div>
                ) : (
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {/* Category Legends */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center max-w-xs mt-2 text-[10px]">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-gray-400">{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Predictions Table */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Location Analyses</h3>
              <Link href="/dashboard/history" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                View all history
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs text-gray-400 uppercase border-b border-white/5 bg-white/2 bg-opacity-20">
                  <tr>
                    <th className="py-3 px-4">Business Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4 text-center">AI Rating</th>
                    <th className="py-3 px-4 text-center">Success Rate</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {predictions.slice(0, 5).map((p) => {
                    const rating = p.successPrediction.overallRating;
                    const isHigh = p.successPrediction.probability >= 75;
                    const ratingColors: Record<string, string> = {
                      'A+': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                      'A': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                      'B+': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                      'B': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                      'C+': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                      'C': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                    };
                    
                    return (
                      <tr key={p._id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{p.businessName}</td>
                        <td className="py-3.5 px-4">{p.category}</td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-xs text-gray-400">{p.location.address}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded border ${ratingColors[rating] || 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}>
                            {rating}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-bold ${isHigh ? 'text-emerald-400' : 'text-gray-300'}`}>
                            {p.successPrediction.probability}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link 
                              href={`/dashboard/reports/${p._id}`}
                              className="glass-button-secondary py-1.5 px-3 text-xs flex items-center gap-1 hover:bg-white/10"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              View Report
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
