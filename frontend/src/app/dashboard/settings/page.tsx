'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { Settings, User, Lock, Map, Save, CheckCircle2 } from 'lucide-react';

const AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
];

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setName(user.name || '');
    setEmail(user.email || '');
    setProfilePic(user.profilePicture || AVATARS[0]);
    
    // Load maps key from localstorage mock
    const key = localStorage.getItem('google_maps_key') || '';
    setGoogleMapsKey(key);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    // Save profile update to localstorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = {
      ...user,
      name,
      profilePicture: profilePic
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('google_maps_key', googleMapsKey);
    
    // Alert navbar immediately
    window.dispatchEvent(new Event('storage'));

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-indigo-400" />
          System Settings
        </h1>
        <p className="text-gray-400 text-sm mt-1">Configure your personal profile details and third-party API credentials.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded-xl text-sm flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card & Avatars */}
        <div className="md:col-span-1 glass-panel p-6 rounded-2xl border-white/5 flex flex-col items-center text-center space-y-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2.5 w-full">
            Profile Avatar
          </h3>

          <img 
            src={profilePic} 
            alt={name} 
            className="h-28 w-28 rounded-full object-cover border-2 border-indigo-500/30 shadow-lg"
          />

          <div className="space-y-2">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Choose Avatar</span>
            <div className="flex gap-2">
              {AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProfilePic(av)}
                  className={`h-9 w-9 rounded-full overflow-hidden border transition-all ${
                    profilePic === av ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20' : 'border-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={av} alt={`avatar-${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form fields: Account Info & maps key */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Account Profile info */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2.5 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-400" />
              Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full glass-input text-xs opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Update Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full glass-input text-xs pl-9"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Third party credentials */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2.5 flex items-center gap-2">
              <Map className="h-4 w-4 text-indigo-400" />
              API Settings
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Google Maps API Key</label>
              <input
                type="text"
                value={googleMapsKey}
                onChange={e => setGoogleMapsKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full glass-input text-xs font-mono"
              />
              <span className="block text-[10px] text-gray-500 mt-1.5 leading-normal">
                By default, Leaflet OpenStreetMap is utilized. Providing a valid Google Maps token enables satellite overlay features and street view parameters.
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="glass-button-primary py-3 text-xs flex items-center justify-center gap-2 font-bold px-6 shadow-md float-right"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>

        </div>

      </form>
    </div>
  );
}
