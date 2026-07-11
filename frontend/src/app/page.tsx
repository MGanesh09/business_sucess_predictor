'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  TrendingUp, MapPin, ShieldAlert, Cpu, BarChart3, Users2, Clock, 
  Map, Sparkles, ChevronDown, Check, Star, ArrowRight, Play
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock FAQ database
const FAQs = [
  {
    q: "How does the AI Success Predictor calculate the score?",
    a: "Our models combine geospatial data from Google Maps with historical success/failure databases. We analyze nearby competition density, road widths, accessibility, local foot traffic peaks, and customer demographic spending levels to run real-time regression models and produce success probability scores."
  },
  {
    q: "Do I need a Google Maps API Key to run predictions?",
    a: "No! Out of the box, our system utilizes a seamless OpenStreetMap/Leaflet integration for address geocoding and location plotting. You can optionally link your own Google Maps API keys in settings to unlock satellite image features and advanced street view analysis."
  },
  {
    q: "What types of businesses are supported?",
    a: "We support over 15 retail and service categories, including Cafes, Restaurants, Salons, Gyms, Pharmacies, hotels, supermarkets, and bookstores. Our machine learning models are pre-trained specifically on retail patterns and consumer behavior."
  },
  {
    q: "Can I download my report as a PDF?",
    a: "Absolutely! Every prediction saves a comprehensive dashboard report. You can click 'Download PDF' at any time to generate a print-ready vector report containing all scores, graphs, tables, and AI recommendations."
  }
];

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [stats, setStats] = useState({ predictions: 124500, accuracy: 94.2, profitBoost: 28.5 });

  // Micro-animation for statistics counter
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        predictions: prev.predictions + Math.floor(Math.random() * 3) + 1,
        accuracy: 94.8,
        profitBoost: 32.4
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-mesh flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl -z-20 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl -z-20 pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-red-500/20 text-red-300 text-xs font-semibold mb-6 shadow-md"
        >
          <Sparkles className="h-4 w-4 text-red-400 animate-pulse" />
          Next-Gen Geomarketing Machine Learning
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-4xl text-white"
        >
          Know If Your Business Will Succeed <br />
          <span className="bg-gradient-to-r from-red-500 via-red-400 to-indigo-500 bg-clip-text text-transparent">
            Before You Sign the Lease
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-gray-400 max-w-3xl leading-relaxed"
        >
          Pinpoint your location, outline your budget, and harness the power of neural demographic analysis and competitor density models to forecast foot traffic, revenue, and overall viability.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/auth/signup" className="glass-button-primary text-base flex items-center justify-center gap-2 py-3 px-8 shadow-lg">
            Start Free Prediction
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="#demo" className="glass-button-secondary text-base flex items-center justify-center gap-2 py-3 px-8">
            <Play className="h-4 w-4 text-red-400 fill-red-400" />
            Watch Video Demo
          </Link>
        </motion.div>

        {/* HERO ANIMATED STATISTICS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 w-full grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl"
        >
          <div className="glass-panel py-8 px-6 rounded-2xl border-white/5 flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {stats.predictions.toLocaleString()}+
            </span>
            <span className="mt-2 text-xs font-semibold text-gray-400 tracking-wider uppercase">Predictions Simulated</span>
          </div>
          <div className="glass-panel py-8 px-6 rounded-2xl border-white/5 flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-red-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
              {stats.accuracy}%
            </span>
            <span className="mt-2 text-xs font-semibold text-gray-400 tracking-wider uppercase">ML Model Accuracy</span>
          </div>
          <div className="glass-panel py-8 px-6 rounded-2xl border-white/5 flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              +{stats.profitBoost}%
            </span>
            <span className="mt-2 text-xs font-semibold text-gray-400 tracking-wider uppercase">Avg. Revenue Increase</span>
          </div>
        </motion.div>
      </section>

      {/* INTERACTIVE PREVIEW / VIDEO DEMO SECTION */}
      <section id="demo" className="py-20 bg-black/25 relative border-y border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Intuitive Interface, Unmatched Insights
            </h2>
            <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">
              Simulate rent efficiency, count nearby transport hubs, map competitor hotspots, and converse with our trained AI business advisor instantly.
            </p>
          </div>

          {/* Apple-Style Glass Dashboard Preview */}
          <div className="glass-panel p-3 sm:p-5 rounded-3xl border-white/10 shadow-2xl relative group overflow-hidden max-w-5xl mx-auto">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="bg-[#030712] rounded-2xl overflow-hidden border border-gray-900 shadow-inner flex flex-col aspect-video relative justify-center items-center">
              {/* Fake dashboard UI overlay */}
              <div className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200')" }} />
              
              <div className="z-10 flex flex-col items-center gap-4 text-center px-4">
                <div className="p-4 bg-indigo-600/90 text-white rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <Play className="h-8 w-8 fill-white ml-1" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Watch Platform Walkthrough</h3>
                  <p className="text-xs text-gray-400 mt-1">See how to run a prediction and generate supplier grids in under 3 minutes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Complete Toolkit for Location Strategy
          </h2>
          <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">
            We query over 30 variables per location point to deliver granular projections you can count on.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col items-start text-left">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 mb-6">
              <Map className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Geospatial Demographics</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Estimate age distributions, population levels, occupations (students vs working professionals), and consumer spending power centered exactly on your coordinates.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col items-start text-left">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 mb-6">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Revenue & Profit Forecasts</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Get detailed daily, monthly, and yearly revenue and net profit predictions tailored to your specific business budget, product pricing, and operating rent.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col items-start text-left">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 mb-6">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Competitive Hotspots</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Analyze surrounding business densities and average ratings. Predict market saturation score and discover wholesale suppliers and equipment vendors.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-black/15 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Succeeding in the Real World
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Hear from entrepreneurs who chose their locations using our predictive analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Predictor AI saved us from signing a lease in a competitor-saturated cafe zone. We pivoted 3 blocks north based on the high location score and now operate at a 35% margin.",
                author: "Sarah Jenkins",
                role: "Founder, Bloom Espresso",
                rating: 5,
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
              },
              {
                quote: "The foot traffic forecasting matches our checkout counters with 96% accuracy. It tells us exactly how to adjust staff counts between morning and evening shifts.",
                author: "Marco Rossini",
                role: "Owner, Iron Grind Gym",
                rating: 5,
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
              },
              {
                quote: "Starting a bakery requires heavy capital. The ROI and break-even calculations helped us secure a bank loan. The underwriters were highly impressed with the AI report.",
                author: "Eliza Vance",
                role: "Co-owner, Sweet Crumb Bakery",
                rating: 5,
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150"
              }
            ].map((t, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-2xl flex flex-col justify-between text-left">
                <div>
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
                  </div>
                  <p className="text-sm text-gray-300 italic leading-relaxed">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <img src={t.image} alt={t.author} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.author}</h4>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Pricing Plans For Every Scale</h2>
          <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your growth journey. Get started completely free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between border-white/5 text-left">
            <div>
              <h3 className="text-lg font-bold text-white">Starter</h3>
              <p className="text-xs text-gray-400 mt-1">Test the waters and run simple checks.</p>
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-sm font-semibold text-gray-400 ml-1">/ forever</span>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-2.5 text-sm text-gray-300"><Check className="h-4 w-4 text-emerald-400" /> 3 Predictions / month</li>
                <li className="flex items-center gap-2.5 text-sm text-gray-300"><Check className="h-4 w-4 text-emerald-400" /> Basic Success Probabilities</li>
                <li className="flex items-center gap-2.5 text-sm text-gray-300"><Check className="h-4 w-4 text-emerald-400" /> Standard Maps View</li>
                <li className="flex items-center gap-2.5 text-sm text-gray-500 line-through"><Check className="h-4 w-4" /> Download PDF Reports</li>
              </ul>
            </div>
            <Link href="/auth/signup" className="glass-button-secondary text-center text-sm py-2.5 mt-8 w-full">
              Get Started Free
            </Link>
          </div>

          {/* Growth Plan */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between border-red-500/30 relative text-left">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-red-600 text-white text-xs font-semibold py-1 px-3 rounded-full">
              Most Popular
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Growth</h3>
              <p className="text-xs text-gray-400 mt-1">Perfect for active founders and franchises.</p>
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-white">$49</span>
                <span className="text-sm font-semibold text-gray-400 ml-1">/ month</span>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-2.5 text-sm text-gray-300"><Check className="h-4 w-4 text-red-400" /> 25 Predictions / month</li>
                <li className="flex items-center gap-2.5 text-sm text-gray-300"><Check className="h-4 w-4 text-red-400" /> Demographics & Foot Traffic</li>
                <li className="flex items-center gap-2.5 text-sm text-gray-300"><Check className="h-4 w-4 text-red-400" /> Competitor 热力图 (Density Map)</li>
                <li className="flex items-center gap-2.5 text-sm text-gray-300"><Check className="h-4 w-4 text-red-400" /> Premium Downloadable PDFs</li>
                <li className="flex items-center gap-2.5 text-sm text-gray-300"><Check className="h-4 w-4 text-red-400" /> Conversational AI Assistant</li>
              </ul>
            </div>
            <Link href="/auth/signup" className="glass-button-primary text-center text-sm py-2.5 mt-8 w-full">
              Upgrade to Growth
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between border-white/5 text-left">
            <div>
              <h3 className="text-lg font-bold text-white">Enterprise</h3>
              <p className="text-xs text-gray-400 mt-1">For corporate developers and investors.</p>
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-white">$199</span>
                <span className="text-sm font-semibold text-gray-400 ml-1">/ month</span>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-2.5 text-sm text-gray-300"><Check className="h-4 w-4 text-emerald-400" /> Unlimited Predictions</li>
                <li className="flex items-center gap-2.5 text-sm text-gray-300"><Check className="h-4 w-4 text-emerald-400" /> Custom API Access</li>
                <li className="flex items-center gap-2.5 text-sm text-gray-300"><Check className="h-4 w-4 text-emerald-400" /> Satellite Image Analysis</li>
                <li className="flex items-center gap-2.5 text-sm text-gray-300"><Check className="h-4 w-4 text-emerald-400" /> Advanced Multi-user Support</li>
                <li className="flex items-center gap-2.5 text-sm text-gray-300"><Check className="h-4 w-4 text-emerald-400" /> Dedicated Account Manager</li>
              </ul>
            </div>
            <Link href="/auth/signup" className="glass-button-secondary text-center text-sm py-2.5 mt-8 w-full">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 bg-black/10 border-t border-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
            <p className="mt-3 text-sm text-gray-400">Everything you need to know about our predictive models and mapping data.</p>
          </div>

          <div className="space-y-4 text-left">
            {FAQs.map((faq, idx) => (
              <div key={idx} className="glass-panel rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-white text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-indigo-400 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 border-t border-white/5">
                    <p className="text-sm text-gray-400 leading-relaxed leading-6">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
