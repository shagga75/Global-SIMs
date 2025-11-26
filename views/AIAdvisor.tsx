import React, { useState } from 'react';
import { Sparkles, Send, Bot } from 'lucide-react';
import { Language } from '../types';
import { getTravelAdvice } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { TRANSLATIONS } from '../constants';

interface AIAdvisorProps {
  lang: Language;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setResponse(null);

    // Prepare context
    const countries = storageService.getCountries();
    const operators = storageService.getOperators();
    const plans = storageService.getPlans();
    
    // Simplified context to fit token limits and relevance
    const contextStr = JSON.stringify({
        operators: operators.slice(0, 10).map(o => ({ name: o.name, coverage: o.coverage })),
        example_plans: plans.slice(0, 5).map(p => ({ name: p.name, price: p.price, data: p.data_gb }))
    });

    const answer = await getTravelAdvice(query, countries, contextStr);
    
    setResponse(answer);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center py-8">
        <div className="inline-block p-4 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 text-white mb-4 shadow-lg">
          <Bot size={48} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Travel SIM Assistant</h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Powered by Gemini 2.5. Ask about coverage, best value plans, or travel connectivity advice.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6 bg-gray-50 min-h-[200px] max-h-[400px] overflow-y-auto">
            {!response && !loading && (
                <div className="text-center text-gray-400 mt-8">
                    <p>Examples:</p>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li>"What is the best SIM for 2 weeks in Japan?"</li>
                        <li>"I need unlimited data in Spain for video calls."</li>
                        <li>"Is eSIM better than physical SIM for USA?"</li>
                    </ul>
                </div>
            )}
            {loading && (
                <div className="flex flex-col items-center justify-center space-y-3 py-10">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-blue-500 font-medium animate-pulse">Thinking...</p>
                </div>
            )}
            {response && (
                <div className="prose prose-blue max-w-none">
                    <div className="flex items-start space-x-3">
                         <div className="bg-blue-100 p-2 rounded-lg text-blue-700 mt-1">
                             <Sparkles size={16} />
                         </div>
                         <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                             {response}
                         </div>
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 bg-white border-t">
            <form onSubmit={handleAsk} className="relative">
                <input
                  type="text"
                  className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-xl transition-all"
                  placeholder={t.aiPrompt}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};