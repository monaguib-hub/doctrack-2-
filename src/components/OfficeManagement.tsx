import React, { useMemo, useState } from 'react';
import { Building2, Search, Plus, ChevronRight, ArrowLeft } from 'lucide-react';
import { Office, Document, DocumentCategory, Employee } from '../mockData';
import { OfficeProfile } from './OfficeProfile';
import { AddOfficeModal } from './Modals';

interface OfficeManagementProps {
  offices: Office[];
  documents: Document[];
  categories: DocumentCategory[];
  currentUser: Employee;
  onAssignDocument: (data: { title: string; type: string; expiryDate: string; holder: string; department: string; hasAttachment: boolean; attachmentName?: string; attachmentUrl?: string }) => void;
  onEditDocument: (docId: string, data: { expiryDate: string; hasAttachment?: boolean; attachmentName?: string; attachmentUrl?: string }) => void;
  onDeleteDocument: (docId: string) => void;
  onAddOffice: (data: { name: string; location: string; type: 'Main' | 'Branch' }) => void;
  onEditOffice: (name: string, data: { location: string; type: 'Main' | 'Branch' }) => void;
  onDeleteOffice: (name: string) => void;
  onViewDocument: (doc: Document) => void;
  initialSelectedName?: string | null;
  onInitialSelectionConsumed?: () => void;
}

export function OfficeManagement({
  offices,
  documents,
  categories,
  currentUser,
  onAssignDocument,
  onEditDocument,
  onDeleteDocument,
  onAddOffice,
  onEditOffice,
  onDeleteOffice,
  onViewDocument,
  initialSelectedName,
  onInitialSelectionConsumed
}: OfficeManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOfficeName, setSelectedOfficeName] = useState<string>(offices[0]?.name || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Mobile: whether the detail panel is currently showing
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  // When command palette navigates here, auto-select and consume
  React.useEffect(() => {
    if (initialSelectedName) {
      setSelectedOfficeName(initialSelectedName);
      setMobileShowDetail(true);
      onInitialSelectionConsumed?.();
    }
  }, [initialSelectedName]);

  const filteredOffices = useMemo(() =>
    offices
      .filter(off =>
        off.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        off.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
    [offices, searchTerm]
  );

  const selectedOffice = useMemo(() =>
    offices.find(off => off.name === selectedOfficeName),
    [offices, selectedOfficeName]
  );

  const handleSelectOffice = (name: string) => {
    setSelectedOfficeName(name);
    setMobileShowDetail(true);
  };

  const handleDeleteOffice = (name: string) => {
    onDeleteOffice(name);
    setMobileShowDetail(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden">

      {/* ── List panel: hidden on mobile when detail is open, w-80 pane on desktop ── */}
      <div className={`
        bg-white border-r border-slate-200 flex-col shadow-sm relative z-10
        w-full lg:w-80
        ${mobileShowDetail ? 'hidden lg:flex' : 'flex'}
      `}>
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs font-black text-slate-800 uppercase tracking-widest">
              <Building2 size={16} className="mr-2.5 text-abs-navy" />
              OFFICE LOG
            </div>
            {currentUser.role === 'Admin' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="p-2 bg-abs-navy text-white rounded-xl hover:bg-abs-navy/90 transition-all shadow-lg shadow-abs-navy/20 active:scale-95"
                title="Add Office"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search offices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-abs-navy focus:ring-4 focus:ring-abs-navy/10 transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto py-2 bg-white">
          {filteredOffices.length > 0 ? (
            filteredOffices.map((off) => (
              <button
                key={off.name}
                onClick={() => handleSelectOffice(off.name)}
                className={`w-full flex items-center px-5 py-4 transition-all border-l-4 ${selectedOfficeName === off.name
                  ? 'bg-slate-50 border-abs-navy text-slate-900 shadow-[inset_0_0_15px_rgba(0,48,87,0.05)]'
                  : 'bg-slate-50 border-abs-navy/20 text-abs-navy'
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${selectedOfficeName === off.name ? 'bg-abs-navy text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                  <Building2 size={18} />
                </div>
                <div className="ml-3.5 text-left overflow-hidden">
                  <p className={`text-sm font-bold truncate ${selectedOfficeName === off.name ? 'text-abs-navy' : 'text-slate-700'}`}>
                    {off.name}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 truncate">
                    {off.location}
                  </p>
                </div>
                <ChevronRight size={16} className={`ml-auto shrink-0 transition-all ${selectedOfficeName === off.name ? 'translate-x-0 text-abs-navy opacity-100' : '-translate-x-2 opacity-0'
                  }`} />
              </button>
            ))
          ) : (
            <div className="p-10 text-center">
              <Building2 size={32} className="text-slate-100 mx-auto mb-3" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No offices found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail panel: full-screen on mobile, flex-1 on desktop ── */}
      <div className={`
        flex-1 flex flex-col overflow-hidden
        ${mobileShowDetail ? 'flex' : 'hidden lg:flex'}
      `}>
        {/* Mobile back button */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center shrink-0">
          <button
            onClick={() => setMobileShowDetail(false)}
            className="flex items-center space-x-2 text-abs-navy font-bold text-sm hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={18} />
            <span>All Offices</span>
          </button>
        </div>

        {selectedOffice ? (
          <OfficeProfile
            office={selectedOffice}
            documents={documents}
            categories={categories}
            currentUser={currentUser}
            onAssignDocument={onAssignDocument}
            onEditDocument={onEditDocument}
            onDeleteDocument={onDeleteDocument}
            onEditOffice={onEditOffice}
            onDeleteOffice={handleDeleteOffice}
            onViewDocument={onViewDocument}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <Building2 size={48} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Select an office to view its compliance profile</p>
            </div>
          </div>
        )}
      </div>

      <AddOfficeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddOffice}
      />
    </div>
  );
}
