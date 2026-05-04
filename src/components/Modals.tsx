import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FolderPlus, FilePlus, Edit3, AlertTriangle, UserPlus, UserCircle, Eye, Download, FileText, Building2, Search, Plus, AlertCircle, CheckCircle2, Info, Key, Upload, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onSave: () => void;
  saveLabel?: string;
  variant?: 'primary' | 'danger';
  isSaving?: boolean;
}

function BaseModal({ isOpen, onClose, title, icon, children, onSave, saveLabel = 'Save', variant = 'primary', isSaving = false }: ModalProps) {
  const saveButtonClass = variant === 'danger'
    ? "px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-red-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    : "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-blue-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl border ${variant === 'danger' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                  {icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {children}
            </div>

            <div className="flex items-center justify-end space-x-3 p-5 bg-slate-50/50 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={isSaving}
                className={saveButtonClass}
              >
                {isSaving ? 'Processing...' : saveLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png';

function FileDropZone({
  file,
  onFileChange,
  inputId,
  label = 'Attach Document (PDF/JPG)'
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  inputId: string;
  label?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = React.useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && ACCEPTED_TYPES.includes(droppedFile.type)) {
      onFileChange(droppedFile);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="hidden"
          id={inputId}
        />

        {file ? (
          /* ── File selected state ── */
          <div className="flex items-center w-full px-4 py-3.5 border-2 border-blue-200 rounded-2xl bg-blue-50/40 transition-all">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 mr-3">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
              <p className="text-[10px] text-slate-400">{formatSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onFileChange(null); }}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0 ml-2"
              title="Remove file"
            >
              <XCircle size={18} />
            </button>
          </div>
        ) : (
          /* ── Drop zone / click-to-browse state ── */
          <label
            htmlFor={inputId}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex items-center justify-center w-full px-6 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 group ${
              isDragging
                ? 'border-blue-500 bg-blue-50/60 scale-[1.01] shadow-lg shadow-blue-500/10'
                : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            <div className="text-center pointer-events-none">
              <div className={`w-12 h-12 rounded-xl shadow-sm border flex items-center justify-center mx-auto mb-3 transition-all duration-200 ${
                isDragging
                  ? 'bg-blue-100 border-blue-200 scale-110'
                  : 'bg-white border-slate-100 group-hover:scale-110'
              }`}>
                <Upload className={`h-6 w-6 transition-colors duration-200 ${
                  isDragging ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
                }`} />
              </div>
              <p className={`text-xs font-bold mb-1 transition-colors duration-200 ${
                isDragging ? 'text-blue-700' : 'text-slate-600'
              }`}>
                {isDragging ? 'Drop file here' : 'Drag & drop or click to browse'}
              </p>
              <p className="text-[10px] text-slate-400">
                PDF, JPG or PNG up to 10MB
              </p>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}

export function AddCategoryModal({
  isOpen,
  onClose,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Category"
      icon={<FolderPlus size={20} />}
      onSave={handleSave}
      saveLabel="Create Category"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Category Name
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Port Passes, Certifications..."
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
      </div>
    </BaseModal>
  );
}

export function AddSubDocumentModal({
  isOpen,
  onClose,
  onSave,
  categoryName
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  categoryName: string;
}) {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Document Template"
      icon={<FilePlus size={20} />}
      onSave={handleSave}
      saveLabel="Add Template"
    >
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
          <p className="text-[10px] text-blue-600/60 uppercase font-bold tracking-widest mb-1.5">Adding to category</p>
          <div className="flex items-center text-blue-700">
            <FolderPlus size={14} className="mr-2 opacity-50" />
            <p className="text-sm font-bold">{categoryName}</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Template Name
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. HUET/BOSIET, ZAKAT Certificate..."
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
      </div>
    </BaseModal>
  );
}

export function EditModal({
  isOpen,
  onClose,
  onSave,
  initialValue,
  title,
  label
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialValue: string;
  title: string;
  label: string;
}) {
  const [name, setName] = useState(initialValue);

  // Update local state when initialValue changes (e.g. when opening for a different item)
  React.useEffect(() => {
    setName(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<Edit3 size={20} />}
      onSave={handleSave}
      saveLabel="Update Name"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {label}
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
      </div>
    </BaseModal>
  );
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  type = 'item'
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  type?: 'item' | 'employee' | 'office';
}) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Deletion"
      icon={<AlertTriangle size={20} />}
      onSave={onConfirm}
      saveLabel="Delete"
      variant="danger"
    >
      <div className="space-y-4">
        <p className="text-slate-600 leading-relaxed text-sm">
          {type === 'employee' ? (
            <>
              Are you sure you want to delete <span className="font-bold text-slate-900 border-b-2 border-red-100">{itemName}</span>?
              This action cannot be undone and all associated documents will be removed.
            </>
          ) : type === 'office' ? (
            <>
              Are you sure you want to delete <span className="font-bold text-slate-900 border-b-2 border-red-100">{itemName}</span>?
              This action cannot be undone and all office-level documents will be removed.
            </>
          ) : (
            <>
              Are you sure you want to delete <span className="font-bold text-slate-900 border-b-2 border-red-100">"{itemName}"</span>?
              This action cannot be undone.
            </>
          )}
        </p>
      </div>
    </BaseModal>
  );
}

export function AssignDocumentModal({
  isOpen,
  onClose,
  onSave,
  categories,
  employeeName,
  isOffice = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; type: string; expiryDate: string; hasAttachment: boolean; attachmentName?: string; attachmentUrl?: string }) => void;
  categories: any[];
  employeeName: string;
  isOffice?: boolean;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [noExpiry, setNoExpiry] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const sortedCategories = useMemo(() => {
    return [...categories]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(cat => ({
        ...cat,
        documents: [...cat.documents].sort((a: string, b: string) => a.localeCompare(b))
      }));
  }, [categories]);

  const { showToast } = useToast();

  const handleSave = async () => {
    if (!expiryDate && !noExpiry) {
      showToast('Please select an expiry date or mark as no expiry.', 'error');
      return;
    }

    if (selectedTemplate) {
      const category = categories.find(cat => cat.documents.includes(selectedTemplate));

      if (file) {
        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('attachments').upload(fileName, file);
        setIsUploading(false);
        if (error) {
          console.error('Upload Error:', error);
          return;
        }
        onSave({
          title: selectedTemplate,
          type: category?.name || 'Other',
          expiryDate: noExpiry ? 'No Expiry' : expiryDate,
          hasAttachment: true,
          attachmentName: file.name,
          attachmentUrl: fileName
        });
        resetAndClose();
      } else {
        onSave({
          title: selectedTemplate,
          type: category?.name || 'Other',
          expiryDate: noExpiry ? 'No Expiry' : expiryDate,
          hasAttachment: false
        });
        resetAndClose();
      }
    }
  };

  const resetAndClose = () => {
    setFile(null);
    setSelectedTemplate('');
    setExpiryDate('');
    setNoExpiry(false);
    setIsUploading(false);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Document"
      icon={<FilePlus size={20} />}
      onSave={handleSave}
      saveLabel={isOffice ? "Add to Office" : "Assign to Employee"}
      isSaving={isUploading}
    >
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
          <p className="text-[10px] text-blue-600/60 uppercase font-bold tracking-widest mb-1.5">Assigning to</p>
          <div className="flex items-center text-blue-700">
            {isOffice ? <Building2 size={14} className="mr-2 opacity-50" /> : <UserCircle size={14} className="mr-2 opacity-50" />}
            <p className="text-sm font-bold">{employeeName}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Document Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          >
            <option value="">Select a template...</option>
            {sortedCategories.map(cat => (
              <optgroup key={cat.id} label={cat.name}>
                {cat.documents.map((doc: string) => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              disabled={noExpiry}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm ${noExpiry ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="noExpiry"
            checked={noExpiry}
            onChange={(e) => setNoExpiry(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="noExpiry" className="text-sm text-slate-500 font-medium cursor-pointer">Document has no expiry date</label>
        </div>

        <FileDropZone
          file={file}
          onFileChange={setFile}
          inputId="file-upload"
        />
      </div>
    </BaseModal>
  );
}

export function GlobalAssignDocumentModal({
  isOpen,
  onClose,
  onSave,
  categories,
  employees,
  offices
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; type: string; expiryDate: string; holder: string; department: string; hasAttachment: boolean; attachmentName?: string; attachmentUrl?: string }) => void;
  categories: any[];
  employees: any[];
  offices: any[];
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedHolder, setSelectedHolder] = useState<{ id: string, name: string, department: string, type: 'Employee' | 'Office' } | null>(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [noExpiry, setNoExpiry] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Build sorted lists for the dropdown
  const sortedEmployees = useMemo(() =>
    [...employees].sort((a, b) => a.name.localeCompare(b.name)), [employees]);
  const sortedOffices = useMemo(() =>
    [...offices].sort((a, b) => a.name.localeCompare(b.name)), [offices]);

  const { showToast } = useToast();

  const handleSave = async () => {
    if (!expiryDate && !noExpiry) {
      showToast('Please select an expiry date or mark as no expiry.', 'error');
      return;
    }

    if (selectedTemplate && selectedHolder) {
      const category = categories.find(cat => cat.documents.includes(selectedTemplate));

      const finalize = (attachment?: { name: string, url: string }) => {
        onSave({
          title: selectedTemplate,
          type: category?.name || 'Other',
          expiryDate: noExpiry ? 'No Expiry' : expiryDate,
          holder: selectedHolder.name,
          department: selectedHolder.department,
          hasAttachment: !!attachment,
          attachmentName: attachment?.name,
          attachmentUrl: attachment?.url
        });
        resetAndClose();
      };

      if (file) {
        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('attachments').upload(fileName, file);
        setIsUploading(false);
        if (error) {
          console.error('Upload Error:', error);
          return;
        }
        finalize({ name: file.name, url: fileName });
      } else {
        finalize();
      }
    }
  };

  const resetAndClose = () => {
    setFile(null);
    setSelectedTemplate('');
    setSelectedHolder(null);
    setExpiryDate('');
    setNoExpiry(false);
    setIsUploading(false);
    onClose();
  };

  const handleHolderChange = (val: string) => {
    if (!val) { setSelectedHolder(null); return; }
    const [type, ...rest] = val.split(':');
    const name = rest.join(':');
    if (type === 'emp') {
      const emp = employees.find(e => e.name === name);
      if (emp) setSelectedHolder({ id: emp.email, name: emp.name, department: emp.title, type: 'Employee' });
    } else {
      const off = offices.find(o => o.name === name);
      if (off) setSelectedHolder({ id: off.id, name: off.name, department: 'Corporate Office', type: 'Office' });
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Global Document Assignment"
      icon={<FilePlus size={20} />}
      onSave={handleSave}
      saveLabel="Create & Assign"
      isSaving={isUploading}
    >
      <div className="space-y-4">
        {/* Holder Selection — Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Assign To (Employee or Office)
          </label>
          <select
            value={selectedHolder ? `${selectedHolder.type === 'Employee' ? 'emp' : 'off'}:${selectedHolder.name}` : ''}
            onChange={(e) => handleHolderChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          >
            <option value="">Select employee or office...</option>
            <optgroup label="Employees">
              {sortedEmployees.map(e => (
                <option key={e.email} value={`emp:${e.name}`}>{e.name} — {e.title}</option>
              ))}
            </optgroup>
            <optgroup label="Offices">
              {sortedOffices.map(o => (
                <option key={o.id} value={`off:${o.name}`}>{o.name} — {o.location}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Document Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          >
            <option value="">Select a template...</option>
            {[...categories]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(cat => (
                <optgroup key={cat.id} label={cat.name}>
                  {[...cat.documents]
                    .sort((a: string, b: string) => a.localeCompare(b))
                    .map((doc: string) => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                </optgroup>
              ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              disabled={noExpiry}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm ${noExpiry ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="noExpiryGlobal"
            checked={noExpiry}
            onChange={(e) => setNoExpiry(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="noExpiryGlobal" className="text-sm text-slate-500 font-medium cursor-pointer">Document has no expiry date</label>
        </div>

        <FileDropZone
          file={file}
          onFileChange={setFile}
          inputId="file-upload-global"
        />
      </div>
    </BaseModal>
  );
}

export function EditDocumentModal({
  isOpen,
  onClose,
  onSave,
  document
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { expiryDate: string; hasAttachment?: boolean; attachmentName?: string; attachmentUrl?: string }) => void;
  document: any;
}) {
  const [expiryDate, setExpiryDate] = useState(document?.expiryDate === 'No Expiry' ? '' : document?.expiryDate || '');
  const [noExpiry, setNoExpiry] = useState(document?.expiryDate === 'No Expiry');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  React.useEffect(() => {
    if (document) {
      setExpiryDate(document.expiryDate === 'No Expiry' ? '' : document.expiryDate);
      setNoExpiry(document.expiryDate === 'No Expiry');
      setFile(null);
    }
  }, [document]);

  const { showToast } = useToast();

  const handleSave = async () => {
    if (!expiryDate && !noExpiry) {
      showToast('Please select an expiry date or mark as no expiry.', 'error');
      return;
    }

    if (file) {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('attachments').upload(fileName, file);
      setIsUploading(false);
      if (error) {
        console.error('Upload error:', error);
        return;
      }
      onSave({
        expiryDate: noExpiry ? 'No Expiry' : expiryDate,
        hasAttachment: true,
        attachmentName: file.name,
        attachmentUrl: fileName
      });
      onClose();
    } else {
      onSave({
        expiryDate: noExpiry ? 'No Expiry' : expiryDate,
        hasAttachment: document?.hasAttachment,
        attachmentName: document?.attachmentName,
        attachmentUrl: document?.attachmentUrl
      });
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Document"
      icon={<Edit3 size={20} />}
      onSave={handleSave}
      saveLabel="Update Document"
      isSaving={isUploading}
    >
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
          <p className="text-[10px] text-blue-600/60 uppercase font-bold tracking-widest mb-1.5">Editing Document</p>
          <div className="flex items-center text-blue-700">
            <FileText size={14} className="mr-2 opacity-50" />
            <p className="text-sm font-bold">{document?.title}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Expiry Date
          </label>
          <input
            type="date"
            value={expiryDate}
            disabled={noExpiry}
            onChange={(e) => setExpiryDate(e.target.value)}
            className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm ${noExpiry ? 'opacity-40 cursor-not-allowed' : ''}`}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="noExpiryEdit"
            checked={noExpiry}
            onChange={(e) => setNoExpiry(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="noExpiryEdit" className="text-sm text-slate-500 font-medium cursor-pointer">Document has no expiry date</label>
        </div>

        <FileDropZone
          file={file}
          onFileChange={setFile}
          inputId="file-upload-edit"
          label="Update Attachment (PDF/JPG)"
        />
      </div>
    </BaseModal>
  );
}

export function AddEmployeeModal({
  isOpen,
  onClose,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; title: string; email: string; role: 'Admin' | 'Read-Only'; dob: string }) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    role: 'Read-Only' as 'Admin' | 'Read-Only',
    dob: ''
  });

  const handleSave = () => {
    if (formData.name && formData.title && formData.email) {
      onSave(formData);
      setFormData({ name: '', title: '', email: '', role: 'Read-Only', dob: '' });
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Employee"
      icon={<UserPlus size={20} />}
      onSave={handleSave}
      saveLabel="Add Employee"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <input
            autoFocus
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. John Doe"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Surveyor II"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Work Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="e.g. john.doe@abs-group.com"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Access Level
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormData(prev => ({ ...prev, role: 'Admin' }))}
              className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${formData.role === 'Admin'
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              Admin
            </button>
            <button
              onClick={() => setFormData(prev => ({ ...prev, role: 'Read-Only' }))}
              className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${formData.role === 'Read-Only'
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              Read-Only
            </button>
          </div>
          <p className="mt-2 text-[10px] text-slate-500 leading-tight">
            Read-Only users cannot create, edit, or delete any data.
          </p>
        </div>
      </div>
    </BaseModal>
  );
}

export function AddOfficeModal({
  isOpen,
  onClose,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; location: string; type: 'Main' | 'Branch' }) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'Branch' as 'Main' | 'Branch'
  });

  const handleSave = () => {
    if (formData.name && formData.location) {
      onSave(formData);
      setFormData({ name: '', location: '', type: 'Branch' });
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Office"
      icon={<Building2 size={20} />}
      onSave={handleSave}
      saveLabel="Add Office"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Office Name
          </label>
          <input
            autoFocus
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. ABS MIDEAST Dammam"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g. Dammam, KSA"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Office Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormData(prev => ({ ...prev, type: 'Main' }))}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${formData.type === 'Main'
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              Main Office
            </button>
            <button
              onClick={() => setFormData(prev => ({ ...prev, type: 'Branch' }))}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${formData.type === 'Branch'
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              Branch
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export function EditOfficeModal({
  isOpen,
  onClose,
  onSave,
  office
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { location: string; type: 'Main' | 'Branch' }) => void;
  office: any;
}) {
  const [formData, setFormData] = useState({
    location: '',
    type: 'Branch' as 'Main' | 'Branch'
  });

  React.useEffect(() => {
    if (office) {
      setFormData({
        location: office.location,
        type: office.type
      });
    }
  }, [office]);

  const handleSave = () => {
    if (formData.location) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Office Details"
      icon={<Building2 size={20} />}
      onSave={handleSave}
      saveLabel="Update Details"
    >
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
          <p className="text-[10px] text-blue-600/60 uppercase font-bold tracking-widest mb-1.5">Editing Office</p>
          <div className="flex items-center text-blue-700">
            <Building2 size={14} className="mr-2 opacity-50" />
            <p className="text-sm font-bold">{office?.name}</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Location
          </label>
          <input
            autoFocus
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Office Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormData(prev => ({ ...prev, type: 'Main' }))}
              className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${formData.type === 'Main'
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              Main Office
            </button>
            <button
              onClick={() => setFormData(prev => ({ ...prev, type: 'Branch' }))}
              className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${formData.type === 'Branch'
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              Branch
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export function EditEmployeeModal({
  isOpen,
  onClose,
  onSave,
  employee
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; email: string; role: 'Admin' | 'Read-Only'; dob: string }) => void;
  employee: any;
}) {
  const [formData, setFormData] = useState({
    title: '',
    email: '',
    role: 'Read-Only' as 'Admin' | 'Read-Only',
    dob: ''
  });

  React.useEffect(() => {
    if (employee) {
      setFormData({
        title: employee.title,
        email: employee.email,
        role: employee.role || 'Read-Only',
        dob: employee.dob || ''
      });
    }
  }, [employee]);

  const handleSave = () => {
    if (formData.title && formData.email) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Employee Details"
      icon={<UserCircle size={20} />}
      onSave={handleSave}
      saveLabel="Update Details"
    >
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
          <p className="text-[10px] text-blue-600/60 uppercase font-bold tracking-widest mb-1.5">Editing Profile</p>
          <div className="flex items-center text-blue-700">
            <UserCircle size={14} className="mr-2 opacity-50" />
            <p className="text-sm font-bold">{employee?.name}</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Job Title
          </label>
          <input
            autoFocus
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Work Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Access Level
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormData(prev => ({ ...prev, role: 'Admin' }))}
              className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${formData.role === 'Admin'
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              Admin
            </button>
            <button
              onClick={() => setFormData(prev => ({ ...prev, role: 'Read-Only' }))}
              className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${formData.role === 'Read-Only'
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              Read-Only
            </button>
          </div>
          <p className="mt-2 text-[10px] text-slate-500 leading-tight">
            Read-Only users cannot create, edit, or delete any data.
          </p>
        </div>
      </div>
    </BaseModal>
  );
}

export function ViewDocumentModal({
  isOpen,
  onClose,
  document
}: {
  isOpen: boolean;
  onClose: () => void;
  document: any;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    async function loadUrl() {
      if (document?.hasAttachment && document?.attachmentUrl) {
        if (document.attachmentUrl.startsWith('http')) {
          if (mounted) setSignedUrl(document.attachmentUrl);
          return;
        }
        
        setIsLoadingUrl(true);
        const { data, error } = await supabase.storage.from('attachments').createSignedUrl(document.attachmentUrl, 60 * 60);
        if (error) {
          console.error("Error creating signed URL:", error);
          if (mounted) setSignedUrl(null);
        } else {
          if (mounted) setSignedUrl(data.signedUrl);
        }
        if (mounted) setIsLoadingUrl(false);
      } else {
        if (mounted) setSignedUrl(null);
      }
    }
    
    if (isOpen) {
      loadUrl();
    } else {
      setSignedUrl(null);
    }
    
    return () => { mounted = false; };
  }, [document, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">{document?.title}</h3>
                  <p className="text-xs text-slate-400 font-medium">{document?.holder} • {document?.department}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 bg-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 bg-slate-50/30">
              {document?.hasAttachment ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[500px] border-2 border-dashed border-slate-200 rounded-2xl bg-white shadow-sm p-8 text-center">
                  {document.attachmentUrl ? (
                    isLoadingUrl ? (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-slate-500 font-medium">Securing connection to attachment...</p>
                      </div>
                    ) : signedUrl ? (
                      <div className="w-full h-full flex flex-col items-center">
                        {(signedUrl && (signedUrl.startsWith('data:image/') || /\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(document.attachmentUrl))) ? (
                          <img
                            src={signedUrl}
                            alt={document.attachmentName}
                            className="max-w-full max-h-[500px] rounded-lg shadow-lg mb-4 object-contain"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 border border-blue-100">
                            <FileText size={44} className="text-blue-600 shadow-sm" />
                          </div>
                        )}
                        <h4 className="text-xl font-bold text-slate-800 mb-2">{document.attachmentName || 'Document Attachment'}</h4>
                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                          <button
                            onClick={async () => {
                              try {
                                if (!signedUrl) return;
                                const response = await fetch(signedUrl);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = document.attachmentName || 'attachment';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                              } catch (err) {
                                console.error('Download failed:', err);
                                if (signedUrl) window.open(signedUrl, '_blank');
                              }
                            }}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center space-x-3 active:scale-95"
                          >
                            <Download size={20} />
                            <span>Download Attachment</span>
                          </button>
                          
                          <a
                            href={signedUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center space-x-3 active:scale-95"
                          >
                            <ExternalLink size={20} />
                            <span>Open in New Tab</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border border-red-100">
                          <AlertTriangle size={44} className="text-red-500" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">{document.attachmentName || 'Document Attachment'}</h4>
                        <p className="text-slate-400 max-w-sm mb-8 font-medium">
                          Failed to generate a secure link. You may not have permission to view this file.
                        </p>
                      </>
                    )
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 border border-blue-100">
                        <FilePlus size={44} className="text-blue-600" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 mb-2">{document.attachmentName || 'Document Attachment'}</h4>
                      <p className="text-slate-400 max-w-sm mb-8 font-medium">
                        The secure attachment record exists, but the file binary is currently unavailable in this view.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle size={32} className="text-slate-300" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-700 mb-2">No Attachment Linked</h4>
                  <p className="text-slate-400 text-sm max-w-xs">This compliance record does not have a physical document attached to it.</p>
                </div>
              )}
            </div>

            <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">ESTABLISHMENT EXPIRY</span>
                  <span className={`font-mono font-bold text-sm ${document?.expiryDate === 'Expired' ? 'text-red-500' : 'text-slate-600'}`}>
                    {document?.expiryDate}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-xl transition-all active:scale-95"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </div>
      )
      }
    </AnimatePresence >
  );
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setError('');
    if (!password || !confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await onSave(password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
      icon={<Key size={20} />}
      onSave={handleSave}
      saveLabel={loading ? 'Updating...' : 'Update Password'}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-widest text-[10px]">New Password</label>
          <input
            type="password"
            className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-widest text-[10px]">Confirm New Password</label>
          <input
            type="password"
            className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
          />
        </div>
      </div>
    </BaseModal>
  );
}
