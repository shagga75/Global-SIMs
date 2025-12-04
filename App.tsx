import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './views/Home';
import { CountryDetails } from './views/CountryDetails';
import { Comparison } from './views/Comparison';
import { Contribute } from './views/Contribute';
import { Dashboard } from './views/Dashboard';
import { AIAdvisor } from './views/AIAdvisor';
import { TripCalculator } from './views/TripCalculator';
import { storageService } from './services/storageService';
import { SimPlan, Language } from './types';

const App = () => {
  const [view, setView] = useState('home');
  const [lang, setLang] = useState<Language>('en');
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [comparisonPlans, setComparisonPlans] = useState<SimPlan[]>([]);
  const [userPoints, setUserPoints] = useState(0);

  // Initialize Storage
  useEffect(() => {
    storageService.init();
    storageService.getUser().then(u => setUserPoints(u.points));
  }, []);

  // Update points when view changes (in case of contributions)
  useEffect(() => {
      storageService.getUser().then(u => setUserPoints(u.points));
  }, [view]);

  const handleCountrySelect = (id: string) => {
    setSelectedCountryId(id);
    setView('country');
  };

  const handleCompare = (plan: SimPlan) => {
    if (!comparisonPlans.find(p => p.id === plan.id)) {
      setComparisonPlans([...comparisonPlans, plan]);
    }
    setView('compare');
  };

  const handleRemoveCompare = (id: string) => {
    setComparisonPlans(comparisonPlans.filter(p => p.id !== id));
  };

  const renderView = () => {
    switch (view) {
      case 'home':
        return <Home lang={lang} onSelectCountry={handleCountrySelect} />;
      case 'country':
        return selectedCountryId 
          ? <CountryDetails 
              countryId={selectedCountryId} 
              lang={lang} 
              onBack={() => setView('home')}
              onCompare={handleCompare}
            /> 
          : <Home lang={lang} onSelectCountry={handleCountrySelect} />;
      case 'compare':
        return <Comparison plans={comparisonPlans} lang={lang} onRemove={handleRemoveCompare} />;
      case 'contribute':
        return <Contribute lang={lang} />;
      case 'dashboard':
        return <Dashboard lang={lang} />;
      case 'ai':
        return <AIAdvisor lang={lang} />;
      case 'calculator':
        return <TripCalculator lang={lang} />;
      default:
        return <Home lang={lang} onSelectCountry={handleCountrySelect} />;
    }
  };

  return (
    <Layout 
      lang={lang} 
      setLang={setLang} 
      currentView={view} 
      setView={setView}
      userPoints={userPoints}
    >
      {renderView()}
    </Layout>
  );
};

export default App;