'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { api } from '../../../lib/api';
import { Map, Star, Compass, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Dynamically load Map component
const CompetitorMap = dynamic(() => import('../../../components/CompetitorMap'), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-gray-900 rounded-2xl flex items-center justify-center border border-white/5"><span className="text-xs text-gray-500">Loading competitor map layers...</span></div>
});

interface Competitor {
  name: string;
  lat: number;
  lng: number;
  rating: number;
  distance: string;
  popularity: string;
}

export default function CompetitorAnalysisPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [activeReport, setActiveReport] = useState<any>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [activeCompIdx, setActiveCompIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const data = await api.get('/predictions/list');
        setPredictions(data);
        if (data.length > 0) {
          setSelectedId(data[0]._id);
          setActiveReport(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  useEffect(() => {
    if (selectedId) {
      const report = predictions.find(p => p._id === selectedId);
      if (report) {
        setActiveReport(report);
        
        // Generate simulated competitor coordinates relative to coordinates
        const lat = report.location.lat;
        const lng = report.location.lng;
        const cat = report.category;
        
        const generated: Competitor[] = [
          {
            name: `Competitor ${cat} A`,
            lat: lat + 0.002,
            lng: lng - 0.001,
            rating: 4.2,
            distance: '310 m',
            popularity: 'High'
          },
          {
            name: `Competitor ${cat} B`,
            lat: lat - 0.003,
            lng: lng + 0.002,
            rating: 3.8,
            distance: '480 m',
            popularity: 'Medium'
          },
          {
            name: `Elite ${cat} Club`,
            lat: lat + 0.001,
            lng: lng + 0.003,
            rating: 4.6,
            distance: '240 m',
            popularity: 'Very High'
          },
          {
            name: `Local ${cat} Stop`,
            lat: lat - 0.0015,
            lng: lng - 0.0025,
            rating: 4.0,
            distance: '390 m',
            popularity: 'Low'
          }
        ];
        
        setCompetitors(generated);
        setActiveCompIdx(null);
      }
    }
  }, [selectedId, predictions]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/3" />
        <div className="h-12 bg-gray-800 rounded-xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-800 rounded-xl" />
          <div className="h-96 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Bar Chart Comparison: Ratings
  const chartData = competitors.map(c => ({
    name: c.name.substring(0, 12),
    rating: c.rating
  }));

  // Add target business to comparison chart
  if (activeReport) {
    chartData.unshift({
      name: 'Proposed Spot',
      rating: 4.4 // assumed target expectation
    });
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Map className="h-6 w-6 text-indigo-400" />
            Competitor analysis
          </h1>
          <p className="text-gray-400 text-sm mt-1">Review competition density and ratings around your selected coordinates.</p>
        </div>

        {predictions.length > 0 && (
          <div className="flex items-center gap-2 bg-gray-950/20 p-2 rounded-xl border border-white/5">
            <span className="text-xs text-gray-500 font-semibold uppercase">Analysis Target:</span>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="glass-input text-xs py-1.5 pr-8 bg-gray-950/80 cursor-pointer focus:outline-none"
            >
              {predictions.map(p => (
                <option key={p._id} value={p._id}>{p.businessName} ({p.category})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {predictions.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border-white/5 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
          <Map className="h-10 w-10 text-gray-500 mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">No Active Locations</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            You must run at least one business success prediction to inspect competitor densities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map wrapper */}
            {activeReport && (
              <CompetitorMap 
                centerLat={activeReport.location.lat}
                centerLng={activeReport.location.lng}
                businessName={activeReport.businessName}
                competitors={competitors}
                activeCompIndex={activeCompIdx}
              />
            )}

            {/* Competitor Ratings Comparison */}
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Ratings Benchmarking</h3>
              <div className="h-56 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis domain={[0, 5]} stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', color: '#fff', border: 'none' }} />
                    <Bar dataKey="rating" fill="#a855f7" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Proposed Spot' ? '#6366f1' : '#a855f7'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right sidebar: Saturation metrics & Competitor list */}
          <div className="space-y-6">
            
            {/* Saturation score widget */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Market Saturation</h3>
              {activeReport && (
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-black text-white">{activeReport.scores.competitionScore}%</span>
                    <span className="text-xs font-semibold text-indigo-400 uppercase">Density Index</span>
                  </div>
                  <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full"
                      style={{ width: `${activeReport.scores.competitionScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    A density index of {activeReport.scores.competitionScore}% indicates moderate competition. 
                    Targeting a niche demographic pricing model is advised to insulate your margins.
                  </p>
                </div>
              )}
            </div>

            {/* List of competitors */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Nearby Competitors</h3>
              <div className="space-y-3 overflow-y-auto max-h-96 pr-1">
                {competitors.map((comp, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveCompIdx(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      activeCompIdx === idx 
                        ? 'bg-indigo-600/10 border-indigo-500/30' 
                        : 'bg-white/2 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-white">{comp.name}</h4>
                      <span className="text-[10px] text-indigo-400 font-semibold">{comp.distance}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-[10px] text-gray-500">Popularity: {comp.popularity}</span>
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {comp.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
