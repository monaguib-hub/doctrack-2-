import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Mail, Shield, Calendar, Clock, FileText, User, Building2 } from 'lucide-react';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function SidePanel({ isOpen, onClose, title, subtitle, children, footer }: SidePanelProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[110] bg-slate-900/10 backdrop-blur-[2px]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-[120] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 leading-tight">{title}</h3>
                                {subtitle && (
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">{subtitle}</p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export function DetailItem({ icon: Icon, label, value, colorClass = "text-abs-navy" }: { icon: any, label: string, value: string | React.ReactNode, colorClass?: string }) {
    return (
        <div className="flex items-start">
            <div className={`p-2 rounded-lg bg-slate-50 border border-slate-100 mr-4 ${colorClass}`}>
                <Icon size={16} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                <div className="text-sm font-bold text-slate-700">{value}</div>
            </div>
        </div>
    );
}

export function SectionHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center space-x-3 mb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-abs-navy whitespace-nowrap">{title}</h4>
            <div className="h-px w-full bg-abs-steel/20" />
        </div>
    );
}
