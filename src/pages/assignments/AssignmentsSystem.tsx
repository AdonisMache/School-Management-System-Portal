import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ClipboardList, Plus, FileDown, Upload, CheckCircle, Clock } from 'lucide-react';

export const AssignmentsSystem: React.FC = () => {
  const { hasRole } = useAuth();
  const isStaff = hasRole('teacher') || hasRole('school_admin');

  const [assignments, setAssignments] = useState<any[]>([
    { id: '1', title: 'Calculus Exercises Sheet', description: 'Solve questions 1 through 15 on page 42. Show all working steps clearly.', subject: 'Mathematics', class: 'Form 4', deadline: '2026-06-28 17:00', file: 'calculus_asg1.pdf', status: 'Pending' },
    { id: '2', title: 'Newton Mechanics Lab Report', description: 'Draft scientific report matching variables from lab session 4 guidelines.', subject: 'Physics', class: 'Form 5', deadline: '2026-06-30 12:00', file: 'mechanics_guide.pdf', status: 'Submitted' }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [classLvl, setClassLvl] = useState('Form 1');
  const [deadline, setDeadline] = useState('');

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) return;

    const newAsg = {
      id: crypto.randomUUID(),
      title,
      description: desc,
      subject,
      class: classLvl,
      deadline,
      file: 'attached_resource.pdf',
      status: 'Pending'
    };

    setAssignments([newAsg, ...assignments]);
    setShowAddForm(false);
    setSuccess(true);

    // Clear forms
    setTitle('');
    setDesc('');
    setDeadline('');

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            Homework & Assignments Portal
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Publish academic assignments, download worksheets, hand in homework submissions, mark student results.
          </p>
        </div>
        {isStaff && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p>Assignment successfully published and cataloged!</p>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleCreateAssignment} className="glass-panel p-6 rounded-2xl space-y-4 border-indigo-500/20">
          <h3 className="text-sm font-bold text-white">Create New Assignment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment Title (e.g. Organic Chemistry)"
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English Literature">English Literature</option>
              <option value="History">History</option>
            </select>
            <select
              value={classLvl}
              onChange={(e) => setClassLvl(e.target.value)}
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
            >
              <option value="Form 1">Form 1</option>
              <option value="Form 2">Form 2</option>
              <option value="Form 3">Form 3</option>
              <option value="Form 4">Form 4</option>
              <option value="Form 5">Form 5</option>
              <option value="Form 6">Form 6</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Assignment Instructions"
              rows={3}
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold">Submission Deadline</label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
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
              Publish Assignment
            </button>
          </div>
        </form>
      )}

      {/* Assignment list display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((asg) => (
          <div key={asg.id} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20 uppercase">
                  {asg.subject} • {asg.class}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  asg.status === 'Submitted'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {asg.status}
                </span>
              </div>
              <h3 className="text-md font-bold text-white leading-tight">{asg.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{asg.description}</p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-4">
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500/80" />
                Due: {asg.deadline}
              </span>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-lg border border-[rgba(255,255,255,0.08)] transition-all cursor-pointer text-gray-400 hover:text-white flex items-center gap-1.5 text-[10px] font-bold">
                  <FileDown className="w-4 h-4" />
                  <span>Download</span>
                </button>
                {!isStaff && asg.status !== 'Submitted' && (
                  <button className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
