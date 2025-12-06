import React from 'react';
import { StatCardProps } from '../types';

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};
