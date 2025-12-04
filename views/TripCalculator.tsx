import React, { useState, useEffect } from 'react';
import { Calculator, Calendar, Smartphone, Wifi, Map, Video, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Language, SimPlan, Country } from '../types';
import { storageService } from '../services/storageService';
import { TRANSLATIONS } from '../constants';

interface TripCalculatorProps {
  lang: Language;
}

export const TripCalculator: React.FC<TripCalculatorProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [duration, setDuration] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  
  // Usage Metrics (Hours per day)
  const [mapsUsage, setMapsUsage] = useState<number>(1);
  const [videoUsage, setVideoUsage] = useState<number>(1);
  const [socialUsage, setSocialUsage] = useState<number>(2);
  const [browseUsage, setBrowseUsage] = useState<number>(2);
  
  const [result, setResult] = useState<{ totalGB: number; bestPlan: SimPlan | null } | null>(null);

  useEffect(() => {
    const init = async () => {
        try {
            const c = await storageService.getCountries();
            setCountries(c);
            if (c.length > 0) setSelectedCountry(c[0].id);
        } finally {
            setLoading(false);
        }
    };
    init();
  }, []);

  const calculate = async () => {
    setCalculating(true);
    setResult(null); // Clear previous result to show "working" state
    
    // Estimations (GB per hour)
    const MAPS_GB = 0.06;
    const VIDEO_GB = 1.0;
    const SOCIAL_GB = 0.15;
    const BROWSE_GB = 0.05;

    const dailyGB = 
      (mapsUsage * MAPS_GB) + 
      (videoUsage * VIDEO_GB) + 
      (socialUsage * SOCIAL_GB) + 
      (browseUsage * BROWSE_GB);

    const totalGBNeeded = Math.ceil(dailyGB * duration);

    try {
        // Find Best Plan
        const operators = await storageService.getOperators(selectedCountry);
        let allPlans: SimPlan[] = [];
        
        // Fetch plans in parallel
        const planPromises = operators.map(op => storageService.getPlans(op.id));
        const results = await Promise.all(planPromises);
        results.forEach(p => allPlans.push(...p));

        // Filter by Validity first
        const validPlans = allPlans.filter(p => p.validity_days >= duration);
        
        // Find plans that have enough data
        const suitablePlans = validPlans.filter(p => p.data_gb === -1 || p.data_gb >= totalGBNeeded);
        
        // Sort by price (cheapest first)
        suitablePlans.sort((a, b) => a.price - b.price);

        // Simulate "Thinking" time for the algorithm
        await new Promise(r => setTimeout(r, 800));

        setResult({
            totalGB: totalGBNeeded,
            bestPlan: suitablePlans.length > 0 ? suitablePlans[0] : null
        });
    } catch (e) {
        console.error(e);
    } finally {
        setCalculating(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center">
                <Calculator className="mr-3 text-primary" size={32} />
                {t.calculator}
            </h1>
            <p className="text-slate-500">
                Estimate your data needs and find the perfect plan for your trip.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="font-bold text-xl text-slate-800 mb-6 border-b pb-2">Trip Details</h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                        <select 
                            className="w-full border rounded-lg p-3 bg-slate-50"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                        >
                            {countries.map(c => (
                                <option key={c.id} value={c.id}>{lang === 'en' ? c.name_en : c.name_es}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                            <Calendar size={16} className="mr-1" /> Trip Duration (Days): <span className="ml-auto font-bold text-primary">{duration}</span>
                        </label>
                        <input 
                            type="range" min="1" max="90" 
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-medium text-slate-700 mb-4">Daily Usage Habits (Hours/Day)</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500 flex items-center mb-1">
                                    <Video size={14} className="mr-1" /> Video Streaming (YouTube, Netflix)
                                    <span className="ml-auto font-bold">{videoUsage}h</span>
                                </label>
                                <input type="range" min="0" max="8" step="0.5"
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                                    value={videoUsage} onChange={e => setVideoUsage(Number(e.target.value))} />
                            </div>
                            
                            <div>
                                <label className="text-sm text-gray-500 flex items-center mb-1">
                                    <Map size={14} className="mr-1" /> Maps & Navigation
                                    <span className="ml-auto font-bold">{mapsUsage}h</span>
                                </label>
                                <input type="range" min="0" max="10" step="0.5"
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                                    value={mapsUsage} onChange={e => setMapsUsage(Number(e.target.value))} />
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 flex items-center mb-1">
                                    <Smartphone size={14} className="mr-1" /> Social Media
                                    <span className="ml-auto font-bold">{socialUsage}h</span>
                                </label>
                                <input type="range" min="0" max="12" step="0.5"
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    value={socialUsage} onChange={e => setSocialUsage(Number(e.target.value))} />
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 flex items-center mb-1">
                                    <Wifi size={14} className="mr-1" /> Web Browsing & Email
                                    <span className="ml-auto font-bold">{browseUsage}h</span>
                                </label>
                                <input type="range" min="0" max="12" step="0.5"
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-500"
                                    value={browseUsage} onChange={e => setBrowseUsage(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={calculate}
                        disabled={calculating}
                        className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-700 transition-colors shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {calculating ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="ml-2" size={18} />}
                        {calculating ? 'Analyzing...' : 'Calculate My Plan'}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-center min-h-[400px]">
                {calculating ? (
                    <div className="flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin mb-4 text-white" size={48} />
                        <p className="text-blue-100 animate-pulse">Scanning best rates...</p>
                    </div>
                ) : !result ? (
                    <div className="text-center opacity-80">
                        <Calculator size={64} className="mx-auto mb-4 animate-pulse" />
                        <h3 className="text-xl font-bold">Ready to Calculate</h3>
                        <p className="mt-2 text-blue-100">Adjust parameters and click calculate to see your personalized recommendation.</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <p className="text-blue-200 font-medium uppercase tracking-wider text-sm">Estimated Data Need</p>
                            <div className="text-6xl font-bold mt-2">{result.totalGB} <span className="text-2xl">GB</span></div>
                            <p className="text-sm opacity-70 mt-1">For {duration} days in total</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <CheckCircle className="text-green-400 mr-2" /> Recommended Plan
                            </h3>
                            
                            {result.bestPlan ? (
                                <div>
                                    <div className="text-2xl font-bold">{result.bestPlan.name}</div>
                                    <div className="text-sm opacity-80 mb-4">by {result.bestPlan.operator_id}</div>
                                    
                                    <div className="flex items-end justify-between border-t border-white/10 pt-4">
                                        <div>
                                            <div className="text-3xl font-bold text-yellow-300">
                                                {result.bestPlan.price} {result.bestPlan.currency}
                                            </div>
                                            <div className="text-xs opacity-70">Total Cost</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold">
                                                {result.bestPlan.data_gb === -1 ? 'Unlimited' : `${result.bestPlan.data_gb} GB`}
                                            </div>
                                            <div className="text-xs opacity-70">{result.bestPlan.validity_days} Days Validity</div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                                        {result.bestPlan.sim_type === 'eSIM' && <span className="bg-purple-500/50 px-2 py-1 rounded text-xs">eSIM</span>}
                                        {result.bestPlan.speed_5g && <span className="bg-blue-500/50 px-2 py-1 rounded text-xs">5G</span>}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-xl font-bold text-red-200">No suitable plan found.</p>
                                    <p className="text-sm opacity-80 mt-2">Try reducing your usage or checking a different country.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};