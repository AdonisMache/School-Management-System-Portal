import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, GraduationCap, Search, Edit2, Trash2, X, Check } from 'lucide-react';

export const TeacherDirectory: React.FC = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('school_admin');

  const [teachers, setTeachers] = useState<any[]>([
    { id: '1', employee_number: 'EMP2026/001', first_name: 'Andrew', last_name: 'Kavuma', qualifications: 'BSc. Education (Chemistry/Biology)', subject: 'Chemistry', classes: 'Form 4, Form 3' },
    { id: '2', employee_number: 'EMP2026/002', first_name: 'Evelyn', last_name: 'Nalunga', qualifications: 'MEd. Mathematics', subject: 'Mathematics', classes: 'Form 6, Form 5' },
    { id: '3', employee_number: 'EMP2026/003', first_name: 'Moses', last_name: 'Ochola', qualifications: 'BA. English Literature', subject: 'English', classes: 'Form 1, Form 2' },
    { id: '4', employee_number: 'EMP2026/004', first_name: 'Sarah', last_name: 'Namubiru', qualifications: 'BSc. Physics & Math', subject: 'Physics', classes: 'Form 5, Form 4' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields for Registering
  const [empNo, setEmpNo] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [quals, setQuals] = useState('');
  const [subj, setSubj] = useState('Mathematics');
  const [assignedClasses, setAssignedClasses] = useState('Form 1');

  // Editing States
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [editEmpNo, setEditEmpNo] = useState('');
  const [editFname, setEditFname] = useState('');
  const [editLname, setEditLname] = useState('');
  const [editQuals, setEditQuals] = useState('');
  const [editSubj, setEditSubj] = useState('Mathematics');
  const [editAssignedClasses, setEditAssignedClasses] = useState('');

  useEffect(() => {
    const loadTeachers = async () => {
      const { data } = await supabase
        .from('staff_profiles')
        .select(`
          id,
          employee_number,
          qualifications,
          profiles:id(first_name, last_name, email)
        `);
      if (data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          employee_number: item.employee_number,
          qualifications: item.qualifications || 'BA. Education',
          first_name: item.profiles?.first_name,
          last_name: item.profiles?.last_name,
          subject: 'General Studies',
          classes: 'Form 1'
        }));
        setTeachers(mapped);
      }
    };
    loadTeachers();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empNo || !fname || !lname) return;

    const generatedId = crypto.randomUUID();
    const newTeacher = {
      id: generatedId,
      employee_number: empNo,
      first_name: fname,
      last_name: lname,
      qualifications: quals,
      subject: subj,
      classes: assignedClasses
    };

    setTeachers([newTeacher, ...teachers]);
    setShowAddForm(false);

    // Clear form
    setEmpNo('');
    setFname('');
    setLname('');
    setQuals('');

    // Attempt to register in Supabase
    try {
      await supabase.from('profiles').insert([{
        id: generatedId,
        first_name: fname,
        last_name: lname,
        status: 'active'
      }]);
      await supabase.from('staff_profiles').insert([{
        id: generatedId,
        employee_number: empNo,
        qualifications: quals
      }]);
    } catch (err) {
      console.error('Supabase teacher registration error:', err);
    }
  };

  const handleStartEdit = (teach: any) => {
    setEditingTeacher(teach);
    setEditEmpNo(teach.employee_number);
    setEditFname(teach.first_name);
    setEditLname(teach.last_name);
    setEditQuals(teach.qualifications || '');
    setEditSubj(teach.subject || 'Mathematics');
    setEditAssignedClasses(teach.classes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    setTeachers(teachers.map(t => {
      if (t.id === editingTeacher.id) {
        return {
          ...t,
          employee_number: editEmpNo,
          first_name: editFname,
          last_name: editLname,
          qualifications: editQuals,
          subject: editSubj,
          classes: editAssignedClasses
        };
      }
      return t;
    }));

    const id = editingTeacher.id;
    setEditingTeacher(null);

    // Save changes to Supabase
    try {
      await supabase.from('profiles').update({
        first_name: editFname,
        last_name: editLname
      }).eq('id', id);

      await supabase.from('staff_profiles').update({
        employee_number: editEmpNo,
        qualifications: editQuals
      }).eq('id', id);
    } catch (err) {
      console.error('Supabase update teacher error:', err);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this teacher profile record? This will remove qualifications and roster logs.')) return;

    setTeachers(teachers.filter(t => t.id !== id));

    try {
      await supabase.from('staff_profiles').delete().eq('id', id);
      await supabase.from('profiles').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase delete teacher error:', err);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    `${t.first_name} ${t.last_name} ${t.employee_number} ${t.subject}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-6 flex justify-between items-center border border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            Teacher Directory
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage academic instructors, view qualifications, and map class subjects assignations.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Teacher Profile</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleRegister} className="glass-panel p-6 rounded-2xl space-y-4 border-indigo-500/20">
          <h3 className="text-sm font-bold text-white">Teacher Registration Form</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              required
              value={empNo}
              onChange={(e) => setEmpNo(e.target.value)}
              placeholder="Employee Number (e.g. EMP2026/005)"
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <input
              type="text"
              required
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              placeholder="First Name"
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <input
              type="text"
              required
              value={lname}
              onChange={(e) => setLname(e.target.value)}
              placeholder="Last Name"
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <input
              type="text"
              value={quals}
              onChange={(e) => setQuals(e.target.value)}
              placeholder="Qualifications (e.g. BSc. Education)"
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={subj}
              onChange={(e) => setSubj(e.target.value)}
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="Biology">Biology</option>
              <option value="English Literature">English Literature</option>
              <option value="History">History</option>
            </select>
            <input
              type="text"
              value={assignedClasses}
              onChange={(e) => setAssignedClasses(e.target.value)}
              placeholder="Assigned Classes (e.g. Form 4, Form 3)"
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-white/10 text-xs font-semibold rounded-xl text-white hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer"
            >
              Register Teacher
            </button>
          </div>
        </form>
      )}

      {/* Edit Teacher Modal Overlay */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleSaveEdit} 
            className="glass-panel p-6 rounded-2xl space-y-4 border border-indigo-500/30 max-w-xl w-full bg-[#0c0d15] animate-scale-in"
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                Edit Teacher Profile
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingTeacher(null)} 
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Employee Number</label>
                <input
                  type="text"
                  required
                  value={editEmpNo}
                  onChange={(e) => setEditEmpNo(e.target.value)}
                  className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Qualifications</label>
                <input
                  type="text"
                  required
                  value={editQuals}
                  onChange={(e) => setEditQuals(e.target.value)}
                  className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">First Name</label>
                <input
                  type="text"
                  required
                  value={editFname}
                  onChange={(e) => setEditFname(e.target.value)}
                  className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Last Name</label>
                <input
                  type="text"
                  required
                  value={editLname}
                  onChange={(e) => setEditLname(e.target.value)}
                  className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Primary Subject</label>
                <select
                  value={editSubj}
                  onChange={(e) => setEditSubj(e.target.value)}
                  className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                  <option value="Biology">Biology</option>
                  <option value="English Literature">English Literature</option>
                  <option value="History">History</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Assigned Classes</label>
                <input
                  type="text"
                  required
                  value={editAssignedClasses}
                  onChange={(e) => setEditAssignedClasses(e.target.value)}
                  placeholder="e.g. Form 4, Form 3"
                  className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="px-4 py-2 border border-white/10 text-xs font-semibold rounded-xl text-white hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roster list view */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-[rgba(255,255,255,0.08)]">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by teacher name or employee number..."
            className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="py-3 px-4 font-semibold uppercase">Employee Number</th>
                <th className="py-3 px-4 font-semibold uppercase">Full Name</th>
                <th className="py-3 px-4 font-semibold uppercase">Qualifications</th>
                <th className="py-3 px-4 font-semibold uppercase">Primary Subject</th>
                <th className="py-3 px-4 font-semibold uppercase">Classes Assigned</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teach) => (
                <tr key={teach.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">{teach.employee_number}</td>
                  <td className="py-4 px-4 font-medium text-white">{teach.first_name} {teach.last_name}</td>
                  <td className="py-4 px-4 text-gray-400 max-w-xs truncate">{teach.qualifications}</td>
                  <td className="py-4 px-4">
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                      {teach.subject}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-400">{teach.classes}</td>
                  <td className="py-4 px-4 text-right">
                    {isAdmin ? (
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(teach)}
                          className="text-[10px] font-bold px-2.5 py-1 rounded border border-white/10 text-gray-300 hover:bg-white/5 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-indigo-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teach.id)}
                          className="text-[10px] font-bold px-2.5 py-1 rounded border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                          <span>Delete</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-[10px] italic">Access Protected</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 font-medium">
                    No teacher profiles match search terms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
