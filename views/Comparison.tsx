import React from 'react';
import { SimPlan, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { X, Check, Minus, BarChart as BarChartIcon, Download } from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Label 
} from 'recharts';

interface ComparisonProps {
  plans: SimPlan[];
  lang: Language;
  onRemove: (id: string) => void;
}

export const Comparison: React.FC<ComparisonProps> = ({ plans, lang, onRemove }) => {
  const t = TRANSLATIONS[lang];

  const handleExportCSV = () => {
    if (plans.length === 0) return;

    const headers = ['Plan Name', 'Operator ID', 'Price', 'Currency', 'Data (GB)', 'Validity (Days)', 'Type', '5G'];
    const rows = plans.map(p => [
      `"${p.name}"`,
      p.operator_id,
      p.price,
      p.currency,
      p.data_gb === -1 ? 'Unlimited' : p.data_gb,
      p.validity_days,
      p.sim_type,
      p.speed_5g ? 'Yes' : 'No'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "global_sim_comparison.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (plans.length === 0) {
    return (
      <div className="text-center py-20">
        <BarChartIcon size={64} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2">No plans selected</h2>
        <p className="text-slate-500">Browse countries and operators to add plans to comparison.</p>
      </div>
    );
  }

  // Calculate dynamic max for X axis to handle Unlimited gracefully
  const maxFiniteData = Math.max(...plans.filter(p => p.data_gb !== -1).map(p => p.data_gb), 10);
  const unlimitedValue = Math.ceil(maxFiniteData * 1.2);

  const chartData = plans.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    x: p.data_gb === -1 ? unlimitedValue : p.data_gb,
    y: p.price,
    currency: p.currency,
    dataLabel: p.data_gb === -1 ? 'Unlimited' : `${p.data_gb} GB`
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg z-50">
          <p className="font-bold text-slate-800">{data.name}</p>
          <div className="text-sm mt-1">
            <span className="font-semibold text-primary">{data.price} {data.currency}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="font-semibold text-green-600">{data.dataLabel}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">{t.compare} ({plans.length})</h1>
        <button 
          onClick={handleExportCSV}
          className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table Comparison */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-max">
          <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${plans.length}, minmax(250px, 1fr))` }}>
            
            {/* Header Column Labels */}
            <div className="space-y-4 py-4 font-bold text-slate-500 text-right pr-4 flex flex-col justify-end">
              <div className="h-32 flex items-end justify-end"></div> {/* Spacer for card header */}
              <div className="h-10 flex items-center justify-end border-b">{t.price}</div>
              <div className="h-10 flex items-center justify-end border-b">{t.data}</div>
              <div className="h-10 flex items-center justify-end border-b">{t.validity}</div>
              <div className="h-10 flex items-center justify-end border-b">Cost / GB</div>
              <div className="h-10 flex items-center justify-end border-b">{t.type}</div>
              <div className="h-10 flex items-center justify-end border-b">5G</div>
            </div>

            {/* Plan Columns */}
            {plans.map(plan => (
              <div key={plan.id} className="relative bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-primary">
                <button 
                  onClick={() => onRemove(plan.id)}
                  className="absolute top-2 right-2 p-1 bg-red-100 text-red-500 rounded-full hover:bg-red-200 z-10"
                >
                  <X size={16} />
                </button>
                
                {/* Header */}
                <div className="p-4 h-40 flex flex-col justify-between bg-gradient-to-b from-blue-50 to-white">
                   <div className="pr-6">
                     <h3 className="font-bold text-lg leading-tight mb-1">{plan.name}</h3>
                     <p className="text-sm text-slate-500 truncate">{plan.operator_id}</p>
                   </div>
                   <div className="text-center bg-primary/10 rounded-lg py-2">
                     <span className="text-2xl font-bold text-primary">{plan.price}</span>
                     <span className="text-sm text-primary font-medium ml-1">{plan.currency}</span>
                   </div>
                </div>

                {/* Rows */}
                <div className="px-4 space-y-4 text-center text-slate-700">
                   <div className="h-10 flex items-center justify-center border-b font-medium">
                     {plan.price} {plan.currency}
                   </div>
                   <div className="h-10 flex items-center justify-center border-b font-bold">
                     {plan.data_gb === -1 ? 'Unlimited' : `${plan.data_gb} GB`}
                   </div>
                   <div className="h-10 flex items-center justify-center border-b">
                     {plan.validity_days} Days
                   </div>
                   <div className="h-10 flex items-center justify-center border-b text-sm">
                     {plan.data_gb === -1 ? '-' : `${(plan.price / plan.data_gb).toFixed(2)} ${plan.currency}`}
                   </div>
                   <div className="h-10 flex items-center justify-center border-b">
                     <span className={`px-2 text-xs rounded-full ${plan.sim_type === 'eSIM' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                       {plan.sim_type}
                     </span>
                   </div>
                   <div className="h-10 flex items-center justify-center border-b">
                     {plan.speed_5g ? <Check className="text-green-500" size={20} /> : <Minus className="text-gray-300" size={20} />}
                   </div>
                </div>
                <div className="p-4 bg-gray-50 mt-4 min-h-[80px]">
                    <p className="text-xs text-gray-500 font-bold mb-1">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.features.map((f, i) => <span key={i} className="text-[10px] bg-white border px-1 rounded">{f}</span>)}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Efficiency Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md mt-8 border border-gray-100">
        <h3 className="font-bold text-lg mb-2 text-slate-800">Cost Efficiency Analysis</h3>
        <p className="text-sm text-slate-500 mb-6">Compare price vs. data allowance. The bottom-right area represents the best value (High Data, Low Price).</p>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Data" 
                unit=" GB" 
                domain={[0, 'auto']}
                tickFormatter={(value) => value >= unlimitedValue ? 'Unl.' : value}
              >
                <Label value="Data Allowance (GB)" offset={-20} position="insideBottom" style={{ fill: '#64748b' }} />
              </XAxis>
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Price" 
                unit="" 
                domain={[0, 'auto']}
              >
                 <Label value="Price" angle={-90} position="insideLeft" style={{ fill: '#64748b' }} />
              </YAxis>
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Plans" data={chartData} fill="#2563eb" r={8} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};