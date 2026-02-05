
import React from 'react';
import { StateData, AffordabilityStatus } from '../types';

interface StateCardProps {
  data: StateData;
}

const StateCard: React.FC<StateCardProps> = ({ data }) => {
  const annualIncome = data.medianMonthlyIncome * 12;
  const medianMultiple = data.medianHousePrice / annualIncome;

  let status = AffordabilityStatus.AFFORDABLE;
  let colorClass = 'text-green-600';
  let bgClass = 'bg-green-50';

  if (medianMultiple > 5.1) {
    status = AffordabilityStatus.SEVERELY_UNAFFORDABLE;
    colorClass = 'text-red-700';
    bgClass = 'bg-red-50';
  } else if (medianMultiple > 4.1) {
    status = AffordabilityStatus.SERIOUSLY_UNAFFORDABLE;
    colorClass = 'text-orange-600';
    bgClass = 'bg-orange-50';
  } else if (medianMultiple > 3.1) {
    status = AffordabilityStatus.MODERATELY_UNAFFORDABLE;
    colorClass = 'text-yellow-600';
    bgClass = 'bg-yellow-50';
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 ease-out group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition-colors duration-300">{data.name}</h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${bgClass} ${colorClass}`}>
          {status}
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Harga Median</span>
          <span className="font-semibold text-slate-800">RM {data.medianHousePrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Gaji Bulanan Median</span>
          <span className="font-semibold text-slate-800">RM {data.medianMonthlyIncome.toLocaleString()}</span>
        </div>
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Median Multiple</span>
          <span className={`text-xl font-bold ${colorClass} group-hover:scale-110 transition-transform duration-300`}>{medianMultiple.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
};

export default StateCard;
