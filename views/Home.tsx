import React, { useState, useEffect } from 'react';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { Country, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { storageService } from '../services/storageService';

interface HomeProps {
  lang: Language;
  onSelectCountry: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({ lang, onSelectCountry }) => {
  const [query, setQuery] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    setCountries(storageService.getCountries());
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name_en.toLowerCase().includes(query.toLowerCase()) || 
    c.name_es.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-dark rounded-2xl p-8 md:p-16 text-white text-center shadow-xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{t.title}</h1>
        <p className="text-xl text-blue-100 mb-8">{t.subtitle}</p>
        
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-4 border-none rounded-full leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Search Results or Popular */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
          <MapPin className="mr-2 text-primary" />
          {query ? 'Search Results' : t.popularCountries}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCountries.map((country) => (
            <div 
              key={country.id}
              onClick={() => onSelectCountry(country.id)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 group"
            >
              <div className="h-24 bg-gray-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                {country.flag}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-slate-800">
                  {lang === 'en' ? country.name_en : country.name_es}
                </h3>
                <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
                  <span>{country.continent}</span>
                  <span className="bg-blue-100 text-primary px-2 py-0.5 rounded font-medium">{country.currency}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 flex justify-end">
                <ArrowRight className="text-primary h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
          {filteredCountries.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              No countries found matching "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};