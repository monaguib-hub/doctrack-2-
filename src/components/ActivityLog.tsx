import React from 'react';
import { History, User, Clock, FileEdit, Trash2, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ActivityEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'update' | 'delete' | 'create';
}

interface ActivityLogProps {
  activities: ActivityEntry[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl shadow-slate-200/50">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center text-xs font-black text-slate-800 uppercase tracking-widest">
          <History size={16} className="mr-2.5 text-abs-navy" />
          ACTIVITY LOG
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-slate-400 font-bold uppercase">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-6">
        <AnimatePresence initial={false}>
          {activities.length > 0 ? (
            activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative pl-7 pb-6 border-l border-slate-100 last:pb-0"
              >
                <div className={`absolute left-[-11px] top-0 w-5 h-5 flex items-center justify-center rounded-lg border shadow-sm ${activity.type === 'delete' ? 'bg-red-50 border-red-100 text-red-600' :
                  activity.type === 'create' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                    'bg-blue-50 border-blue-100 text-blue-600'
                  }`}>
                  {activity.type === 'delete' ? <Trash2 size={10} strokeWidth={2.5} /> :
                    activity.type === 'create' ? <PlusCircle size={10} strokeWidth={2.5} /> :
                      <FileEdit size={10} strokeWidth={2.5} />}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center">
                      <User size={10} className="mr-1 opacity-50" />
                      {activity.user}
                    </span>
                    <span className="text-[10px] text-slate-300 font-medium font-mono flex items-center">
                      <Clock size={10} className="mr-1" />
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    <span className="font-medium text-slate-800">{activity.action}</span>
                    <span className="mx-1 text-slate-300">•</span>
                    <span className="text-blue-600 font-bold">{activity.target}</span>
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <History size={24} className="text-slate-200" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No recent movements</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
