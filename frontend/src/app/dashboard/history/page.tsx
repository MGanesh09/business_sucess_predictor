'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { 
  History, Search, FileText, MessageSquare, Trash2, 
  MapPin, PlusCircle, AlertCircle, ArrowUpRight
} from 'lucide-react';

export default function HistoryPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.get('/predictions/list');
      setPredictions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prediction report? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/predictions/delete/${id}`);
      setPredictions(prev => prev.filter(p => p._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete report.');
    }
  };

  // Filters
  const filteredPredictions = predictions.filter(p => {
    const matchesSearch = p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filter
  const categories = ['All', ...Array.from(new Set(predictions.map(p => p.category)))];

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/4" />
        <div className="h-12 bg-gray-800 rounded-xl w-full mt-4" />
        <div className="h-64 bg-gray-800 rounded-xl w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <History className="h-6 w-6 text-indigo-400" />
            Simulation History
          </h1>
          <p className="text-gray-400 text-sm mt-1">Browse, filter and manage all location assessments.</p>
        </div>
        <Link href="/dashboard/new-prediction" className="glass-button-primary flex items-center gap-2 text-sm py-2.5">
          <PlusCircle className="h-4 w-4" />
          New Simulation
        </Link>
      </div>

      {predictions.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border-white/5 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
          <History className="h-10 w-10 text-gray-500 mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">No History Yet</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            You haven't run any business predictions. Let's create your first simulation!
          </p>
          <Link href="/dashboard/new-prediction" className="glass-button-primary text-sm py-2.5 px-6">
            Analyze Location
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-950/20 p-4 rounded-xl border border-white/5">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search business or address..."
                className="w-full glass-input text-xs pl-9 py-2"
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-500" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-gray-500 font-semibold uppercase">Category:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="glass-input text-xs py-2 pr-8 bg-gray-950/80 cursor-pointer focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid list of reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPredictions.map((p) => {
              const probability = p.successPrediction.probability;
              const rating = p.successPrediction.overallRating;
              
              const cardColors: Record<string, string> = {
                'A+': 'border-emerald-500/20 bg-emerald-500/2',
                'A': 'border-emerald-500/20 bg-emerald-500/2',
                'B+': 'border-indigo-500/20 bg-indigo-500/2',
                'B': 'border-indigo-500/20 bg-indigo-500/2',
                'C+': 'border-amber-500/20 bg-amber-500/2',
                'C': 'border-amber-500/20 bg-amber-500/2',
              };

              return (
                <div 
                  key={p._id} 
                  className={`glass-panel p-6 rounded-2xl border transition-all hover:-translate-y-0.5 flex flex-col justify-between h-64 ${
                    cardColors[rating] || 'border-white/5 bg-white/2'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="bg-white/5 border border-white/8 px-2 py-0.5 rounded text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                        {p.category}
                      </span>
                      <span className="text-sm font-black text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-lg border border-indigo-500/10">
                        Grade {rating}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-white text-base truncate">{p.businessName}</h3>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {p.location.address}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-500">Success Probability</span>
                        <span className="text-lg font-black text-white">{probability}%</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-gray-500">Projected Profit</span>
                        <span className="text-sm font-bold text-emerald-400">${p.revenuePrediction.yearlyProfit.toLocaleString()}/yr</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex gap-2 justify-end">
                    <button 
                      onClick={() => handleDelete(p._id)}
                      className="p-2 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 hover:bg-red-950/40 transition-colors"
                      title="Delete Prediction"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <Link 
                      href={`/dashboard/ai-assistant?predictionId=${p._id}`}
                      className="glass-button-secondary p-2 text-xs flex items-center gap-1 hover:bg-white/10"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Chat
                    </Link>
                    <Link 
                      href={`/dashboard/reports/${p._id}`}
                      className="glass-button-primary py-2 px-3 text-xs flex items-center gap-1"
                    >
                      Report
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPredictions.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-12">
              No matching location analyses found.
            </div>
          )}

        </div>
      )}

    </div>
  );
}
