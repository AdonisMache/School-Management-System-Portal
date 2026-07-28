import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Plus, Search, FileDown, CheckCircle } from 'lucide-react';

export const LibrarySystem: React.FC = () => {
  const { hasRole } = useAuth();
  const canUpload = hasRole('teacher') || hasRole('school_admin');

  const [resources, setResources] = useState<any[]>([
    { id: '1', title: 'Calculus Made Easy', type: 'books', category: 'Mathematics', file: 'calculus_easy.pdf', approved: true },
    { id: '2', title: 'Advanced Chemistry Lab Syllabus', type: 'syllabi', category: 'Sciences', file: 'chem_lab_syllabus.pdf', approved: true },
    { id: '3', title: 'Organic Reaction Mechanisms Guide', type: 'notes', category: 'Sciences', file: 'organic_reactions.pdf', approved: true },
    { id: '4', title: 'Form 4 Physics Past Exam Paper (2025)', type: 'past exams', category: 'Sciences', file: 'physics_2025_past.pdf', approved: true },
    { id: '5', title: 'English Grammar Exercises', type: 'study guides', category: 'Languages', file: 'grammar_ex.pdf', approved: false }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState('books');
  const [cat, setCat] = useState('Mathematics');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newRes = {
      id: crypto.randomUUID(),
      title,
      type,
      category: cat,
      file: 'uploaded_doc.pdf',
      approved: false
    };

    setResources([newRes, ...resources]);
    setShowAddForm(false);
    setSuccess(true);
    setTitle('');

    setTimeout(() => setSuccess(false), 3000);
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || res.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Online E-Library Catalogs
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Search catalog references, download revision notes, find past examination papers.
          </p>
        </div>
        {canUpload && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p>Resource uploaded successfully! Pending administrator approval.</p>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleUpload} className="glass-panel p-6 rounded-2xl space-y-4 border-indigo-500/20">
          <h3 className="text-sm font-bold text-white">Upload Educational Resource</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resource Name (e.g. Algebra Basics)"
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
            >
              <option value="books">Reference Book</option>
              <option value="notes">Revision Notes</option>
              <option value="study guides">Study Guide</option>
              <option value="syllabi">Subject Syllabus</option>
              <option value="past exams">Past Exam Paper</option>
            </select>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Sciences">Sciences</option>
              <option value="Languages">Languages</option>
              <option value="History & Geography">History & Geography</option>
              <option value="Past Examinations">Past Examinations</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-white/10 rounded-xl text-xs font-semibold text-white hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
            >
              Upload File
            </button>
          </div>
        </form>
      )}

      {/* Catalog Search & Filtering */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by book/notes title..."
              className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            {['all', 'books', 'notes', 'study guides', 'syllabi', 'past exams'].map(tOption => (
              <button
                key={tOption}
                onClick={() => setSelectedType(tOption)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition cursor-pointer shrink-0 ${
                  selectedType === tOption
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-transparent border-white/5 text-gray-500 hover:text-gray-300'
                }`}
              >
                {tOption}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Cards Roster */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div key={res.id} className="p-5 bg-white/2 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between hover:border-indigo-500/20 transition-all">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded border border-indigo-500/20 uppercase">
                    {res.category}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                    res.approved 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {res.approved ? 'Approved' : 'Pending Verification'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">{res.title}</h4>
                <p className="text-[10px] text-gray-500 capitalize">{res.type.replace('_', ' ')}</p>
              </div>

              <button className="w-full flex items-center justify-center gap-1.5 p-2 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-400 rounded-xl text-[10px] font-bold border border-indigo-500/25 transition-all cursor-pointer mt-4">
                <FileDown className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          ))}
          {filteredResources.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 font-medium">
              No catalog resources found matching filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
