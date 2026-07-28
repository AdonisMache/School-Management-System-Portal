import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Network, BookOpen, Layers, Edit2, Trash2, Check, X } from 'lucide-react';

export const AcademicSetup: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([
    { id: '1', name: 'Form 1' },
    { id: '2', name: 'Form 2' },
    { id: '3', name: 'Form 3' },
    { id: '4', name: 'Form 4' },
    { id: '5', name: 'Form 5' },
    { id: '6', name: 'Form 6' }
  ]);
  const [streams, setStreams] = useState<any[]>([
    { id: '1', name: 'Stream A' },
    { id: '2', name: 'Stream B' },
    { id: '3', name: 'Stream C' }
  ]);
  const [subjects, setSubjects] = useState<any[]>([
    { id: '1', code: 'MAT101', name: 'Mathematics' },
    { id: '2', code: 'PHY101', name: 'Physics' },
    { id: '3', code: 'CHE101', name: 'Chemistry' },
    { id: '4', code: 'BIO101', name: 'Biology' },
    { id: '5', code: 'ENG101', name: 'English Literature' },
    { id: '6', code: 'HIS101', name: 'History' }
  ]);

  const [newClass, setNewClass] = useState('');
  const [newStream, setNewStream] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');

  // Editing States
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState('');

  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
  const [editStreamName, setEditStreamName] = useState('');

  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubCode, setEditSubCode] = useState('');

  // Fetch real data on mount
  useEffect(() => {
    const loadAcademics = async () => {
      const { data: classData } = await supabase.from('classes').select('*');
      if (classData && classData.length > 0) setClasses(classData);

      const { data: streamData } = await supabase.from('streams').select('*');
      if (streamData && streamData.length > 0) setStreams(streamData);

      const { data: subjectData } = await supabase.from('subjects').select('*');
      if (subjectData && subjectData.length > 0) setSubjects(subjectData);
    };
    loadAcademics();
  }, []);

  // Class Handlers
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.trim()) return;
    const generatedId = crypto.randomUUID();
    const newItem = { id: generatedId, name: newClass };
    setClasses([...classes, newItem]);
    setNewClass('');
    await supabase.from('classes').insert([{ id: generatedId, name: newClass }]);
  };

  const handleSaveClass = async (id: string) => {
    if (!editClassName.trim()) return;
    setClasses(classes.map(c => c.id === id ? { ...c, name: editClassName } : c));
    setEditingClassId(null);
    await supabase.from('classes').update({ name: editClassName }).eq('id', id);
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class cohort? This may affect student enrollments.')) return;
    setClasses(classes.filter(c => c.id !== id));
    await supabase.from('classes').delete().eq('id', id);
  };

  // Stream Handlers
  const handleAddStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStream.trim()) return;
    const generatedId = crypto.randomUUID();
    const newItem = { id: generatedId, name: newStream };
    setStreams([...streams, newItem]);
    setNewStream('');
    await supabase.from('streams').insert([{ id: generatedId, name: newStream }]);
  };

  const handleSaveStream = async (id: string) => {
    if (!editStreamName.trim()) return;
    setStreams(streams.map(s => s.id === id ? { ...s, name: editStreamName } : s));
    setEditingStreamId(null);
    await supabase.from('streams').update({ name: editStreamName }).eq('id', id);
  };

  const handleDeleteStream = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stream?')) return;
    setStreams(streams.filter(s => s.id !== id));
    await supabase.from('streams').delete().eq('id', id);
  };

  // Subject Handlers
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) return;
    const generatedId = crypto.randomUUID();
    const newItem = { id: generatedId, code: newSubCode, name: newSubName };
    setSubjects([...subjects, newItem]);
    setNewSubName('');
    setNewSubCode('');
    await supabase.from('subjects').insert([{ id: generatedId, code: newSubCode, name: newSubName }]);
  };

  const handleSaveSubject = async (id: string) => {
    if (!editSubName.trim() || !editSubCode.trim()) return;
    setSubjects(subjects.map(s => s.id === id ? { ...s, name: editSubName, code: editSubCode } : s));
    setEditingSubjectId(null);
    await supabase.from('subjects').update({ name: editSubName, code: editSubCode }).eq('id', id);
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject from the course catalog?')) return;
    setSubjects(subjects.filter(s => s.id !== id));
    await supabase.from('subjects').delete().eq('id', id);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-400" />
          Academic Structure Configuration
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Configure class levels, streams partitions, and course catalogs for the student management system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Classes Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Class Levels
          </h3>
          <form onSubmit={handleAddClass} className="flex gap-2">
            <input
              type="text"
              required
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              placeholder="e.g. Form 7"
              className="flex-1 bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-2 cursor-pointer flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </form>
          
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {classes.map((cls) => (
              <div key={cls.id} className="p-3 bg-white/2 rounded-xl border border-white/5 text-xs font-semibold text-white flex justify-between items-center group">
                {editingClassId === cls.id ? (
                  <div className="flex gap-2 w-full">
                    <input
                      type="text"
                      value={editClassName}
                      onChange={(e) => setEditClassName(e.target.value)}
                      className="flex-1 bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                    />
                    <button onClick={() => handleSaveClass(cls.id)} className="text-emerald-400 hover:text-emerald-300 p-1 cursor-pointer">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingClassId(null)} className="text-red-400 hover:text-red-300 p-1 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{cls.name}</span>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingClassId(cls.id);
                          setEditClassName(cls.name);
                        }}
                        className="text-gray-400 hover:text-white p-1 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="text-red-400 hover:text-red-300 p-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Streams Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Streams
          </h3>
          <form onSubmit={handleAddStream} className="flex gap-2">
            <input
              type="text"
              required
              value={newStream}
              onChange={(e) => setNewStream(e.target.value)}
              placeholder="e.g. Stream D"
              className="flex-1 bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-2 cursor-pointer flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {streams.map((str) => (
              <div key={str.id} className="p-3 bg-white/2 rounded-xl border border-white/5 text-xs font-semibold text-white flex justify-between items-center group">
                {editingStreamId === str.id ? (
                  <div className="flex gap-2 w-full">
                    <input
                      type="text"
                      value={editStreamName}
                      onChange={(e) => setEditStreamName(e.target.value)}
                      className="flex-1 bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                    />
                    <button onClick={() => handleSaveStream(str.id)} className="text-emerald-400 hover:text-emerald-300 p-1 cursor-pointer">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingStreamId(null)} className="text-red-400 hover:text-red-300 p-1 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{str.name}</span>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingStreamId(str.id);
                          setEditStreamName(str.name);
                        }}
                        className="text-gray-400 hover:text-white p-1 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStream(str.id)}
                        className="text-red-400 hover:text-red-300 p-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Course Catalog
          </h3>
          <form onSubmit={handleAddSubject} className="space-y-2">
            <input
              type="text"
              required
              value={newSubCode}
              onChange={(e) => setNewSubCode(e.target.value)}
              placeholder="Subject Code (e.g. HIS201)"
              className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="Subject Name (e.g. History)"
                className="flex-1 bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-2 cursor-pointer flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-3 bg-white/2 rounded-xl border border-white/5 text-xs text-white flex justify-between items-center group">
                {editingSubjectId === sub.id ? (
                  <div className="flex gap-2 w-full">
                    <input
                      type="text"
                      value={editSubCode}
                      onChange={(e) => setEditSubCode(e.target.value)}
                      placeholder="Code"
                      className="w-16 bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-lg px-2 py-1 text-[10px] font-mono text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editSubName}
                      onChange={(e) => setEditSubName(e.target.value)}
                      placeholder="Name"
                      className="flex-1 bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                    />
                    <button onClick={() => handleSaveSubject(sub.id)} className="text-emerald-400 hover:text-emerald-300 p-1 cursor-pointer">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingSubjectId(null)} className="text-red-400 hover:text-red-300 p-1 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between flex-1 pr-3">
                      <span className="font-bold">{sub.name}</span>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold uppercase">{sub.code}</span>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => {
                          setEditingSubjectId(sub.id);
                          setEditSubName(sub.name);
                          setEditSubCode(sub.code);
                        }}
                        className="text-gray-400 hover:text-white p-1 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(sub.id)}
                        className="text-red-400 hover:text-red-300 p-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
