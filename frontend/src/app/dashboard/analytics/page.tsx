'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { BarChart3, LineChart, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, CartesianGrid, LineChart as RechartsLineChart, Line 
} from 'recharts';

export default function AnalyticsPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.get('/predictions/list');
        setPredictions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="h-96 bg-gray-800 rounded-xl" />
          <div className="h-96 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Prep charts data
  const revenueProfitData = predictions.slice().reverse().map(p => ({
    name: p.businessName.substring(0, 10),
    revenue: Math.round(p.revenuePrediction.yearly / 1000), // in $K
    profit: Math.round(p.revenuePrediction.yearlyProfit / 1000), // in $K
  }));

  const scoresCorrelationData = predictions.slice().reverse().map(p => ({
    name: p.businessName.substring(0, 10),
    location: p.scores.locationScore,
    accessibility: p.scores.accessibilityScore,
    visibility: p.scores.visibilityScore,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <BarChart3 className="h-6 w-6 text-indigo-400" />
          Location Intelligence Analytics
        </h1>
        <p className="text-gray-400 text-sm mt-1">Aggregated insights across all your simulated business models.</p>
      </div>

      {predictions.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border-white/5 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
          <BarChart3 className="h-10 w-10 text-gray-500 mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">No Analytics Data</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Run business simulations to populate trends and financial comparatives.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Revenue vs Profit area chart */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="h-4.5 w-4.5 text-indigo-400" />
              Annual Revenues vs Net Profits ($K)
            </h3>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueProfitData}>
                  <defs>
                    <linearGradient id="colRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colProf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', color: '#fff', border: 'none' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colRev)" />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colProf)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scores Comparison Line Chart */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
              Geographic Score Correlations
            </h3>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={scoresCorrelationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis domain={[0, 100]} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', color: '#fff', border: 'none' }} />
                  <Line type="monotone" dataKey="location" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="accessibility" stroke="#a855f7" strokeWidth={2} />
                  <Line type="monotone" dataKey="visibility" stroke="#10b981" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
