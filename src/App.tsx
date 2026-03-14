import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  LayoutDashboard,
  Library,
  Users,
  Building2,
  Search,
  Anchor,
  Edit2,
  Download,
  Paperclip,
  FileText,
  Shield,
  User,
  Calendar,
  Clock,
  Mail,
  Menu,
  X,
  LogOut,
  Key,
} from 'lucide-react';
import { Document, DocumentCategory, Employee, Office } from './mockData';
import { getExpiryDetails } from './utils/expiry';
import { Dashboard } from './components/Dashboard';
import { DocumentLibrary } from './components/DocumentLibrary';
import { EmployeeList } from './components/EmployeeList';
import { OfficeManagement } from './components/OfficeManagement';
import { ActivityEntry } from './components/ActivityLog';
import { useToast } from './components/Toast';
import { EditDocumentModal, DeleteConfirmationModal, GlobalAssignDocumentModal, ChangePasswordModal } from './components/Modals';
import { CommandPalette } from './components/CommandPalette';
import { SidePanel, DetailItem, SectionHeader } from './components/SidePanel';
import { AuthPage } from './components/AuthPage';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';

export default function App() {
  const { session, loading: authLoading, signOut, updatePassword } = useAuth();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state — loaded from Supabase
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  // Track whether we've already loaded data for this session so tab-focus
  // token refreshes don't re-trigger the loading screen.
  const dataLoadedRef = React.useRef<string | null>(null);

  // Global Modal States

  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<Document | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<{ type: 'document' | 'employee', data: any } | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Command palette navigation — pass to child components so they pre-select
  const [navigateToEmployee, setNavigateToEmployee] = useState<string | null>(null);
  const [navigateToOffice, setNavigateToOffice] = useState<string | null>(null);

  // Load all data from Supabase after session is set.
  // Only runs when the logged-in user CHANGES (not on silent token refreshes).
  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) {
      // Signed out — reset so next sign-in loads fresh data
      dataLoadedRef.current = null;
      setDataLoading(true);
      return;
    }

    // Already loaded for this user — skip reload
    if (dataLoadedRef.current === userId) return;
    dataLoadedRef.current = userId;

    const loadData = async () => {
      setDataLoading(true);
      try {
        // Load employees
        const { data: emps } = await supabase.from('employees').select('*').order('name');
        if (emps) {
          const mapped = emps.map(e => ({ name: e.name, email: e.email, title: e.title, role: e.role as 'Admin' | 'Read-Only', dob: e.dob || '' }));
          setEmployees(mapped);
          // Derive current user from session email
          const me = mapped.find(e => e.email.toLowerCase() === session.user.email?.toLowerCase());
          setCurrentUser(me || mapped[0]);
        }

        // Load offices
        const { data: offs } = await supabase.from('offices').select('*').order('name');
        if (offs) setOffices(offs.map(o => ({ name: o.name, location: o.location, type: o.type as 'Main' | 'Branch' })));

        // Load categories with their document templates
        const { data: cats } = await supabase.from('document_categories').select('*').order('name');
        const { data: catDocs } = await supabase.from('category_documents').select('*').order('sort_order');
        if (cats && catDocs) {
          setCategories(cats.map(c => ({
            id: c.id,
            name: c.name,
            documents: catDocs.filter(d => d.category_id === c.id).map(d => d.name)
          })));
        }

        // Load documents
        const { data: docs } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
        if (docs) {
          setDocuments(docs.map(d => ({
            id: d.id, title: d.title, type: d.type, holder: d.holder,
            expiryDate: d.expiry_date, department: d.department,
            hasAttachment: d.has_attachment, attachmentName: d.attachment_name, attachmentUrl: d.attachment_url
          })));
        }

        // Load activity log
        const { data: acts } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(50);
        if (acts) {
          setActivities(acts.map(a => ({
            id: a.id,
            user: a.user_name,
            action: a.action,
            target: a.target,
            type: a.type as 'update' | 'delete' | 'create',
            timestamp: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        }
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [session?.user.id]);

  // Command Palette Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addActivity = useCallback((user: string, action: string, target: string, type: ActivityEntry['type']) => {
    const id = Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActivities(prev => [{ id, user, action, target, type, timestamp }, ...prev].slice(0, 50));
    // Persist to Supabase (fire-and-forget)
    supabase.from('activity_log').insert({ id, user_name: user, action, target, type }).then();
  }, []);

  // --- CRUD Handlers (Supabase-backed) ---

  const handleAssignDocument = useCallback(async (data: { title: string; type: string; expiryDate: string; holder: string; department: string; hasAttachment: boolean; attachmentName?: string; attachmentUrl?: string }) => {
    const newDoc = {
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: data.title, type: data.type, holder: data.holder,
      expiry_date: data.expiryDate, department: data.department,
      has_attachment: data.hasAttachment, attachment_name: data.attachmentName, attachment_url: data.attachmentUrl
    };
    const { error } = await supabase.from('documents').insert(newDoc);
    if (error) { showToast('Failed to assign document', 'error'); return; }
    setDocuments(prev => [{ ...data, id: newDoc.id, expiryDate: data.expiryDate }, ...prev]);
    showToast(`"${data.title}" assigned to ${data.holder}`, 'success');
    addActivity(currentUser?.name || 'System', 'Assigned document', data.title, 'create');
  }, [showToast, addActivity, currentUser]);

  const handleEditDocument = useCallback(async (docId: string, data: { expiryDate: string; hasAttachment?: boolean; attachmentName?: string; attachmentUrl?: string }) => {
    const { error } = await supabase.from('documents').update({
      expiry_date: data.expiryDate, has_attachment: data.hasAttachment,
      attachment_name: data.attachmentName, attachment_url: data.attachmentUrl
    }).eq('id', docId);
    if (error) { showToast('Failed to update document', 'error'); return; }
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, expiryDate: data.expiryDate, hasAttachment: data.hasAttachment, attachmentName: data.attachmentName, attachmentUrl: data.attachmentUrl } : d));
    showToast('Document updated', 'success');
    addActivity(currentUser?.name || 'System', 'Updated document', docId, 'update');
  }, [showToast, addActivity, currentUser]);

  const handleDeleteDocument = useCallback(async (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    const { error } = await supabase.from('documents').delete().eq('id', docId);
    if (error) { showToast('Failed to delete document', 'error'); return; }
    setDocuments(prev => prev.filter(d => d.id !== docId));
    showToast(`Document deleted`, 'error');
    addActivity(currentUser?.name || 'System', 'Deleted document', doc?.title || docId, 'delete');
  }, [documents, showToast, addActivity, currentUser]);

  const handleAddEmployee = useCallback(async (data: { name: string; title: string; email: string; role: 'Admin' | 'Read-Only'; dob: string }) => {
    const { error } = await supabase.from('employees').insert({ name: data.name, title: data.title, email: data.email, role: data.role, dob: data.dob || null });
    if (error) { showToast('Failed to add employee', 'error'); return; }
    setEmployees(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    showToast(`${data.name} added`, 'success');
    addActivity(currentUser?.name || 'System', 'Added employee', data.name, 'create');
  }, [showToast, addActivity, currentUser]);

  const handleEditEmployee = useCallback(async (email: string, data: { title: string; email: string; role: 'Admin' | 'Read-Only'; dob: string }) => {
    const { error } = await supabase.from('employees').update({ title: data.title, email: data.email, role: data.role, dob: data.dob || null }).eq('email', email);
    if (error) { showToast('Failed to update employee', 'error'); return; }
    setEmployees(prev => prev.map(e => e.email === email ? { ...e, ...data } : e));
    if (currentUser?.email === email) setCurrentUser(prev => prev ? { ...prev, ...data } : prev);
    showToast('Employee updated', 'success');
    addActivity(currentUser?.name || 'System', 'Updated employee', email, 'update');
  }, [showToast, addActivity, currentUser]);

  const handleDeleteEmployee = useCallback(async (email: string) => {
    const emp = employees.find(e => e.email === email);
    const { error } = await supabase.from('employees').delete().eq('email', email);
    if (error) { showToast('Failed to delete employee', 'error'); return; }
    setEmployees(prev => prev.filter(e => e.email !== email));
    setDocuments(prev => prev.filter(d => d.holder !== emp?.name));
    if (emp) await supabase.from('documents').delete().eq('holder', emp.name);
    showToast(`${emp?.name} removed`, 'error');
    addActivity(currentUser?.name || 'System', 'Removed employee', emp?.name || email, 'delete');
  }, [employees, showToast, addActivity, currentUser]);

  const handleAddOffice = useCallback(async (data: { name: string; location: string; type: 'Main' | 'Branch' }) => {
    const { error } = await supabase.from('offices').insert(data);
    if (error) { showToast('Failed to add office', 'error'); return; }
    setOffices(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    showToast(`${data.name} added`, 'success');
    addActivity(currentUser?.name || 'System', 'Added office', data.name, 'create');
  }, [showToast, addActivity, currentUser]);

  const handleEditOffice = useCallback(async (name: string, data: { location: string; type: 'Main' | 'Branch' }) => {
    const { error } = await supabase.from('offices').update(data).eq('name', name);
    if (error) { showToast('Failed to update office', 'error'); return; }
    setOffices(prev => prev.map(o => o.name === name ? { ...o, ...data } : o));
    showToast('Office updated', 'success');
    addActivity(currentUser?.name || 'System', 'Updated office', name, 'update');
  }, [showToast, addActivity, currentUser]);

  const handleDeleteOffice = useCallback(async (name: string) => {
    const { error } = await supabase.from('offices').delete().eq('name', name);
    if (error) { showToast('Failed to delete office', 'error'); return; }
    setOffices(prev => prev.filter(o => o.name !== name));
    setDocuments(prev => prev.filter(d => d.holder !== name));
    await supabase.from('documents').delete().eq('holder', name);
    showToast(`${name} removed`, 'error');
    addActivity(currentUser?.name || 'System', 'Removed office', name, 'delete');
  }, [showToast, addActivity, currentUser]);

  const documentsWithExpiry = useMemo(() => documents.map(doc => ({ ...doc, expiryInfo: getExpiryDetails(doc.expiryDate) })), [documents]);
  const stats = useMemo(() => ({ expired: documentsWithExpiry.filter(d => d.expiryInfo.status === 'Expired').length }), [documentsWithExpiry]);

  // --- Render ---

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-abs-navy">
        <div className="text-center">
          <Anchor className="w-10 h-10 text-abs-red mx-auto mb-4 animate-pulse" />
          <p className="text-abs-steel/60 text-sm font-bold uppercase tracking-widest">Loading DocTrack...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — show login
  if (!session) {
    return <AuthPage />;
  }

  // Data loading
  if (dataLoading || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <Anchor className="w-8 h-8 text-abs-navy mx-auto mb-3 animate-pulse" />
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Loading your data...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-abs-navy flex flex-col shadow-2xl z-20 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Anchor className="w-6 h-6 text-abs-red mr-3" />
          <span className="text-lg font-black tracking-widest text-white">DOCTRACK</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => { setActiveTab('Dashboard'); setSidebarOpen(false); }} />
          <NavItem icon={<Library size={20} />} label="Library" active={activeTab === 'Library'} onClick={() => { setActiveTab('Library'); setSidebarOpen(false); }} />
          <NavItem icon={<Users size={20} />} label="Employees" active={activeTab === 'Employees'} onClick={() => { setActiveTab('Employees'); setSidebarOpen(false); }} />
          <NavItem icon={<Building2 size={20} />} label="Offices" active={activeTab === 'Offices'} onClick={() => { setActiveTab('Offices'); setSidebarOpen(false); }} />
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/5 bg-black/10 flex flex-col space-y-4">
          <div className="space-y-1">
            <button
              onClick={async () => { await signOut(); }}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-abs-steel/70 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest w-full justify-start"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-abs-steel/70 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest w-full justify-start"
            >
              <Key size={14} />
              <span>Change Password</span>
            </button>
          </div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold shrink-0 ${currentUser.role === 'Admin' ? 'bg-abs-red text-white' : 'bg-abs-steel/20 text-abs-steel'}`}>
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-abs-steel/70 uppercase tracking-widest truncate">{currentUser.title}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-bold text-slate-800">{activeTab}</h1>
          </div>

          <div className="flex items-center">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search resources..."
                className="bg-slate-50 border border-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 w-72 transition-all placeholder:text-slate-400 text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Content */}
        {activeTab === 'Dashboard' && (
          <Dashboard
            searchTerm={searchTerm}
            documents={documents}
            activities={activities}
            currentUser={currentUser}
            onViewDocument={(doc) => setSelectedInsight({ type: 'document', data: doc })}
            onEditDocument={(doc) => setEditDoc(doc)}
            onDeleteDocument={(doc) => setDeleteDoc(doc)}
            onOpenAssignModal={() => setIsAssignModalOpen(true)}
          />
        )}
        {activeTab === 'Library' && (
          <DocumentLibrary
            categories={categories}
            setCategories={async (updater) => {
              const next = typeof updater === 'function' ? updater(categories) : updater;
              setCategories(next);
            }}
            documents={documents}
            setDocuments={async (updater) => {
              const next = typeof updater === 'function' ? updater(documents) : updater;
              setDocuments(next);
            }}
            globalSearchTerm={searchTerm}
            addActivity={addActivity}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'Employees' && (
          <EmployeeList
            employees={employees}
            documents={documents}
            categories={categories}
            currentUser={currentUser}
            onAssignDocument={handleAssignDocument}
            onEditDocument={handleEditDocument}
            onDeleteDocument={handleDeleteDocument}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onViewDocument={(doc) => setSelectedInsight({ type: 'document', data: doc })}
            initialSelectedName={navigateToEmployee}
            onInitialSelectionConsumed={() => setNavigateToEmployee(null)}
          />
        )}
        {activeTab === 'Offices' && (
          <OfficeManagement
            offices={offices}
            documents={documents}
            categories={categories}
            currentUser={currentUser}
            onAssignDocument={handleAssignDocument}
            onEditDocument={handleEditDocument}
            onDeleteDocument={handleDeleteDocument}
            onAddOffice={handleAddOffice}
            onEditOffice={handleEditOffice}
            onDeleteOffice={handleDeleteOffice}
            onViewDocument={(doc) => setSelectedInsight({ type: 'document', data: doc })}
            initialSelectedName={navigateToOffice}
            onInitialSelectionConsumed={() => setNavigateToOffice(null)}
          />
        )}

        <EditDocumentModal
          isOpen={!!editDoc}
          onClose={() => setEditDoc(null)}
          document={editDoc}
          onSave={(data) => { if (editDoc) handleEditDocument(editDoc.id, data); }}
        />

        <DeleteConfirmationModal
          isOpen={!!deleteDoc}
          onClose={() => setDeleteDoc(null)}
          onConfirm={() => { if (deleteDoc) { handleDeleteDocument(deleteDoc.id); setDeleteDoc(null); } }}
          itemName={deleteDoc?.title || ''}
        />

        <GlobalAssignDocumentModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSave={handleAssignDocument}
          categories={categories}
          employees={employees}
          offices={offices}
        />

        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          onSave={async (newPassword) => {
            await updatePassword(newPassword);
            showToast('Password updated successfully', 'success');
          }}
        />

        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          documents={documents}
          employees={employees}
          offices={offices}
          onAction={(action) => {
            switch (action) {
              case 'new-doc': setIsAssignModalOpen(true); break;
              case 'new-employee': setActiveTab('Employees'); break;
              case 'new-office': setActiveTab('Offices'); break;
              case 'export': showToast('Export started', 'info'); break;
              case 'go-dashboard': setActiveTab('Dashboard'); break;
              case 'go-library': setActiveTab('Library'); break;
              case 'go-personnel': setActiveTab('Employees'); break;
              case 'go-offices': setActiveTab('Offices'); break;
              case 'offices': setActiveTab('Offices'); break;
              case 'settings': showToast('Settings coming soon', 'info'); break;
              case 'help': showToast('Ctrl+K to search, Esc to close', 'info'); break;
            }
          }}
          onSelectDocument={(doc) => setSelectedInsight({ type: 'document', data: doc })}
          onSelectEmployee={(emp) => { setNavigateToEmployee(emp.name); setActiveTab('Employees'); }}
          onSelectOffice={(off) => { setNavigateToOffice(off.name); setActiveTab('Offices'); }}
        />

        <SidePanel
          isOpen={!!selectedInsight}
          onClose={() => setSelectedInsight(null)}
          title={selectedInsight?.type === 'document' ? selectedInsight.data.title : selectedInsight?.data.name}
          subtitle={selectedInsight?.type === 'document' ? 'Document Detail' : 'Personnel Insight'}
          footer={
            selectedInsight?.type === 'document' ? (
              <div className="flex space-x-3">
                {selectedInsight.data.hasAttachment && selectedInsight.data.attachmentUrl ? (
                  <a
                    href={selectedInsight.data.attachmentUrl}
                    download={selectedInsight.data.attachmentName || 'attachment'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    <Download size={16} className="mr-2" />Download
                  </a>
                ) : (
                  <button disabled className="flex-1 py-3 bg-slate-200 text-slate-400 rounded-xl font-bold flex items-center justify-center cursor-not-allowed">
                    <Paperclip size={16} className="mr-2" />No Attachment
                  </button>
                )}
                <button
                  onClick={() => { setEditDoc(selectedInsight.data); setSelectedInsight(null); }}
                  className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            ) : null
          }
        >
          {selectedInsight?.type === 'document' && (
            <div className="space-y-6">
              <SectionHeader title="Core Information" />
              <div className="space-y-4">
                <DetailItem icon={FileText} label="ID Number" value={selectedInsight.data.id} />
                <DetailItem icon={Shield} label="Category" value={selectedInsight.data.type} />
                <DetailItem icon={User} label="Current Holder" value={selectedInsight.data.holder} />
              </div>
              <SectionHeader title="Compliance Status" />
              <div className="space-y-4">
                <DetailItem
                  icon={Calendar}
                  label="Expiry Date"
                  value={selectedInsight.data.expiryDate}
                  colorClass={getExpiryDetails(selectedInsight.data.expiryDate).status === 'Expired' ? 'text-red-500' : 'text-emerald-500'}
                />
                <DetailItem icon={Clock} label="Days Remaining" value={getExpiryDetails(selectedInsight.data.expiryDate).daysRemaining?.toString() || 'N/A'} />
              </div>
              <SectionHeader title="Attachment" />
              <div className="space-y-4">
                <DetailItem icon={Paperclip} label="Attachment" value={selectedInsight.data.hasAttachment ? (selectedInsight.data.attachmentName || 'Attached') : 'No attachment'} />
              </div>
            </div>
          )}
          {selectedInsight?.type === 'employee' && (
            <div className="space-y-6">
              <SectionHeader title="Employee Overview" />
              <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mr-4 shadow-lg shadow-blue-500/30">
                  {selectedInsight.data.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 leading-tight">{selectedInsight.data.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{selectedInsight.data.title}</p>
                </div>
              </div>
              <div className="space-y-4">
                <DetailItem icon={Mail} label="Email Address" value={selectedInsight.data.email} />
                <DetailItem icon={Building2} label="Department" value={selectedInsight.data.title?.includes('Surveyor') ? 'Operations' : 'Technical'} />
              </div>
              <SectionHeader title="Document Portfolio" />
              <div className="space-y-2">
                {documents.filter(d => d.holder === selectedInsight.data.name).map(doc => {
                  const expiryInfo = getExpiryDetails(doc.expiryDate);
                  return (
                    <div key={doc.id} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-1.5 rounded-lg bg-slate-50 mr-3">
                          <FileText size={14} className="text-slate-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{doc.title}</span>
                      </div>
                      <div className={`text-[10px] font-black uppercase tracking-tighter ${expiryInfo.colorClass}`}>
                        {expiryInfo.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SidePanel>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${active
        ? 'bg-abs-highlight text-white font-bold shadow-lg border border-white/10'
        : 'text-abs-steel/80 hover:text-white hover:bg-white/5'
        }`}
    >
      <span className={`mr-3 ${active ? 'text-white' : 'text-abs-red'}`}>{icon}</span>
      <span className="text-sm tracking-wide font-medium">{label}</span>
    </button>
  );
}
