'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { 
  ShieldAlert, Users, FileText, Activity, Trash2, 
  RefreshCw, CheckCircle2, ShieldCheck, AlertTriangle
} from 'lucide-react';

export default function AdminPanelPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [predictionsList, setPredictionsList] = useState<any[]>([]);
  const [logsList, setLogsList] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState('metrics');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Confirm admin privileges
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role !== 'admin') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);

      const m = await api.get('/admin/metrics');
      const u = await api.get('/admin/users');
      const p = await api.get('/admin/predictions');
      const l = await api.get('/admin/logs');

      setMetrics(m);
      setUsersList(u);
      setPredictionsList(p);
      setLogsList(l);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? All their prediction reports and chat logs will be wiped permanently.')) {
      return;
    }
    try {
      await api.delete(`/admin/users/${id}`);
      setUsersList(prev => prev.filter(u => u._id !== id));
      // Refresh metrics
      const m = await api.get('/admin/metrics');
      setMetrics(m);
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-800 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-800 rounded-xl w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center text-center p-6">
        <div className="glass-panel p-8 rounded-3xl border-red-500/20 max-w-md w-full flex flex-col items-center">
          <ShieldAlert className="h-12 w-12 text-red-400 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            This module is restricted to system administrators. Log in as an admin to check metrics or manage users.
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="glass-button-primary text-xs py-2 px-5"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
            Administration Console
          </h1>
          <p className="text-gray-400 text-sm mt-1">Audit accounts, manage business predictions, and monitor system server logs.</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="glass-button-secondary py-2 text-xs flex items-center gap-1.5 hover:bg-white/10"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Data
        </button>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total User Accounts</span>
              <h3 className="text-2xl font-extrabold text-white mt-1.5">{metrics.totalUsers}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Global Predictions Run</span>
              <h3 className="text-2xl font-extrabold text-white mt-1.5">{metrics.totalPredictions}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Security Audits / Warnings</span>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1.5">{metrics.errorLogsCount}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 gap-2 overflow-x-auto">
        {[
          { id: 'metrics', label: 'Metrics Overview' },
          { id: 'users', label: 'User Control' },
          { id: 'predictions', label: 'Predictions Log' },
          { id: 'logs', label: 'Server Audit Logs' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 shrink-0 ${
              activeTab === tab.id 
                ? 'border-indigo-500 text-white bg-indigo-500/5' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/2'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Metrics */}
      {activeTab === 'metrics' && metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category popularity breakdown */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Popular categories analyzed</h3>
            <div className="space-y-4">
              {Object.entries(metrics.categoryDistribution || {}).map(([cat, count]: any) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-medium">{cat}</span>
                    <span className="text-white font-bold">{count} runs</span>
                  </div>
                  <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${(count / (metrics.totalPredictions || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {Object.keys(metrics.categoryDistribution || {}).length === 0 && (
                <div className="text-center text-xs text-gray-500">No predictions category logs found.</div>
              )}
            </div>
          </div>

          {/* Quick status checks */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2.5">
              Admin Diagnostics
            </h3>
            <div className="space-y-3.5 text-xs text-gray-400">
              <div className="flex justify-between items-center">
                <span>Database Node Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span>FastAPI Inference engine:</span>
                <span className="text-indigo-400 font-bold">Model Ready</span>
              </div>
              <div className="flex justify-between items-center">
                <span>JWT Authentication Layer:</span>
                <span className="text-emerald-400 font-bold">Enabled</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Audit Logs Tracker:</span>
                <span className="text-emerald-400 font-bold">Logging Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users Control */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-2xl border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase border-b border-white/5 bg-white/2">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Role</th>
                  <th className="py-3 px-4 text-center">Verified</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-white/2">
                    <td className="py-3.5 px-4 font-bold text-white">{u.name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs">{u.email}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        u.role === 'admin' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-gray-400 bg-gray-500/10 border-gray-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-bold ${u.isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {u.isVerified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 hover:bg-red-950/40 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Predictions Log */}
      {activeTab === 'predictions' && (
        <div className="glass-panel p-6 rounded-2xl border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase border-b border-white/5 bg-white/2">
                <tr>
                  <th className="py-3 px-4">Business Name</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">AI Rating</th>
                  <th className="py-3 px-4 text-center">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {predictionsList.map((p) => (
                  <tr key={p._id} className="hover:bg-white/2">
                    <td className="py-3.5 px-4 font-bold text-white">{p.businessName}</td>
                    <td className="py-3.5 px-4">{p.userId?.name || 'Unknown'} ({p.userId?.email || 'N/A'})</td>
                    <td className="py-3.5 px-4">{p.category}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-500/20 text-indigo-400 bg-indigo-500/5">
                        {p.successPrediction.overallRating}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-white">{p.successPrediction.probability}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="glass-panel p-6 rounded-2xl border-white/5 overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs text-gray-400">
              <thead className="text-gray-500 uppercase border-b border-white/5">
                <tr>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3 text-center">Level</th>
                  <th className="py-2 px-3">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {logsList.map((l) => (
                  <tr key={l._id} className="hover:bg-white/2">
                    <td className="py-2 px-3 text-gray-500">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                        l.level === 'error' ? 'text-red-400 bg-red-500/10' : (l.level === 'warn' ? 'text-amber-400 bg-amber-500/10' : 'text-indigo-400 bg-indigo-500/10')
                      }`}>
                        {l.level}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-200">{l.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
