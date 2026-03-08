import React, { useState, useMemo } from 'react';
import { Search, Users, ChevronRight, UserPlus, ArrowLeft } from 'lucide-react';
import { Employee, Document, DocumentCategory } from '../mockData';
import { EmployeeProfile } from './EmployeeProfile';
import { AddEmployeeModal } from './Modals';

interface EmployeeListProps {
  employees: Employee[];
  documents: Document[];
  categories: DocumentCategory[];
  currentUser: Employee;
  onAssignDocument: (data: { title: string; type: string; expiryDate: string; holder: string; department: string; hasAttachment: boolean; attachmentName?: string; attachmentUrl?: string }) => void;
  onEditDocument: (docId: string, data: { expiryDate: string; hasAttachment?: boolean; attachmentName?: string; attachmentUrl?: string }) => void;
  onDeleteDocument: (docId: string) => void;
  onAddEmployee: (data: { name: string; title: string; email: string; role: 'Admin' | 'Read-Only' }) => void;
  onEditEmployee: (email: string, data: { title: string; email: string; role: 'Admin' | 'Read-Only' }) => void;
  onDeleteEmployee: (email: string) => void;
  onViewDocument: (doc: Document) => void;
  initialSelectedName?: string | null;
  onInitialSelectionConsumed?: () => void;
}

export function EmployeeList({
  employees,
  documents,
  categories,
  currentUser,
  onAssignDocument,
  onEditDocument,
  onDeleteDocument,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onViewDocument,
  initialSelectedName,
  onInitialSelectionConsumed
}: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>(employees[0]?.name || '');
  const [sortBy, setSortBy] = useState<'name' | 'title' | 'email' | 'role'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Mobile: whether the detail panel is currently showing
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  // When command palette navigates here, auto-select and consume
  React.useEffect(() => {
    if (initialSelectedName) {
      setSelectedEmployeeName(initialSelectedName);
      setMobileShowDetail(true);
      onInitialSelectionConsumed?.();
    }
  }, [initialSelectedName]);

  const filteredEmployees = useMemo(() => {
    const filtered = employees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.sort((a, b) => {
      const valA = (a[sortBy] || '').toLowerCase();
      const valB = (b[sortBy] || '').toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [employees, searchTerm, sortBy, sortOrder]);

  const selectedEmployee = useMemo(() =>
    employees.find(emp => emp.name === selectedEmployeeName) || employees[0],
    [employees, selectedEmployeeName]
  );

  const handleSelectEmployee = (name: string) => {
    setSelectedEmployeeName(name);
    setMobileShowDetail(true);
  };

  const handleDeleteEmployee = (email: string) => {
    onDeleteEmployee(email);
    setMobileShowDetail(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full">

      {/* ── List panel: hidden on mobile when detail is open, w-80 pane on desktop ── */}
      <div className={`
        bg-white border-r border-slate-200 flex-col shadow-sm relative z-10
        w-full lg:w-80
        ${mobileShowDetail ? 'hidden lg:flex' : 'flex'}
      `}>
        <div className="p-5 border-b border-slate-100 space-y-5 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search personnel..."
              className="w-full bg-white border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-abs-navy focus:ring-4 focus:ring-abs-navy/10 transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-[10px] font-black text-slate-800 uppercase tracking-widest">
              <Users size={14} className="mr-2 text-abs-navy" />
              {filteredEmployees.length} PERSONNEL RECORDS
            </div>
            {currentUser.role === 'Admin' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="p-2 bg-abs-navy text-white rounded-xl hover:bg-abs-navy/90 transition-all shadow-lg shadow-abs-navy/20 active:scale-95"
                title="Add Employee"
              >
                <UserPlus size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <select
              className="flex-1 bg-transparent border-none text-[10px] font-bold text-slate-500 focus:ring-0 cursor-pointer uppercase tracking-widest"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="name">Sort by Name</option>
              <option value="title">Sort by Title</option>
              <option value="email">Sort by Email</option>
              <option value="role">Sort by Role</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="text-abs-red hover:text-abs-red/80 transition-colors p-1"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <ChevronRight size={14} strokeWidth={3} className={`transition-transform ${sortOrder === 'desc' ? 'rotate-90' : '-rotate-90'}`} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto py-2 bg-white">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <button
                key={emp.email}
                onClick={() => handleSelectEmployee(emp.name)}
                className={`w-full flex items-center px-5 py-4 transition-all border-l-4 ${selectedEmployeeName === emp.name
                  ? 'bg-slate-50 border-abs-navy text-slate-900 shadow-[inset_0_0_15px_rgba(0,48,87,0.05)]'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm ${selectedEmployeeName === emp.name ? 'bg-abs-navy text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                  {emp.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-3.5 text-left overflow-hidden">
                  <p className={`text-sm font-bold truncate ${selectedEmployeeName === emp.name ? 'text-blue-900' : 'text-slate-700'}`}>
                    {emp.name}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 truncate">
                    {emp.title}
                  </p>
                </div>
                <ChevronRight size={16} className={`ml-auto shrink-0 transition-all ${selectedEmployeeName === emp.name ? 'translate-x-0 text-abs-navy opacity-100' : '-translate-x-2 opacity-0'
                  }`} />
              </button>
            ))
          ) : (
            <div className="p-10 text-center">
              <Users size={32} className="text-slate-100 mx-auto mb-3" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No match found</p>
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
            <span>All Employees</span>
          </button>
        </div>

        {selectedEmployee ? (
          <EmployeeProfile
            employee={selectedEmployee}
            documents={documents}
            categories={categories}
            currentUser={currentUser}
            onAssignDocument={onAssignDocument}
            onEditDocument={onEditDocument}
            onDeleteDocument={onDeleteDocument}
            onEditEmployee={onEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onViewDocument={onViewDocument}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <Users size={48} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Select an employee to view their profile</p>
            </div>
          </div>
        )}
      </div>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddEmployee}
      />
    </div>
  );
}
