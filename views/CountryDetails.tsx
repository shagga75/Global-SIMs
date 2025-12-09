import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Signal, Wifi, Calendar, Server, Scale, Filter, Star, MessageSquare, Loader2 } from 'lucide-react';
import { Country, Operator, SimPlan, Language, Review } from '../types';
import { storageService } from '../services/storageService';
import { TRANSLATIONS } from '../constants';

interface CountryDetailsProps {
  countryId: string;
  lang: Language;
  onBack: () => void;
  onCompare: (plan: SimPlan) => void;
}

export const CountryDetails: React.FC<CountryDetailsProps> = ({ countryId, lang, onBack, onCompare }) => {
  const [country, setCountry] = useState<Country | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [plans, setPlans] = useState<SimPlan[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [dataFilter, setDataFilter] = useState<string>('all');
  
  // Loading states
  const [loadingCountry, setLoadingCountry] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Review state
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const initData = async () => {
        setLoadingCountry(true);
        try {
            const allCountries = await storageService.getCountries();
            const c = allCountries.find(x => x.id === countryId);
            if (c) setCountry(c);
            
            const ops = await storageService.getOperators(countryId);
            setOperators(ops);
            if (ops.length > 0) {
              setSelectedOperator(ops[0].id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingCountry(false);
        }
    };
    initData();
  }, [countryId]);

  useEffect(() => {
    if (selectedOperator) {
      const loadPlans = async () => {
          setLoadingPlans(true);
          try {
              const p = await storageService.getPlans(selectedOperator);
              setPlans(p);
          } finally {
              setLoadingPlans(false);
          }
      };
      loadPlans();
      setDataFilter('all');
    }
  }, [selectedOperator]);

  useEffect(() => {
    if (expandedPlanId) {
        const loadReviews = async () => {
            setLoadingReviews(true);
            const r = await storageService.getReviews(expandedPlanId);
            setReviews(r);
            setLoadingReviews(false);
        };
        loadReviews();
    }
  }, [expandedPlanId]);

  const filteredPlans = plans.filter(plan => {
    if (dataFilter === 'all') return true;
    if (dataFilter === 'low') return plan.data_gb !== -1 && plan.data_gb < 10;
    if (dataFilter === 'medium') return plan.data_gb !== -1 && plan.data_gb >= 10 && plan.data_gb < 50;
    if (dataFilter === 'high') return plan.data_gb !== -1 && plan.data_gb >= 50 && plan.data_gb < 100;
    if (dataFilter === 'ultra') return plan.data_gb === -1 || plan.data_gb >= 100;
    return true;
  });

  const handleSubmitReview = async (planId: string) => {
    if (!newReviewComment.trim()) return;
    
    setSubmittingReview(true);
    const user = await storageService.getUser();
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      planId,
      userName: user.name,
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toLocaleDateString()
    };
    
    await storageService.addReview(newReview);
    setReviews([...reviews, newReview]);
    setNewReviewComment('');
    setNewReviewRating(5);
    setSubmittingReview(false);
  };

  const FilterButton = ({ id, label }: { id: string, label: string }) => (
    <button 
        onClick={() => setDataFilter(id)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            dataFilter === id 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50 hover:border-blue-300'
        }`}
    >
        {label}
    </button>
  );

  if (loadingCountry) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
             <Loader2 className="animate-spin text-primary mb-4" size={48} />
             <p className="text-gray-500">Loading destination data...</p>
        </div>
      );
  }

  if (!country) return <div>Country not found.</div>;

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-primary mb-6">
        <ArrowLeft size={18} className="mr-1" /> Back to Countries
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar: Operators */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md text-center border-t-4 border-primary">
            <div className="text-6xl mb-2">{country.flag}</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">{lang === 'en' ? country.name_en : country.name_es}</h1>
            <p className="text-slate-500">{country.continent} • {country.currency}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 font-bold text-slate-700 border-b">
              {t.operators}
            </div>
            <div className="divide-y">
              {operators.map(op => (
                <button
                  key={op.id}
                  onClick={() => setSelectedOperator(op.id)}
                  className={`w-full text-left px-4 py-3 flex justify-between items-center hover:bg-blue-50 transition-colors ${selectedOperator === op.id ? 'bg-blue-50 border-l-4 border-primary' : ''}`}
                >
                  <span className="font-medium">{op.name}</span>
                  <div className="flex space-x-1">
                    {op.technologies.includes('5G') && <span className="text-xs bg-slate-800 text-white px-1 rounded">5G</span>}
                  </div>
                </button>
              ))}
              {operators.length === 0 && <div className="p-4 text-sm text-gray-500">No operators found. Contribute one!</div>}
            </div>
          </div>
        </div>

        {/* Right Content: Plans */}
        <div className="w-full md:w-2/3">
           {selectedOperator ? (
             <div className="space-y-6">
               {/* Operator Info */}
               {(() => {
                 const op = operators.find(o => o.id === selectedOperator);
                 return op ? (
                   <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm animate-fade-in">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-800">{op.name}</h2>
                        <div className="flex items-center text-sm text-slate-600 mt-1">
                          <Signal size={14} className="mr-1" /> {op.coverage} Coverage
                          <span className="mx-2 text-gray-300">|</span>
                          <span className="text-slate-500">{op.technologies.join(', ')}</span>
                        </div>
                     </div>
                     <a 
                       href={op.website.startsWith('http') ? op.website : `https://${op.website}`} 
                       target="_blank" 
                       rel="noreferrer" 
                       className="group flex items-center bg-blue-50 hover:bg-blue-100 text-primary px-4 py-2 rounded-lg transition-colors font-medium"
                     >
                       <span className="mr-2">Visit Website</span>
                       <ExternalLink size={16} className="group-hover:translate-x-0.5 transition-transform" />
                     </a>
                   </div>
                 ) : null;
               })()}

               {/* Filters */}
               <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
                 <Filter size={16} className="text-slate-400 shrink-0" />
                 <FilterButton id="all" label="All Data" />
                 <FilterButton id="low" label="< 10 GB" />
                 <FilterButton id="medium" label="10 - 50 GB" />
                 <FilterButton id="high" label="50 - 100 GB" />
                 <FilterButton id="ultra" label="100 GB+" />
               </div>

               {/* Plans List */}
               {loadingPlans ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white h-48 rounded-xl shadow-sm animate-pulse border border-gray-100"></div>
                        ))}
                    </div>
               ) : (
                   <div className="grid grid-cols-1 gap-4">
                     {filteredPlans.map(plan => (
                       <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow animate-fade-in">
                         <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${plan.sim_type === 'eSIM' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                      {plan.sim_type}
                                    </span>
                                    {plan.speed_5g && <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-bold">5G</span>}
                                  </div>
                                  <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-primary">
                                    {plan.price} <span className="text-sm font-normal text-gray-500">{plan.currency}</span>
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {((plan.price / (plan.data_gb === -1 ? 100 : plan.data_gb)).toFixed(2))} {plan.currency}/GB
                                  </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 my-4 py-4 border-t border-b border-gray-50">
                                <div className="flex flex-col items-center text-center">
                                  <Wifi className="text-slate-400 mb-1" size={20} />
                                  <span className="font-bold text-slate-700">{plan.data_gb === -1 ? '∞' : plan.data_gb} GB</span>
                                  <span className="text-xs text-gray-500">{t.data}</span>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                  <Calendar className="text-slate-400 mb-1" size={20} />
                                  <span className="font-bold text-slate-700">{plan.validity_days} Days</span>
                                  <span className="text-xs text-gray-500">{t.validity}</span>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                  <Server className="text-slate-400 mb-1" size={20} />
                                  <span className="font-bold text-slate-700">{plan.speed_5g ? 'Max' : '4G'}</span>
                                  <span className="text-xs text-gray-500">{t.speed}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {plan.features.map((feature, idx) => (
                                <span key={idx} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                  {feature}
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-3">
                              <button 
                                onClick={() => onCompare(plan)}
                                className="flex-1 bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700 transition-colors font-medium flex justify-center items-center"
                              >
                                <Scale size={16} className="mr-2" /> {t.addToCompare}
                              </button>
                              <button
                                onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-600 flex items-center"
                              >
                                <MessageSquare size={16} className="mr-2" /> Reviews
                              </button>
                            </div>
                         </div>

                         {/* Reviews Section */}
                         {expandedPlanId === plan.id && (
                            <div className="bg-gray-50 p-6 border-t border-gray-200 animate-fade-in">
                               <h4 className="font-bold text-slate-700 mb-4">Community Reviews</h4>
                               
                               {/* Add Review */}
                               <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-sm font-medium">Your Rating:</span>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button 
                                          key={star} 
                                          type="button" 
                                          onClick={() => setNewReviewRating(star)}
                                          className="focus:outline-none"
                                        >
                                            <Star 
                                                size={18} 
                                                className={`${star <= newReviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                            />
                                        </button>
                                    ))}
                                  </div>
                                  <textarea
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    rows={2}
                                    placeholder="Share your experience with this plan..."
                                    value={newReviewComment}
                                    onChange={(e) => setNewReviewComment(e.target.value)}
                                  ></textarea>
                                  <div className="text-right mt-2">
                                    <button 
                                        onClick={() => handleSubmitReview(plan.id)}
                                        disabled={submittingReview}
                                        className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                  </div>
                               </div>

                               {/* List Reviews */}
                               <div className="space-y-4">
                                  {loadingReviews ? (
                                      <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
                                  ) : reviews.length === 0 ? (
                                      <p className="text-center text-gray-500 text-sm italic">No reviews yet. Be the first!</p>
                                  ) : (
                                      reviews.map(review => (
                                          <div key={review.id} className="border-b border-gray-200 pb-3 last:border-0">
                                              <div className="flex justify-between items-start">
                                                  <span className="font-bold text-sm text-slate-700">{review.userName}</span>
                                                  <span className="text-xs text-gray-400">{review.date}</span>
                                              </div>
                                              <div className="flex text-yellow-400 my-1">
                                                  {[...Array(5)].map((_, i) => (
                                                      <Star key={i} size={12} className={i < review.rating ? 'fill-current' : 'text-gray-300'} />
                                                  ))}
                                              </div>
                                              <p className="text-sm text-slate-600">{review.comment}</p>
                                          </div>
                                      ))
                                  )}
                               </div>
                            </div>
                         )}
                       </div>
                     ))}
                     {filteredPlans.length === 0 && plans.length > 0 && (
                       <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-200">
                         No plans match the selected filter.
                       </div>
                     )}
                     {plans.length === 0 && (
                       <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-200">
                         No plans found for this operator. Be the first to add one!
                       </div>
                     )}
                   </div>
               )}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
               <Server size={48} className="mb-4 opacity-20" />
               <p>Select an operator from the list to view plans</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};