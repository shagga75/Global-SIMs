import React from 'react';
import { Globe, User, Menu, X, Award, Search, PlusCircle, Scale, MessageSquare } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  lang: Language;
  setLang: (l: Language) => void;
  currentView: string;
  setView: (v: string) => void;
  userPoints: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, lang, setLang, currentView, setView, userPoints }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const t = TRANSLATIONS[lang];

  const NavItem = ({ view, icon: Icon, label }: { view: string; icon: any; label: string }) => (
    <button
      onClick={() => {
        setView(view);
        setIsMenuOpen(false);
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors w-full md:w-auto
        ${currentView === view ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-600'}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 font-bold text-xl cursor-pointer"
              onClick={() => setView('home')}
            >
              <Globe className="h-8 w-8" />
              <span className="hidden sm:inline">Global SIM Connect</span>
              <span className="sm:hidden">GSC Ultimate</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-2">
              <NavItem view="home" icon={Search} label={t.home} />
              <NavItem view="compare" icon={Scale} label={t.compare} />
              <NavItem view="contribute" icon={PlusCircle} label={t.contribute} />
              <NavItem view="ai" icon={MessageSquare} label={t.aiAdvisor} />
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
                className="text-sm font-medium bg-blue-700 px-2 py-1 rounded hover:bg-blue-600"
              >
                {lang.toUpperCase()}
              </button>
              
              <div 
                className="flex items-center space-x-2 bg-blue-800 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-700"
                onClick={() => setView('dashboard')}
              >
                <User size={18} />
                <span className="font-bold text-yellow-400">{userPoints} pts</span>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-blue-800 px-4 py-2 space-y-2">
             <NavItem view="home" icon={Search} label={t.home} />
             <NavItem view="compare" icon={Scale} label={t.compare} />
             <NavItem view="contribute" icon={PlusCircle} label={t.contribute} />
             <NavItem view="ai" icon={MessageSquare} label={t.aiAdvisor} />
             <NavItem view="dashboard" icon={Award} label={t.dashboard} />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Global SIM Connect Ultimate. Version 1.0 Final.</p>
          <p className="text-sm mt-2">Context Engineering Project</p>
        </div>
      </footer>
    </div>
  );
};