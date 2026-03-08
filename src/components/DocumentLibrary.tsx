import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import { DocumentCategory, Document, Employee } from '../mockData';
import { AddCategoryModal, AddSubDocumentModal, EditModal, DeleteConfirmationModal } from './Modals';
import { useToast } from './Toast';

import { getDocumentIcon } from '../utils/icons';

interface DocumentLibraryProps {
  categories: DocumentCategory[];
  setCategories: React.Dispatch<React.SetStateAction<DocumentCategory[]>>;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  globalSearchTerm: string;
  addActivity: (user: string, action: string, target: string, type: 'update' | 'delete' | 'create') => void;
  currentUser: Employee;
}

export function DocumentLibrary({
  categories,
  setCategories,
  documents,
  setDocuments,
  globalSearchTerm,
  addActivity,
  currentUser
}: DocumentLibraryProps) {
  const { showToast } = useToast();
  const canManage = currentUser.role === 'Admin';
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    categories.reduce((acc, cat) => ({ ...acc, [cat.id]: false }), {})
  );
  const [localSearch, setLocalSearch] = useState('');

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubDocModalOpen, setIsSubDocModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeDocName, setActiveDocName] = useState<string | null>(null);
  const [editType, setEditType] = useState<'category' | 'document'>('category');
  const [deleteType, setDeleteType] = useState<'category' | 'document'>('category');

  const effectiveSearch = localSearch || globalSearchTerm;

  const toggleCategory = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCategories = useMemo(() => {
    const base = effectiveSearch
      ? categories.map(cat => {
        const lowerSearch = effectiveSearch.toLowerCase();
        const matchesCategory = cat.name.toLowerCase().includes(lowerSearch);
        const filteredDocs = cat.documents.filter((doc: string) => doc.toLowerCase().includes(lowerSearch));
        if (matchesCategory || filteredDocs.length > 0) {
          return { ...cat, documents: matchesCategory ? cat.documents : filteredDocs };
        }
        return null;
      }).filter(Boolean) as typeof categories
      : categories;

    return [...base]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(cat => ({
        ...cat,
        documents: [...cat.documents].sort((a: string, b: string) => a.localeCompare(b))
      }));
  }, [categories, effectiveSearch]);

  const handleAddCategory = (name: string) => {
    const newCat: DocumentCategory = {
      id: `cat_${Date.now()}`,
      name,
      documents: []
    };
    setCategories([...categories, newCat]);
    setExpanded(prev => ({ ...prev, [newCat.id]: true }));
    showToast(`Category "${name}" created successfully`, 'success');
    addActivity('Mohamed Naguib', 'Created new category', name, 'create');
  };

  const handleAddDocument = (name: string) => {
    if (activeCategoryId) {
      setCategories(categories.map(cat =>
        cat.id === activeCategoryId
          ? { ...cat, documents: [...cat.documents, name] }
          : cat
      ));
      showToast(`Template "${name}" saved`, 'success');
      addActivity('Mohamed Naguib', 'Added sub-document template', name, 'create');
    }
  };

  const handleEditSave = (newName: string) => {
    if (editType === 'category' && activeCategoryId) {
      const oldName = categories.find(c => c.id === activeCategoryId)?.name;
      setCategories(categories.map(cat =>
        cat.id === activeCategoryId ? { ...cat, name: newName } : cat
      ));
      showToast(`Category renamed to "${newName}"`, 'success');
      addActivity('Mohamed Naguib', 'Renamed category', `${oldName} → ${newName}`, 'update');
    } else if (editType === 'document' && activeCategoryId && activeDocName) {
      setCategories(categories.map(cat =>
        cat.id === activeCategoryId
          ? { ...cat, documents: cat.documents.map(d => d === activeDocName ? newName : d) }
          : cat
      ));
      // Update all document records that used this template name
      setDocuments(documents.map(doc =>
        doc.title === activeDocName ? { ...doc, title: newName } : doc
      ));
      showToast(`Template renamed to "${newName}"`, 'success');
      addActivity('Mohamed Naguib', 'Renamed document template', `${activeDocName} → ${newName}`, 'update');
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteType === 'category' && activeCategoryId) {
      const categoryToDelete = categories.find(c => c.id === activeCategoryId);
      if (categoryToDelete) {
        // Cascading delete: remove all document records that belong to any template in this category
        setDocuments(documents.filter(doc => !categoryToDelete.documents.includes(doc.title)));
        setCategories(categories.filter(cat => cat.id !== activeCategoryId));
        showToast(`Category "${categoryToDelete.name}" deleted`, 'error');
        addActivity('Mohamed Naguib', 'Deleted category', categoryToDelete.name, 'delete');
      }
    } else if (deleteType === 'document' && activeCategoryId && activeDocName) {
      // Remove the template from the category
      setCategories(categories.map(cat =>
        cat.id === activeCategoryId
          ? { ...cat, documents: cat.documents.filter(d => d !== activeDocName) }
          : cat
      ));
      // Remove all document records of this type
      setDocuments(documents.filter(doc => doc.title !== activeDocName));
      showToast(`Template "${activeDocName}" deleted`, 'error');
      addActivity('Mohamed Naguib', 'Deleted document template', activeDocName, 'delete');
    }
    setIsDeleteModalOpen(false);
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const activeCategoryName = activeCategory?.name || '';
  const editInitialValue = editType === 'category' ? activeCategoryName : (activeDocName || '');
  const deleteItemName = deleteType === 'category' ? activeCategoryName : (activeDocName || '');

  return (
    <div className="flex-1 overflow-auto p-8">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories or templates..."
            className="w-full bg-white border border-slate-200 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-abs-navy focus:ring-4 focus:ring-abs-navy/10 transition-all placeholder:text-slate-400 text-slate-600 font-medium shadow-sm"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {canManage && (
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-abs-red text-white rounded-lg text-sm font-bold hover:bg-abs-red/90 transition-all shadow-md shadow-abs-red/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories Accordion */}
      <div className="space-y-4">
        {filteredCategories.length > 0 ? (
          filteredCategories.map(category => (
            <div key={category.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Category Header */}
              <div
                className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`transition-transform duration-200 ${expanded[category.id] ? 'rotate-0' : '-rotate-90'}`}>
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-abs-navy group-hover:border-abs-navy transition-all">
                    <Folder className="w-5 h-5 text-abs-navy group-hover:text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700">{category.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 border border-slate-200 uppercase tracking-tight">
                    {category.documents.length} {category.documents.length === 1 ? 'Template' : 'Templates'}
                  </span>
                </div>

                {canManage && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCategoryId(category.id);
                        setEditType('category');
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCategoryId(category.id);
                        setDeleteType('category');
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCategoryId(category.id);
                        setIsSubDocModalOpen(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-200 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-abs-red" />
                      <span>New Template</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Category Content */}
              {expanded[category.id] && (
                <div className="border-t border-slate-100">
                  {category.documents.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                      {category.documents.map((doc, idx) => (
                        <li key={idx} className="flex items-center justify-between p-4 hover:bg-blue-50/30 transition-colors group">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg group-hover:bg-white group-hover:border-blue-100 transition-all">
                              {React.createElement(getDocumentIcon(doc), { className: "w-4 h-4 text-slate-400 group-hover:text-abs-navy" })}
                            </div>
                            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{doc}</span>
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canManage && (
                              <>
                                <button
                                  onClick={() => {
                                    setActiveCategoryId(category.id);
                                    setActiveDocName(doc);
                                    setEditType('document');
                                    setIsEditModalOpen(true);
                                  }}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveCategoryId(category.id);
                                    setActiveDocName(doc);
                                    setDeleteType('document');
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      No documents in this category. Click "Add Sub-document" to create one.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Folder className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No categories found</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">Try adjusting your search criteria or create a new category to get started.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleAddCategory}
      />

      <AddSubDocumentModal
        isOpen={isSubDocModalOpen}
        onClose={() => setIsSubDocModalOpen(false)}
        onSave={handleAddDocument}
        categoryName={activeCategoryName}
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        initialValue={editInitialValue}
        title={editType === 'category' ? 'Edit Category' : 'Edit Document Template'}
        label={editType === 'category' ? 'Category Name' : 'Template Name'}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={deleteItemName}
      />
    </div>
  );
}
