import React, { useState, useMemo, useRef, useEffect } from 'react';
// ExcelJS is loaded dynamically in handleExportReport to avoid 940KB on initial page load
import { Filter, Download, Plus, Edit2, Trash2, Eye, Paperclip, AlertOctagon, AlertTriangle, Clock, CheckCircle2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Document, Employee, statsHistory } from '../mockData';
import { getExpiryDetails } from '../utils/expiry';
import { StatCard } from './StatCard';
import { ActivityLog, ActivityEntry } from './ActivityLog';
import { getDocumentIcon } from '../utils/icons';
import { useToast } from './Toast';

export function Dashboard({
  searchTerm,
  documents,
  activities,
  currentUser,
  onViewDocument,
  onEditDocument,
  onDeleteDocument,
  onOpenAssignModal
}: {
  searchTerm: string,
  documents: Document[],
  activities: ActivityEntry[],
  currentUser: Employee,
  onViewDocument: (doc: Document) => void,
  onEditDocument: (doc: Document) => void,
  onDeleteDocument: (doc: Document) => void,
  onOpenAssignModal: () => void
}) {
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const canManage = currentUser.role === 'Admin';
  const { showToast } = useToast();

  const documentsWithExpiry = useMemo(() => {
    return documents.map(doc => ({
      ...doc,
      expiryInfo: getExpiryDetails(doc.expiryDate)
    }));
  }, [documents]);

  // Sort by expiry date, with 'No Expiry' at the end. Expired docs first, then soonest.
  const sortedDocuments = useMemo(() => {
    return [...documentsWithExpiry].sort((a, b) => {
      if (a.expiryDate === 'No Expiry' && b.expiryDate === 'No Expiry') return 0;
      if (a.expiryDate === 'No Expiry') return 1;
      if (b.expiryDate === 'No Expiry') return -1;
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });
  }, [documentsWithExpiry]);

  const filteredDocuments = useMemo(() => {
    return sortedDocuments.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.holder.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatuses.size === 0 || selectedStatuses.has(doc.expiryInfo.status);
      return matchesSearch && matchesStatus;
    });
  }, [sortedDocuments, searchTerm, selectedStatuses]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const statusOptions = [
    { value: 'Expired', label: 'Expired', color: 'bg-red-500' },
    { value: 'Expiring < 30d', label: 'Expiring < 30 Days', color: 'bg-amber-500' },
    { value: 'Expiring < 60d', label: 'Expiring < 60 Days', color: 'bg-orange-400' },
    { value: 'Valid', label: 'Valid', color: 'bg-emerald-500' },
  ];

  const stats = useMemo(() => {
    const total = documentsWithExpiry.length;
    const expired = documentsWithExpiry.filter(d => d.expiryInfo.status === 'Expired').length;
    const soon30 = documentsWithExpiry.filter(d => d.expiryInfo.status === 'Expiring < 30d').length;
    const soon60 = documentsWithExpiry.filter(d => d.expiryInfo.status === 'Expiring < 60d').length;
    const valid = documentsWithExpiry.filter(d => d.expiryInfo.status === 'Valid').length;
    return { total, expired, soon30, soon60, valid };
  }, [documentsWithExpiry]);

  const handleExportReport = async () => {
    const ExcelJS = await import('exceljs');
    // Filter documents into the three relevant groups
    const expired = documentsWithExpiry.filter(d => d.expiryInfo.status === 'Expired');
    const soon30 = documentsWithExpiry.filter(d => d.expiryInfo.status === 'Expiring < 30d');
    const soon60 = documentsWithExpiry.filter(d => d.expiryInfo.status === 'Expiring < 60d');

    const toRows = (docs: typeof documentsWithExpiry) =>
      [...docs]
        .sort((a, b) => {
          if (a.expiryDate === 'No Expiry' && b.expiryDate === 'No Expiry') return 0;
          if (a.expiryDate === 'No Expiry') return 1;
          if (b.expiryDate === 'No Expiry') return -1;
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        })
        .map(d => ([
          d.id,
          d.title,
          d.type,
          d.holder,
          d.expiryDate,
          d.expiryInfo.status,
          d.expiryInfo.daysRemaining === Infinity ? 'Permanent' :
            (d.expiryInfo.daysRemaining < 0 ? `${Math.abs(d.expiryInfo.daysRemaining)} days ago` : `${d.expiryInfo.daysRemaining} days`)
        ]));

    const headers = ['Document ID', 'Document Name', 'Category', 'Holder', 'Expiry Date', 'Status', 'Days Remaining'];
    const colWidths = [12, 30, 22, 28, 14, 20, 18];

    const wb = new ExcelJS.default.Workbook();

    const addSheet = (name: string, rows: string[][]) => {
      const ws = wb.addWorksheet(name);
      ws.addRow(headers);
      rows.forEach(row => ws.addRow(row));
      ws.columns = colWidths.map((w, i) => ({ width: w, key: headers[i] }));
      // Bold header row
      ws.getRow(1).font = { bold: true };
    };

    addSheet('Expired', toRows(expired));
    addSheet('Expiring < 30 Days', toRows(soon30));
    addSheet('Expiring < 60 Days', toRows(soon60));

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `DocTrack_Report_${today}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(
      `Report exported: ${expired.length} expired, ${soon30.length} expiring <30d, ${soon60.length} expiring <60d`,
      'success'
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-auto p-8">

        {/* Stats Widgets */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
            <StatCard title="Expired" value={stats.expired} type="danger" icon={AlertOctagon} trend={66} data={statsHistory.expired} />
          </motion.div>
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
            <StatCard title="Expiring < 30 Days" value={stats.soon30} type="warning" icon={AlertTriangle} trend={-12} data={statsHistory.expiring} />
          </motion.div>
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
            <StatCard title="Expiring < 60 Days" value={stats.soon60} type="caution" icon={Clock} trend={5} data={[12, 14, 13, 16, 15, 14, 16]} />
          </motion.div>
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
            <StatCard title="Valid" value={stats.valid} type="success" icon={CheckCircle2} trend={2} data={statsHistory.valid} />
          </motion.div>
        </motion.div>

        {/* Data Grid Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden"
        >
          {/* Toolbar */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-4">
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setFilterOpen(prev => !prev)}
                  className={`flex items-center space-x-2 bg-white border text-sm rounded-xl px-4 py-2 font-bold transition-all active:scale-95 ${selectedStatuses.size > 0
                    ? 'border-blue-300 text-blue-700 ring-4 ring-blue-500/10'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>{selectedStatuses.size === 0 ? 'All Statuses' : `${selectedStatuses.size} Selected`}</span>
                  {selectedStatuses.size > 0 && (
                    <span className="ml-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {selectedStatuses.size}
                    </span>
                  )}
                </button>

                {filterOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 z-50 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Filter by Status</span>
                      {selectedStatuses.size > 0 && (
                        <button
                          onClick={() => setSelectedStatuses(new Set())}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    {statusOptions.map(opt => (
                      <label
                        key={opt.value}
                        className="flex items-center px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatuses.has(opt.value)}
                          onChange={() => toggleStatus(opt.value)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 mr-3 cursor-pointer"
                        />
                        <span className={`w-2 h-2 rounded-full ${opt.color} mr-2.5`} />
                        <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportReport}
                className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              {canManage && (
                <button
                  onClick={onOpenAssignModal}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-abs-red text-white rounded-xl text-sm font-black hover:bg-abs-red/90 transition-all shadow-lg shadow-abs-red/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Document</span>
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/10">
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Name</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Holder</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiration</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc, idx) => {
                      const StatusIcon = doc.expiryInfo.icon;
                      return (
                        <motion.tr
                          key={doc.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group hover:bg-blue-50/20 transition-all"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="mr-4 p-2.5 rounded-xl border transition-all shadow-sm bg-slate-50 border-slate-100 group-hover:bg-white group-hover:border-abs-navy/20">
                                {React.createElement(getDocumentIcon(doc.title), { className: 'w-4 h-4 text-slate-400 group-hover:text-abs-navy' })}
                              </div>
                              <div className="flex items-center">
                                <div onClick={() => onViewDocument(doc)} className="text-sm font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors decoration-blue-500/30 hover:underline">{doc.title}</div>
                                {doc.hasAttachment && (
                                  <div className="ml-2 p-1 bg-blue-50 rounded text-blue-500 border border-blue-100 shadow-sm" title={doc.attachmentName || 'Has Attachment'}>
                                    <Paperclip size={10} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm font-bold text-slate-700">{doc.holder}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm font-light text-slate-600 tabular-nums">{doc.expiryDate}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                              {doc.expiryInfo.daysRemaining === Infinity ? 'Permanent' :
                                doc.expiryInfo.daysRemaining < 0
                                  ? `${Math.abs(doc.expiryInfo.daysRemaining)}d overdue`
                                  : `In ${doc.expiryInfo.daysRemaining} days`}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${doc.expiryInfo.bgClass} ${doc.expiryInfo.borderClass} ${doc.expiryInfo.colorClass}`}>
                              <StatusIcon size={12} className="mr-2 opacity-70" />
                              {doc.expiryInfo.status}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <button
                                onClick={() => onViewDocument(doc)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => onEditDocument(doc)}
                                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                title="Quick Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => onDeleteDocument(doc)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Archive"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                          <Search size={32} className="text-slate-200" />
                        </div>
                        <p className="text-slate-500 font-bold">No documents match your filters</p>
                        <p className="text-slate-400 text-sm">Refine your search or clear filters to see more.</p>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <div className="w-80 border-l border-slate-200 bg-slate-50/30 overflow-y-auto hidden xl:block">
        <ActivityLog activities={activities} />
      </div>
    </div>
  );
}
