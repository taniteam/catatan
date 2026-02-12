
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = 'text-gray-600' }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
      <div className={`p-4 bg-gray-50 rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
