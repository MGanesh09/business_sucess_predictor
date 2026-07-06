'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { api } from '../../../../lib/api';
import { 
  FileText, Download, MessageSquare, MapPin, BarChart3, 
  DollarSign, TrendingUp, Users, ShieldAlert, Award, Star, 
  Layers, Clock, Truck, ShieldCheck, HelpCircle, ArrowLeft
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie, Legend, RadialBarChart, RadialBar, CartesianGrid
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Dynamically load Map selector (read-only view)
const MapSelector = dynamic(() => import('../../../../components/MapSelector'), { ssr: false });

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

export default function ReportDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await api.get(`/predictions/detail/${id}`);
        setReport(data);
      } catch (err) {
        console.error(err);
        alert('Failed to retrieve prediction report.');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReport();
  }, [id, router]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const element = document.getElementById('report-pdf-content');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`Success_Predictor_Report_${report.businessName.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Error generating PDF: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/3" />
        <div className="h-4 bg-gray-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 h-96 bg-gray-800 rounded-xl" />
          <div className="h-96 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Demographics Recharts Data
  const ageData = Object.entries(report.demographics.ageGroups || {}).map(([name, value]) => ({ name, value: value as any }));
  const incomeData = Object.entries(report.demographics.incomeLevels || {}).map(([name, value]) => ({ name, value: value as any }));
  const occupationData = Object.entries(report.demographics.occupation || {}).map(([name, value]) => ({ name, value: value as any }));
  
  // Foot Traffic Recharts Data
  const trafficData = [
    { name: 'Morning', traffic: report.footTraffic.morning },
    { name: 'Afternoon', traffic: report.footTraffic.afternoon },
    { name: 'Evening', traffic: report.footTraffic.evening },
    { name: 'Night', traffic: report.footTraffic.night },
  ];

  // Radial Bar Data for Scores
  const radialData = [
    { name: 'Market Score', value: report.successPrediction.marketScore, fill: '#10b981' },
    { name: 'Growth Score', value: report.successPrediction.growthScore, fill: '#a855f7' },
    { name: 'Investment Score', value: report.successPrediction.investmentScore, fill: '#f59e0b' },
    { name: 'Business Score', value: report.successPrediction.businessScore, fill: '#6366f1' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleDownloadPDF} 
            disabled={downloading}
            className="glass-button-secondary py-2.5 text-xs flex items-center gap-2 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {downloading ? 'Compiling PDF...' : 'Download PDF Report'}
          </button>
          <Link 
            href={`/dashboard/ai-assistant?predictionId=${report._id}`}
            className="glass-button-primary py-2.5 text-xs flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Consult AI Advisor
          </Link>
        </div>
      </div>

      {/* Main Print Container */}
      <div id="report-pdf-content" className="space-y-8 bg-[#030712] p-2 rounded-2xl">
        
        {/* Report Identification Title Card */}
        <div className="glass-panel p-8 rounded-3xl border-white/5 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">Location analysis report</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{report.businessName}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-400">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-indigo-400" /> {report.location.address}</span>
              <span className="bg-white/5 px-2.5 py-0.5 rounded text-xs text-indigo-300 font-medium">{report.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-2xl">
            <div className="relative flex justify-center items-center">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-pulse absolute" />
              <span className="text-2xl font-black text-indigo-300">{report.successPrediction.probability}%</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">Success Probability</span>
              <span className="text-lg font-extrabold text-white">Grade {report.successPrediction.overallRating}</span>
            </div>
          </div>
        </div>

        {/* Interactive Tabs Menu */}
        <div className="flex border-b border-white/5 gap-2 overflow-x-auto pb-px">
          {['summary', 'geospatial', 'financial', 'suppliers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 shrink-0 ${
                activeTab === tab 
                  ? 'border-indigo-500 text-white bg-indigo-500/5' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/2'
              }`}
            >
              {tab === 'summary' && 'Viability Overview'}
              {tab === 'geospatial' && 'Geospatial & Demographics'}
              {tab === 'financial' && 'Financial & Traffic forecasts'}
              {tab === 'suppliers' && 'Suppliers & Event Impacts'}
            </button>
          ))}
        </div>

        {/* Tab CONTENT: Summary */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Success Scores Radial bar */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-white/5 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Neural Success Index Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="h-60 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={10} data={radialData}>
                      <RadialBar label={{ position: 'insideStart', fill: '#fff' }} background dataKey="value" />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Business Score', desc: 'Category-to-budget feasibility match', val: report.successPrediction.businessScore, color: 'bg-indigo-500' },
                    { name: 'Investment Score', desc: 'Payback speed & profitability expectations', val: report.successPrediction.investmentScore, color: 'bg-amber-500' },
                    { name: 'Growth Score', desc: 'Regional commercial development trend', val: report.successPrediction.growthScore, color: 'bg-purple-500' },
                    { name: 'Market Score', desc: 'Competitive landscape insulation', val: report.successPrediction.marketScore, color: 'bg-emerald-500' },
                  ].map((score) => (
                    <div key={score.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${score.color}`} />
                          {score.name}
                        </span>
                        <span className="text-white">{score.val}/100</span>
                      </div>
                      <p className="text-[10px] text-gray-500">{score.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overall Rating Card */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Viability Rating</h3>
                  <Award className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">{report.successPrediction.overallRating}</span>
                  <span className="text-xs text-emerald-400 font-bold">Low Risk ({report.successPrediction.riskPercentage}%)</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Our neural classifier rates this location as a highly stable commercial spot with high accessibility index. 
                  Expected break-even is projected within <strong className="text-indigo-300 font-semibold">{report.recommendations.breakEvenMonths} months</strong>.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Accessibility Score:</span>
                  <span className="font-bold text-white">{report.scores.accessibilityScore}/100</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Visibility Score:</span>
                  <span className="font-bold text-white">{report.scores.visibilityScore}/100</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Competition Index:</span>
                  <span className="font-bold text-white">{report.scores.competitionScore}/100</span>
                </div>
              </div>
            </div>
            
          </div>
        )}

        {/* Tab CONTENT: Geospatial & Demographics */}
        {activeTab === 'geospatial' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Map display */}
            <div data-html2canvas-ignore="true" className="lg:col-span-2 glass-panel p-6 rounded-2xl border-white/5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Geographic Map Plot</h3>
              <MapSelector 
                onLocationSelect={() => {}} 
                initialLat={report.location.lat} 
                initialLng={report.location.lng} 
              />
            </div>

            {/* Demographics breakdown */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Demographic metrics</h3>
                <span className="text-xs text-gray-500 block">Radius 1.5km centered</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-white/2 rounded-xl px-4 border border-white/5">
                <span className="text-xs text-gray-400 font-medium">Population Est.</span>
                <span className="text-lg font-bold text-indigo-400">{report.demographics.population.toLocaleString()}</span>
              </div>
              <div className="h-48 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ageData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                      {ageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] justify-center">
                {ageData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-gray-400">{entry.name} ({entry.value}%)</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab CONTENT: Financial & Traffic */}
        {activeTab === 'financial' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Traffic charts */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-white/5 space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Foot Traffic Distribution</h3>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" label={{ value: 'Hourly Count', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', color: '#fff', border: 'none' }} />
                    <Area type="monotone" dataKey="traffic" stroke="#6366f1" fillOpacity={1} fill="url(#colorTraffic)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial cards */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Financial Forecasts</h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-gray-400">Monthly Revenue:</span>
                  <span className="text-sm font-bold text-white">${report.revenuePrediction.monthly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-gray-400">Monthly Profit:</span>
                  <span className="text-sm font-bold text-emerald-400">${report.revenuePrediction.monthlyProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-gray-400">Yearly Revenue:</span>
                  <span className="text-sm font-bold text-white">${report.revenuePrediction.yearly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-gray-400">Yearly Profit:</span>
                  <span className="text-sm font-bold text-emerald-400">${report.revenuePrediction.yearlyProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-gray-400">Estimated ROI:</span>
                  <span className="text-sm font-bold text-indigo-400">{report.recommendations.roi}%</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-xs text-gray-400">Net Profit Margin:</span>
                  <span className="text-sm font-bold text-indigo-400">{report.recommendations.margin}%</span>
                </div>
              </div>
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/10 text-[10px] text-indigo-300 rounded-xl leading-relaxed">
                Calculations based on an average product cost structure (approx. 42% cost of goods sold).
              </div>
            </div>
            
          </div>
        )}

        {/* Tab CONTENT: Suppliers & Events */}
        {activeTab === 'suppliers' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Suppliers grid */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-400" />
                Recommended Suppliers & Vendors
              </h3>
              <div className="divide-y divide-white/5">
                {report.suppliers.map((s: any, idx: number) => (
                  <div key={idx} className="flex justify-between py-3">
                    <div>
                      <h4 className="text-xs font-bold text-white">{s.name}</h4>
                      <span className="text-[10px] text-gray-500">{s.type}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-indigo-300 block">{s.distance}</span>
                      <span className="text-[10px] text-amber-400 flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400" /> {s.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Local events & satellite */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                Satellite & Event Variables
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                  <span className="block text-[10px] uppercase font-semibold text-gray-500">Road Width</span>
                  <span className="text-sm font-bold text-white">{report.satellite.roadWidth} meters</span>
                </div>
                <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                  <span className="block text-[10px] uppercase font-semibold text-gray-500">Parking Space</span>
                  <span className="text-sm font-bold text-white">{report.satellite.parkingSpace}</span>
                </div>
                <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                  <span className="block text-[10px] uppercase font-semibold text-gray-500">Green Area</span>
                  <span className="text-sm font-bold text-white">{report.satellite.greenArea}%</span>
                </div>
                <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                  <span className="block text-[10px] uppercase font-semibold text-gray-500">Regional Development</span>
                  <span className="text-sm font-bold text-white">{report.satellite.developmentLevel}</span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="block text-xs font-semibold text-gray-400 uppercase">Local Events Impact Matrix</span>
                <div className="space-y-2">
                  {report.events.map((e: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5">
                      <span className="text-gray-300 font-medium">{e.name}</span>
                      <div className="flex gap-2">
                        <span className="text-[10px] text-gray-500">{e.frequency}</span>
                        <span className="font-semibold text-emerald-400 text-[10px]">{e.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
