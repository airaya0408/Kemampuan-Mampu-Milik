
import React from 'react';
import { HouseTypeData } from '../types';

interface PropertyCardProps {
  data: HouseTypeData;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ data }) => {
  const isAffordable = data.medianMultiple <= 3.0;
  const colorClass = isAffordable ? 'text-green-600' : data.medianMultiple > 5.1 ? 'text-red-600' : 'text-orange-500';
  const bgClass = isAffordable ? 'bg-green-50' : data.medianMultiple > 5.1 ? 'bg-red-50' : 'bg-orange-50';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-100 transition-all duration-300 ease-out group cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-300">{data.jenisRumah}</h3>
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{data.negeri}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${bgClass} ${colorClass} shadow-sm`}>
          {data.kategoriKemampuan}
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Harga Median</span>
          <span className="font-bold text-slate-800 text-lg">RM {data.medianHarga.toLocaleString()}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Mampu Milik</p>
            <p className="text-sm font-semibold text-slate-700">RM {data.hargaMampuMilik.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Indeks</p>
            <p className={`text-sm font-bold ${colorClass}`}>{data.medianMultiple}x</p>
          </div>
        </div>

        <div className={`mt-2 p-2 rounded-xl text-center text-xs font-bold transition-transform duration-300 group-hover:scale-[1.02] ${data.bezaHarga < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {data.bezaHarga < 0 ? `Jurang: -RM ${Math.abs(data.bezaHarga).toLocaleString()}` : `Lebihan: RM ${data.bezaHarga.toLocaleString()}`}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
