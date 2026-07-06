'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { api } from '../../../lib/api';
import { 
  Building2, MapPin, DollarSign, Users, Info, 
  Target, Sparkles, ChevronRight, HelpCircle
} from 'lucide-react';
import { getCurrencySetting, CurrencyType } from '../../../lib/currency';

// Dynamically load the Leaflet MapSelector with SSR disabled to prevent node reference errors
const MapSelector = dynamic(() => import('../../../components/MapSelector'), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full bg-gray-900 rounded-xl flex items-center justify-center border border-white/5">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-500">Initializing interactive maps...</span>
      </div>
    </div>
  )
});

const CATEGORIES = [
  'Cafe', 'Restaurant', 'Salon', 'Gym', 'Medical Shop', 'Bakery', 
  'Hotel', 'Supermarket', 'Clothing Store', 'Electronics', 'Coaching Center', 
  'Book Store', 'Pharmacy', 'Hospital', 'Office', 'Other'
];

const STAGES = [
  'Pinpointing location parameters...',
  'Extracting accessibility and visibility indices...',
  'Compiling surrounding competitor density...',
  'Running neural demographic projections...',
  'Applying RandomForest & XGBoost regressors...',
  'Structuring recommendation matrices...'
];

export default function NewPredictionPage() {
  const router = useRouter();
  
  // Form State
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Cafe');
  const [budget, setBudget] = useState('');
  const [shopArea, setShopArea] = useState('');
  const [rent, setRent] = useState('');
  const [employeesCount, setEmployeesCount] = useState('2');
  const [expectedProductPrice, setExpectedProductPrice] = useState('10');
  const [expectedDailyCustomers, setExpectedDailyCustomers] = useState('50');
  const [description, setDescription] = useState('');
  const [goals, setGoals] = useState('');
  const [currency, setCurrency] = useState<CurrencyType>('USD');

  useEffect(() => {
    setCurrency(getCurrencySetting());
  }, []);
  
  // Location State
  const [lat, setLat] = useState(37.7749);
  const [lng, setLng] = useState(-122.4194);
  const [address, setAddress] = useState('San Francisco, CA');
  
  // Loader UI State
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  const handleLocationSelect = (selectedLat: number, selectedLng: number, selectedAddress: string) => {
    setLat(selectedLat);
    setLng(selectedLng);
    setAddress(selectedAddress);
  };

  const cycleStages = (callback: () => void) => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index < STAGES.length) {
        setStageIndex(index);
      } else {
        clearInterval(interval);
        callback();
      }
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !budget || !shopArea || !rent) {
      alert('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    setStageIndex(0);

    const conversionFactor = currency === 'INR' ? 83 : 1;
    const payload = {
      businessName,
      category,
      budget: Number(budget) / conversionFactor,
      shopArea: Number(shopArea),
      rent: Number(rent) / conversionFactor,
      employeesCount: Number(employeesCount),
      expectedProductPrice: Number(expectedProductPrice) / conversionFactor,
      expectedDailyCustomers: Number(expectedDailyCustomers),
      description,
      goals,
      location: { lat, lng, address },
    };

    cycleStages(async () => {
      try {
        const response = await api.post('/predictions/create', payload);
        router.push(`/dashboard/reports/${response._id}`);
      } catch (err: any) {
        alert(err.message || 'Error occurred generating success prediction');
        setLoading(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center text-center p-6">
        <div className="glass-panel p-10 rounded-3xl border-white/5 max-w-lg w-full flex flex-col items-center shadow-2xl relative overflow-hidden">
          {/* Pulsing glow background */}
          <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl scale-75 animate-pulse" />
          
          <div className="relative mb-8">
            {/* Spinning ring */}
            <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
            <Sparkles className="h-8 w-8 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Simulating Business Performance</h2>
          <p className="text-xs text-indigo-400 uppercase tracking-widest font-mono font-bold animate-pulse mb-6">
            Stage {stageIndex + 1} of {STAGES.length}
          </p>

          <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden mb-6 border border-white/5">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
            />
          </div>

          <span className="text-sm font-semibold text-gray-300 font-mono">
            {STAGES[stageIndex]}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-indigo-400" />
          New Location Simulation
        </h1>
        <p className="text-gray-400 text-sm mt-1">Configure your business parameters and select target coordinates to predict viability.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Fields: Business config */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
              1. Business Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Business Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. Blue Bottle Cafe"
                    className="w-full glass-input text-sm pl-10"
                  />
                  <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Business Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full glass-input text-sm focus:outline-none focus:border-indigo-500 bg-gray-950/80 cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-gray-950 text-white">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Budget / Investment ({currency === 'INR' ? '₹' : '$'}) *</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder={currency === 'INR' ? "8300000" : "100000"}
                    className="w-full glass-input text-sm pl-10 font-mono"
                  />
                  {currency === 'INR' ? (
                    <span className="absolute left-3.5 top-3.5 text-xs font-extrabold text-gray-500">₹</span>
                  ) : (
                    <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Shop Area (Sq. Ft) *</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={shopArea}
                    onChange={e => setShopArea(e.target.value)}
                    placeholder="1200"
                    className="w-full glass-input text-sm pl-4 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Monthly Rent ({currency === 'INR' ? '₹' : '$'}) *</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={rent}
                    onChange={e => setRent(e.target.value)}
                    placeholder={currency === 'INR' ? "200000" : "2500"}
                    className="w-full glass-input text-sm pl-10 font-mono"
                  />
                  {currency === 'INR' ? (
                    <span className="absolute left-3.5 top-3.5 text-xs font-extrabold text-gray-500">₹</span>
                  ) : (
                    <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Staff Count</label>
                <div className="relative">
                  <input
                    type="number"
                    value={employeesCount}
                    onChange={e => setEmployeesCount(e.target.value)}
                    placeholder="2"
                    className="w-full glass-input text-sm pl-10 font-mono"
                  />
                  <Users className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Product Avg Price ({currency === 'INR' ? '₹' : '$'})</label>
                <div className="relative">
                  <input
                    type="number"
                    value={expectedProductPrice}
                    onChange={e => setExpectedProductPrice(e.target.value)}
                    placeholder={currency === 'INR' ? "800" : "10"}
                    className="w-full glass-input text-sm pl-10 font-mono"
                  />
                  {currency === 'INR' ? (
                    <span className="absolute left-3.5 top-3.5 text-xs font-extrabold text-gray-500">₹</span>
                  ) : (
                    <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Expected Customers/day</label>
                <div className="relative">
                  <input
                    type="number"
                    value={expectedDailyCustomers}
                    onChange={e => setExpectedDailyCustomers(e.target.value)}
                    placeholder="50"
                    className="w-full glass-input text-sm pl-4 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Business Description</label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe your layout, targeted menu or service offering, and unique value proposition..."
                    className="w-full glass-input text-sm pl-10 pt-2.5 resize-none"
                  />
                  <Info className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Primary Business Goals</label>
                <div className="relative">
                  <textarea
                    value={goals}
                    onChange={e => setGoals(e.target.value)}
                    rows={2}
                    placeholder="e.g. Achieve break-even within 6 months, scale to 3 locations within 2 years..."
                    className="w-full glass-input text-sm pl-10 pt-2.5 resize-none"
                  />
                  <Target className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location selector sidebar card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6 flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
              2. Location Coordinates
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Target Address *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street name, City"
                  className="w-full glass-input text-sm pl-10"
                />
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
              </div>
            </div>

            {/* Embed Leaflet dynamic Map */}
            <MapSelector onLocationSelect={handleLocationSelect} />

            <button
              type="submit"
              className="w-full glass-button-primary py-3 text-sm flex items-center justify-center gap-2 font-bold shadow-lg"
            >
              Analyze Viability
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
