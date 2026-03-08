import React, { useMemo, useState } from 'react';
import { Building2, MapPin, Shield, FileText, Calendar, AlertCircle, CheckCircle2, Clock, Plus, Edit2, Trash2, Paperclip, Eye, AlertOctagon, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { Office, Document, DocumentCategory, Employee } from '../mockData';
import { getExpiryDetails } from '../utils/expiry';
import { AssignDocumentModal, EditDocumentModal, DeleteConfirmationModal, EditOfficeModal } from './Modals';
import { getDocumentIcon } from '../utils/icons';

interface OfficeProfileProps {
  office: Office;
  documents: Document[];
  categories: DocumentCategory[];
  currentUser: Employee;
  onAssignDocument: (data: { title: string; type: string; expiryDate: string; holder: string; department: string; hasAttachment: boolean; attachmentName?: string; attachmentUrl?: string }) => void;
  onEditDocument: (docId: string, data: { expiryDate: string; hasAttachment?: boolean; attachmentName?: string; attachmentUrl?: string }) => void;
  onDeleteDocument: (docId: string) => void;
  onEditOffice: (name: string, data: { location: string; type: 'Main' | 'Branch' }) => void;
  onDeleteOffice: (name: string) => void;
  onViewDocument: (doc: Document) => void;
}

export function OfficeProfile({
  office,
  documents,
  categories,
  currentUser,
  onAssignDocument,
  onEditDocument,
  onDeleteDocument,
  onEditOffice,
  onDeleteOffice,
  onViewDocument
}: OfficeProfileProps) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditOfficeModalOpen, setIsEditOfficeModalOpen] = useState(false);
  const [isDeleteOfficeModalOpen, setIsDeleteOfficeModalOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);

  const canManage = currentUser.role === 'Admin';

  const officeDocs = useMemo(() => {
    return documents
      .filter(doc => doc.holder === office.name)
      .map(doc => ({
        ...doc,
        expiryInfo: getExpiryDetails(doc.expiryDate)
      }));
  }, [office.name, documents]);

  const stats = useMemo(() => {
    const expired = officeDocs.filter(d => d.expiryInfo.status === 'Expired').length;
    const expiring30 = officeDocs.filter(d => d.expiryInfo.status === 'Expiring < 30d').length;
    const expiring60 = officeDocs.filter(d => d.expiryInfo.status === 'Expiring < 60d').length;
    const valid = officeDocs.filter(d => d.expiryInfo.status === 'Valid').length;
    return { expired, expiring30, expiring60, valid };
  }, [officeDocs]);

  const handleAssignSave = (data: { title: string; type: string; expiryDate: string; hasAttachment: boolean; attachmentName?: string; attachmentUrl?: string }) => {
    onAssignDocument({
      ...data,
      holder: office.name,
      department: 'Office'
    });
  };

  const handleEditClick = (doc: Document) => {
    setActiveDoc(doc);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (doc: Document) => {
    setActiveDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleEditSave = (data: { expiryDate: string; hasAttachment?: boolean; attachmentName?: string; attachmentUrl?: string }) => {
    if (activeDoc) {
      onEditDocument(activeDoc.id, data);
    }
  };

  const handleDeleteConfirm = () => {
    if (activeDoc) {
      onDeleteDocument(activeDoc.id);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditOfficeSave = (data: { location: string; type: 'Main' | 'Branch' }) => {
    onEditOffice(office.name, data);
  };

  const handleDeleteOfficeConfirm = () => {
    onDeleteOffice(office.name);
    setIsDeleteOfficeModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50/50">
      {/* Profile Header */}
      <div className="p-8 border-b border-slate-200 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-2xl bg-abs-navy flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-abs-navy/20 border border-white/10">
              <Building2 size={32} />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">{office.name}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1.5 text-abs-navy" />
                  {office.location}
                </div>
                <div className="flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                  <Shield size={12} className="mr-1.5 text-abs-steel" />
                  {office.type} Office
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {canManage && (
              <div className="flex items-center space-x-2 mr-2 pr-4 border-r border-slate-200">
                <button
                  onClick={() => setIsEditOfficeModalOpen(true)}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 rounded-xl transition-all shadow-sm"
                  title="Edit Office"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => setIsDeleteOfficeModalOpen(true)}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-all shadow-sm"
                  title="Delete Office"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
            <div className="min-w-[72px] text-center px-4 py-2 bg-white border border-slate-200 rounded-lg flex flex-col items-center shadow-sm">
              <div className="flex items-center text-slate-400 mb-1">
                <AlertOctagon size={12} className="mr-1.5" />
                <p className="text-[10px] uppercase font-bold tracking-wider">Expired</p>
              </div>
              <p className={`text-xl font-mono font-bold ${stats.expired > 0 ? 'text-abs-red' : 'text-slate-300'}`}>
                {stats.expired}
              </p>
            </div>
            <div className="min-w-[72px] text-center px-4 py-2 bg-white border border-slate-200 rounded-lg flex flex-col items-center shadow-sm">
              <div className="flex items-center text-slate-400 mb-1">
                <AlertTriangle size={12} className="mr-1.5" />
                <p className="text-[10px] uppercase font-bold tracking-wider">Expiring &lt; 30D</p>
              </div>
              <p className={`text-xl font-mono font-bold ${stats.expiring30 > 0 ? 'text-amber-500' : 'text-slate-300'}`}>
                {stats.expiring30}
              </p>
            </div>
            <div className="min-w-[72px] text-center px-4 py-2 bg-white border border-slate-200 rounded-lg flex flex-col items-center shadow-sm">
              <div className="flex items-center text-slate-400 mb-1">
                <Clock size={12} className="mr-1.5" />
                <p className="text-[10px] uppercase font-bold tracking-wider">Expiring &lt; 60D</p>
              </div>
              <p className={`text-xl font-mono font-bold ${stats.expiring60 > 0 ? 'text-yellow-500' : 'text-slate-300'}`}>
                {stats.expiring60}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Grid */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-700 flex items-center">
            <FileText className="mr-2.5 text-abs-navy" size={18} />
            Institutional Records
          </h3>
          {canManage && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-abs-red text-white rounded-lg text-sm font-bold hover:bg-abs-red/90 transition-all shadow-md shadow-abs-red/20 active:scale-95"
            >
              <Plus size={16} />
              <span>Assign Document</span>
            </button>
          )}
        </div>

        {officeDocs.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {officeDocs.map((doc) => {
              const StatusIcon = doc.expiryInfo.icon;
              return (
                <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2.5 rounded-lg bg-slate-50 border border-slate-100 group-hover:border-blue-200 group-hover:bg-white transition-all shadow-sm`}>
                        {React.createElement(getDocumentIcon(doc.title), { size: 18, className: "text-slate-400 group-hover:text-abs-navy" })}
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <h4 className="text-sm font-bold text-slate-700">{doc.title}</h4>
                          {doc.hasAttachment && (
                            <div className="ml-2 p-1 bg-blue-500/10 rounded text-blue-600" title={doc.attachmentName || 'Has Attachment'}>
                              <Paperclip size={10} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`flex items-center px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border-l-4 shadow-md ${doc.expiryInfo.bgClass} ${doc.expiryInfo.colorClass} ${doc.expiryInfo.borderClass.replace('border-', 'border-l-')}`}
                    >
                      <StatusIcon size={16} className="mr-2" />
                      {doc.expiryInfo.status}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Establishment Expiry</p>
                      <div className="flex items-center text-xs text-slate-500 font-mono font-medium">
                        <Clock size={12} className="mr-1.5 text-slate-400" />
                        {doc.expiryDate}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {canManage && (
                        <button
                          onClick={() => handleEditClick(doc)}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 rounded-lg transition-all shadow-sm"
                          title="Edit Document"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => onViewDocument(doc)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 rounded-lg transition-all shadow-sm"
                        title="View Document"
                      >
                        <Eye size={14} />
                      </button>
                      {canManage && (
                        <button
                          onClick={() => handleDeleteClick(doc)}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-lg transition-all shadow-sm"
                          title="Delete Document"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-slate-700 font-bold mb-2">No documents assigned</h4>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              This office doesn't have any document records in the system yet.
            </p>
          </div>
        )}
      </div>

      <AssignDocumentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSave={handleAssignSave}
        categories={categories}
        employeeName={office.name}
        isOffice={true}
      />

      <EditDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        document={activeDoc}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={activeDoc?.title || ''}
      />

      <EditOfficeModal
        isOpen={isEditOfficeModalOpen}
        onClose={() => setIsEditOfficeModalOpen(false)}
        onSave={handleEditOfficeSave}
        office={office}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOfficeModalOpen}
        onClose={() => setIsDeleteOfficeModalOpen(false)}
        onConfirm={handleDeleteOfficeConfirm}
        itemName={office.name}
        type="office"
      />
    </div>
  );
}
