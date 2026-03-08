import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  type: 'neutral' | 'danger' | 'warning' | 'success' | 'caution';
  icon?: any;
  trend?: number;
  data?: number[];
}

export function StatCard({ title, value, type, icon: Icon, trend, data }: StatCardProps) {
  const colors = {
    neutral: 'border-slate-200 bg-white text-slate-800 shadow-sm',
    danger: 'border-abs-red/20 bg-white text-abs-red shadow-sm',
    warning: 'border-amber-200 bg-white text-amber-600 shadow-sm',
    caution: 'border-yellow-200 bg-white text-yellow-600 shadow-sm',
    success: 'border-emerald-200 bg-white text-emerald-600 shadow-sm'
  };

  const labelColors = {
    neutral: 'text-slate-500',
    danger: 'text-abs-red',
    warning: 'text-amber-500',
    caution: 'text-yellow-600',
    success: 'text-emerald-500'
  };

  const sparklineColor = {
    neutral: '#94a3b8',
    danger: '#E31B23', // ABS Maritime Red
    warning: '#f59e0b',
    caution: '#eab308',
    success: '#10b981'
  };

  return (
    <div className={`p-5 rounded-xl border ${colors[type]} relative overflow-hidden group transition-all hover:shadow-lg border-b-[4px] border-b-transparent hover:border-b-abs-navy/20 duration-300`}>
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className={`text-[10px] font-black uppercase tracking-widest ${labelColors[type]} opacity-70`}>{title}</div>
        <div className={`p-1.5 rounded-lg bg-slate-50 border border-slate-100 ${labelColors[type]} group-hover:scale-110 transition-transform`}>
          {Icon && <Icon size={14} />}
        </div>
      </div>

      <div className="flex items-end justify-between relative z-10">
        <div>
          <div className="text-3xl font-light tracking-tight mb-1">{value}</div>
          {trend !== undefined && (
            <div className={`flex items-center text-[10px] font-bold ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend >= 0 ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
              {Math.abs(trend)}% vs last month
            </div>
          )}
        </div>

        {data && data.length > 0 && (
          <div className="w-24 h-12">
            <Sparkline data={data} color={sparklineColor[type]} />
          </div>
        )}
      </div>

      {/* Modern decorative element */}
      <div className={`absolute right-0 bottom-0 w-32 h-32 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110 duration-700`}>
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[], color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 40;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((d - min) / range) * height
  }));

  const pathContent = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaContent = `${pathContent} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        d={pathContent}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        d={areaContent}
        fill={`url(#grad-${color})`}
        stroke="none"
      />
    </svg>
  );
}
