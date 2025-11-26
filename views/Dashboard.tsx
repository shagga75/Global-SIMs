import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { User, Language } from '../types';
import { Award, Zap, TrendingUp, Map } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

export const Dashboard: React.FC<{ lang: Language }> = ({ lang }) => {
  const [user, setUser] = useState<User>(storageService.getUser());
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Poll for changes (simple sync for demo)
    const interval = setInterval(() => {
        setUser(storageService.getUser());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-8 shadow-md flex flex-col md:flex-row items-center md:space-x-8 border-l-8 border-yellow-400">
         <div className="bg-slate-100 p-6 rounded-full">
            <Award size={64} className="text-yellow-500" />
         </div>
         <div className="text-center md:text-left mt-4 md:mt-0 flex-grow">
            <h1 className="text-3xl font-bold text-slate-800">{user.name}</h1>
            <p className="text-slate-500 uppercase tracking-wide font-bold mt-1">{user.level}</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-4 overflow-hidden">
               <div 
                 className="bg-yellow-400 h-4 rounded-full transition-all duration-1000" 
                 style={{ width: `${Math.min((user.points / 1000) * 100, 100)}%` }}
               ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
               <span>0 pts</span>
               <span>{user.points} / 1000 pts to Legend</span>
            </div>
         </div>
         <div className="text-center mt-6 md:mt-0 bg-blue-50 p-4 rounded-xl">
            <div className="text-4xl font-bold text-primary">{user.contributions}</div>
            <div className="text-sm text-blue-800 font-medium">Contributions</div>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800">{t.badges}</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-100 flex items-start space-x-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
               <Map size={24} />
            </div>
            <div>
               <h3 className="font-bold text-slate-800">World Explorer</h3>
               <p className="text-sm text-slate-500">Contributed to 10+ countries</p>
               {user.badges.includes('Explorador Mundial') && <span className="mt-2 inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">EARNED</span>}
            </div>
         </div>

         <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-100 flex items-start space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
               <Zap size={24} />
            </div>
            <div>
               <h3 className="font-bold text-slate-800">Deal Hunter</h3>
               <p className="text-sm text-slate-500">Found 50+ unique plans</p>
               {user.badges.includes('Cazador de Ofertas') && <span className="mt-2 inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">EARNED</span>}
            </div>
         </div>

         <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-100 flex items-start space-x-4 opacity-50 grayscale">
            <div className="p-3 bg-red-100 rounded-lg text-red-600">
               <TrendingUp size={24} />
            </div>
            <div>
               <h3 className="font-bold text-slate-800">Top Contributor</h3>
               <p className="text-sm text-slate-500">Top 10 Monthly Ranking</p>
               <span className="mt-2 inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded">LOCKED</span>
            </div>
         </div>
      </div>
    </div>
  );
};