import React, { useState, useRef } from 'react';
import { Sparkles, Send, Bot, Volume2, StopCircle } from 'lucide-react';
import { Language } from '../types';
import { GoogleGenAI, Modality } from "@google/genai";
import { storageService } from '../services/storageService';

interface AIAdvisorProps {
  lang: Language;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ lang }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopAudio = () => {
    if (audioSourceRef.current) {
        try {
            audioSourceRef.current.stop();
        } catch (e) {
            // ignore
        }
        audioSourceRef.current = null;
    }
    setAudioPlaying(false);
  };

  const playAudio = async (base64Audio: string) => {
    stopAudio(); // Stop any current audio

    if (!audioContextRef.current) {
        // Fallback if context was lost, though handleAsk should have created it
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }

    try {
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setAudioPlaying(false);
        
        audioSourceRef.current = source;
        source.start();
        setAudioPlaying(true);
    } catch (error) {
        console.error("Audio playback error:", error);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // iOS/Mobile Requirement: Initialize or Resume AudioContext directly within the user event (click/submit)
    // before any async operations (like fetch or AI generation).
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }
    if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
    }
    
    setLoading(true);
    setResponse(null);
    stopAudio();

    if (!process.env.API_KEY) {
        setResponse("API Key not configured.");
        setLoading(false);
        return;
    }

    try {
        // Fetch Context Data Async
        // Removed 'countries' from destructuring to avoid unused variable TS error
        const [, operators, plans] = await Promise.all([
             storageService.getCountries(),
             storageService.getOperators(),
             storageService.getPlans()
        ]);
        
        // Simplified context
        const contextStr = JSON.stringify({
            operators: operators.slice(0, 10).map(o => ({ name: o.name, coverage: o.coverage })),
            example_plans: plans.slice(0, 5).map(p => ({ name: p.name, price: p.price, data: p.data_gb }))
        });

        const systemInstruction = `
            You are the Voice AI assistant for "Global SIM Connect". 
            Your goal is to recommend SIM cards for travelers.
            Keep answers concise (under 50 words) and conversational as they will be spoken.
            Context: ${contextStr}
        `;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const resp = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-tts',
          contents: {
              parts: [{ text: query }]
          },
          config: {
            systemInstruction: systemInstruction,
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
          }
        });

        const candidate = resp.candidates?.[0];
        const audioPart = candidate?.content?.parts?.find(p => p.inlineData);
        
        if (audioPart && audioPart.inlineData && audioPart.inlineData.data) {
             setResponse("Listen to the advisor's recommendation...");
             playAudio(audioPart.inlineData.data);
        } else {
             setResponse("Received response but no audio data found.");
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        setResponse("Sorry, I am currently offline. Please try again later.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center py-8">
        <div className="inline-block p-4 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white mb-4 shadow-lg">
          <Bot size={48} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Voice Advisor</h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Powered by Gemini 2.5 Flash TTS. Ask a question and hear the expert advice.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-b from-gray-50 to-white">
            
            {!response && !loading && (
                <div className="text-center text-gray-400">
                    <p>Examples:</p>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li>"Tell me the best plan for Japan."</li>
                        <li>"Do I need an eSIM for USA?"</li>
                    </ul>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
                        <div className="relative bg-white p-4 rounded-full shadow-md">
                            <Bot className="text-blue-500 animate-bounce" size={32} />
                        </div>
                    </div>
                    <p className="text-blue-500 font-medium">Connecting to Advisor...</p>
                </div>
            )}

            {response && !loading && (
                <div className="text-center w-full max-w-md">
                     <div className={`mx-auto p-6 rounded-full mb-6 transition-all duration-500 ${audioPlaying ? 'bg-green-100 scale-110 shadow-lg ring-4 ring-green-50' : 'bg-gray-100'}`}>
                        {audioPlaying ? (
                            <Volume2 size={48} className="text-green-600 animate-pulse" />
                        ) : (
                            <Sparkles size={48} className="text-slate-400" />
                        )}
                     </div>
                     
                     <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
                        <p className="text-slate-700 italic">"{response}"</p>
                     </div>

                     {audioPlaying && (
                        <button 
                            onClick={stopAudio}
                            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center mx-auto"
                        >
                            <StopCircle size={18} className="mr-2" /> Stop Audio
                        </button>
                     )}
                </div>
            )}
        </div>

        <div className="p-4 bg-white border-t">
            <form onSubmit={handleAsk} className="relative">
                <input
                  type="text"
                  className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 rounded-xl transition-all"
                  placeholder="Ask for advice..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};