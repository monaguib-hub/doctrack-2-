import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, Users, Building2, Command, X, ArrowRight, Plus, Download, LayoutDashboard, Library } from 'lucide-react';
import { Document, Employee, Office } from '../mockData';
import { getDocumentIcon } from '../utils/icons';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    documents: Document[];
    employees: Employee[];
    offices: Office[];
    onAction: (action: 'new-doc' | 'new-employee' | 'new-office' | 'export' | 'go-dashboard' | 'go-library' | 'go-personnel' | 'go-offices' | 'offices' | 'settings' | 'help') => void;
    onSelectDocument: (doc: Document) => void;
    onSelectEmployee: (emp: Employee) => void;
    onSelectOffice: (off: Office) => void;
}

export function CommandPalette({
    isOpen,
    onClose,
    documents,
    employees,
    offices,
    onAction,
    onSelectDocument,
    onSelectEmployee,
    onSelectOffice
}: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const results = useMemo(() => {
        if (!query.trim()) return { documents: [], employees: [], offices: [], actions: [] };
        const q = query.toLowerCase();

        const filteredDocs = documents.filter(d =>
            d.title.toLowerCase().includes(q) || d.holder.toLowerCase().includes(q)
        ).slice(0, 5);

        const filteredEmployees = employees.filter(e =>
            e.name.toLowerCase().includes(q) || e.title.toLowerCase().includes(q)
        ).slice(0, 3);

        const filteredOffices = offices.filter(o =>
            o.name.toLowerCase().includes(q) || o.location.toLowerCase().includes(q)
        ).slice(0, 3);

        const actions = [
            { id: 'new-doc', label: 'Create New Document', icon: Plus, type: 'action' },
            { id: 'export', label: 'Export System Logs', icon: Download, type: 'action' },
        ].filter(a => a.label.toLowerCase().includes(q));

        return { documents: filteredDocs, employees: filteredEmployees, offices: filteredOffices, actions };
    }, [query, documents, employees, offices]);

    const flattenedResults = useMemo(() => {
        const items: any[] = [];
        results.actions.forEach(a => items.push({ ...a, category: 'Actions' }));
        results.documents.forEach(d => items.push({ ...d, category: 'Documents', label: d.title, icon: getDocumentIcon(d.title) }));
        results.employees.forEach(e => items.push({ ...e, category: 'Personnel', label: e.name, icon: Users }));
        results.offices.forEach(o => items.push({ ...o, category: 'Offices', label: o.name, icon: Building2 }));
        return items;
    }, [results]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Scroll the selected item into view
    useEffect(() => {
        if (scrollContainerRef.current) {
            const selected = scrollContainerRef.current.querySelector('[data-selected="true"]');
            if (selected) selected.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { onClose(); return; }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % (flattenedResults.length || 1));
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + (flattenedResults.length || 1)) % (flattenedResults.length || 1));
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            const selected = flattenedResults[selectedIndex];
            if (selected) handleSelect(selected);
        }
    };

    const handleSelect = (item: any) => {
        if (item.category === 'Actions') onAction(item.id);
        if (item.category === 'Documents') onSelectDocument(item);
        if (item.category === 'Personnel') onSelectEmployee(item);
        if (item.category === 'Offices') onSelectOffice(item);
        onClose();
        setQuery('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
                >
                    {/* Search Input */}
                    <div className="flex items-center px-4 py-4 border-b border-slate-100">
                        <Search className="w-5 h-5 text-slate-400 mr-3" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search documents, personnel, or commands (Ctrl+K)..."
                            className="flex-1 bg-transparent border-none text-lg text-slate-800 focus:ring-0 placeholder:text-slate-400"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <div className="flex items-center space-x-1 ml-3">
                            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-500">ESC</span>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto max-h-[60vh] p-2"
                    >
                        {query.trim() === '' ? (
                            <div className="p-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Quick Navigation</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <QuickNavItem icon={LayoutDashboard} label="Dashboard" onClick={() => { onAction('go-dashboard'); onClose(); }} />
                                    <QuickNavItem icon={Library} label="Library" onClick={() => { onAction('go-library'); onClose(); }} />
                                    <QuickNavItem icon={Users} label="Personnel" onClick={() => { onAction('go-personnel'); onClose(); }} />
                                    <QuickNavItem icon={Building2} label="Offices" onClick={() => { onAction('go-offices'); onClose(); }} />
                                </div>
                            </div>
                        ) : flattenedResults.length > 0 ? (
                            <div className="space-y-1">
                                {flattenedResults.map((item, index) => (
                                    <button
                                        key={`${item.category}-${item.id || item.name || item.label}`}
                                        onClick={() => handleSelect(item)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        data-selected={index === selectedIndex}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${index === selectedIndex
                                            ? 'bg-abs-navy text-white shadow-lg shadow-abs-navy/20'
                                            : 'hover:bg-slate-50 text-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-lg mr-3 ${index === selectedIndex ? 'bg-white/20' : 'bg-slate-50'}`}>
                                                {React.createElement(item.icon || FileText, { size: 18, className: index === selectedIndex ? 'text-white' : 'text-abs-navy' })}
                                            </div>
                                            <div>
                                                <div className={`text-sm font-bold ${index === selectedIndex ? 'text-white' : 'text-slate-700'}`}>{item.label}</div>
                                                <div className={`text-[10px] uppercase font-black tracking-widest ${index === selectedIndex ? 'text-abs-steel' : 'text-slate-400'}`}>
                                                    {item.category} {item.department ? `• ${item.department}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                        {index === selectedIndex && <ArrowRight size={16} className="text-white/50" />}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={32} className="text-slate-200" />
                                </div>
                                <p className="text-slate-500 font-bold">No results found for "{query}"</p>
                                <p className="text-slate-400 text-sm">Try searching for documents, employees, or different keywords.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Hints */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center">↑↓ To Navigate</span>
                            <span className="flex items-center">↵ To Select</span>
                        </div>
                        <span>DocTrack Vanguard Intelligence</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function QuickNavItem({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-abs-navy/10 transition-all group"
        >
            <div className="p-2 bg-white rounded-lg mr-3 shadow-sm group-hover:bg-abs-navy transition-colors">
                <Icon size={16} className="text-abs-navy group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-bold text-slate-600 group-hover:text-abs-navy">{label}</span>
        </button>
    );
}
