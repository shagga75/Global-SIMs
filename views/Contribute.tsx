import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { TRANSLATIONS } from '../constants';
import { Language, SimPlan, Operator, Country } from '../types';
import { Save, CheckCircle, Plus, X, Loader2 } from 'lucide-react';

interface ContributeProps {
  lang: Language;
}

export const Contribute: React.FC<ContributeProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  
  // Operator Logic
  const [availableOperators, setAvailableOperators] = useState<Operator[]>([]);
  const [isNewOperator, setIsNewOperator] = useState(false);
  const [newOperatorName, setNewOperatorName] = useState('');
  
  const [formData, setFormData] = useState<Partial<SimPlan>>({
    name: '',
    price: 0,
    currency: 'USD',
    data_gb: 1,
    validity_days: 30,
    sim_type: 'Physical',
    operator_id: '',
    speed_5g: false,
    features: []
  });

  // Initial Load
  useEffect(() => {
    const init = async () => {
        setLoading(true);
        const c = await storageService.getCountries();
        setCountries(c);
        if (c.length > 0) setSelectedCountry(c[0].id);
        setLoading(false);
    };
    init();
  }, []);

  // Update operators when country changes
  useEffect(() => {
    if(!selectedCountry) return;
    
    const loadOps = async () => {
        const ops = await storageService.getOperators(selectedCountry);
        setAvailableOperators(ops);
        setFormData(prev => ({ ...prev, operator_id: ops.length > 0 ? ops[0].id : '' }));
        setIsNewOperator(ops.length === 0);
    };
    loadOps();
  }, [selectedCountry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name) {
        setError("Please enter a Plan Name.");
        return;
    }

    setSubmitting(true);
    try {
        // Handle Operator Logic (Existing vs New)
        let finalOperatorId = formData.operator_id;

        if (isNewOperator) {
            if (!newOperatorName.trim()) {
                setError("Please enter the New Operator Name.");
                setSubmitting(false);
                return;
            }
            
            // Create the new operator first
            const newOpId = `op_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const newOperator: Operator = {
                id: newOpId,
                name: newOperatorName,
                country_id: selectedCountry,
                technologies: ['4G'], // Default
                website: '',
                coverage: 'Unknown'
            };
            
            await storageService.addOperator(newOperator);
            finalOperatorId = newOpId;
            
            setAvailableOperators([...availableOperators, newOperator]);
        } else {
            if (!finalOperatorId) {
                 setError("Please select an Operator.");
                 setSubmitting(false);
                 return;
            }
        }

        const newPlan: SimPlan = {
          id: `plan_${Date.now()}`,
          operator_id: finalOperatorId!,
          name: formData.name!,
          price: Number(formData.price),
          currency: formData.currency || 'USD',
          data_gb: Number(formData.data_gb),
          validity_days: Number(formData.validity_days),
          sim_type: formData.sim_type as any,
          speed_5g: !!formData.speed_5g,
          features: formData.features || []
        };

        await storageService.addPlan(newPlan);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        
        // Reset form logic
        setFormData({ 
            ...formData, 
            name: '', 
            price: 0,
            operator_id: isNewOperator ? finalOperatorId : (availableOperators[0]?.id || '')
        });
        
        if(isNewOperator) {
            setNewOperatorName('');
            setIsNewOperator(false);
            setFormData(prev => ({...prev, operator_id: finalOperatorId}));
        }
    } catch (e) {
        setError("An error occurred while submitting.");
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-primary" size={32} />
          </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
      <div className="bg-primary p-6 text-white">
        <h1 className="text-2xl font-bold">{t.contribute}</h1>
        <p className="text-blue-100">Help the community by adding new SIM plans.</p>
      </div>

      <div className="p-6">
        {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
                <CheckCircle className="mr-2" /> Contribution saved! You earned +5 points.
            </div>
        )}

        {error && (
             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                 {error}
             </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select 
                  className="w-full border rounded-md p-2 bg-white"
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                >
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{lang === 'en' ? c.name_en : c.name_es}</option>
                  ))}
                </select>
             </div>
             
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                {isNewOperator ? (
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="w-full border rounded-md p-2 border-blue-500 ring-1 ring-blue-200"
                            placeholder="Enter new operator name..."
                            value={newOperatorName}
                            onChange={(e) => setNewOperatorName(e.target.value)}
                            autoFocus
                        />
                        <button 
                            type="button"
                            onClick={() => setIsNewOperator(false)}
                            className="px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md border border-gray-200"
                            title="Cancel new operator"
                        >
                            <X size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <select 
                          className="w-full border rounded-md p-2 bg-white"
                          value={formData.operator_id}
                          onChange={e => setFormData({...formData, operator_id: e.target.value})}
                          disabled={availableOperators.length === 0}
                        >
                           {availableOperators.map(o => (
                             <option key={o.id} value={o.id}>{o.name}</option>
                           ))}
                           {availableOperators.length === 0 && <option>No operators found</option>}
                        </select>
                        <button 
                            type="button"
                            onClick={() => setIsNewOperator(true)}
                            className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md border border-blue-200 flex items-center"
                            title="Add New Operator"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                )}
                {isNewOperator && <p className="text-xs text-blue-600 mt-1">Adding new operator to database.</p>}
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
            <input 
              type="text" required
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-primary focus:outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Tourist Unlimited"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input 
                  type="number" required min="0" step="0.01"
                  className="w-full border rounded-md p-2"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select 
                  className="w-full border rounded-md p-2"
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="JPY">JPY</option>
                    <option value="MXN">MXN</option>
                    <option value="GBP">GBP</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GB Data (-1 = Unl.)</label>
                <input 
                  type="number" required
                  className="w-full border rounded-md p-2"
                  value={formData.data_gb}
                  onChange={e => setFormData({...formData, data_gb: Number(e.target.value)})}
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Validity (Days)</label>
                <input 
                  type="number" required min="1"
                  className="w-full border rounded-md p-2"
                  value={formData.validity_days}
                  onChange={e => setFormData({...formData, validity_days: Number(e.target.value)})}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  className="w-full border rounded-md p-2"
                  value={formData.sim_type}
                  onChange={e => setFormData({...formData, sim_type: e.target.value as any})}
                >
                    <option value="Physical">Physical SIM</option>
                    <option value="eSIM">eSIM</option>
                    <option value="Hybrid">Hybrid</option>
                </select>
             </div>
          </div>

          <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="5g"
                checked={formData.speed_5g}
                onChange={e => setFormData({...formData, speed_5g: e.target.checked})}
                className="rounded text-primary focus:ring-primary"
              />
              <label htmlFor="5g" className="font-medium text-gray-700">Includes 5G Access</label>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-bold flex justify-center items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
            {submitting ? 'Submitting...' : t.submit}
          </button>
        </form>
      </div>
    </div>
  );
};