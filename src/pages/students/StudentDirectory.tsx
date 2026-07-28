import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Users, Search, Edit2, Trash2, X, Check } from 'lucide-react';

export const StudentDirectory: React.FC = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('school_admin');

  const [students, setStudents] = useState<any[]>([
    { id: '1', admission_number: 'VLC/2026/0001', first_name: 'Alice', last_name: 'Smith', class: 'Form 4', stream: 'Stream A', gender: 'female', status: 'active', parent: 'John Smith' },
    { id: '2', admission_number: 'VLC/2026/0002', first_name: 'Bob', last_name: 'Jones', class: 'Form 2', stream: 'Stream B', gender: 'male', status: 'active', parent: 'Sarah Jones' },
    { id: '3', admission_number: 'VLC/2026/0003', first_name: 'Charlie', last_name: 'Miller', class: 'Form 6', stream: 'Stream A', gender: 'male', status: 'active', parent: 'Robert Miller' },
    { id: '4', admission_number: 'VLC/2026/0004', first_name: 'Diana', last_name: 'Watson', class: 'Form 3', stream: 'Stream C', gender: 'female', status: 'suspended', parent: 'Emily Watson' },
    { id: '5', admission_number: 'VLC/2026/0005', first_name: 'Ethan', last_name: 'Carter', class: 'Form 5', stream: 'Stream B', gender: 'male', status: 'active', parent: 'David Carter' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields for Registering
  const [admNo, setAdmNo] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [classLvl, setClassLvl] = useState('Form 1');
  const [streamLvl, setStreamLvl] = useState('Stream A');
  const [gender, setGender] = useState('male');
  const [parentName, setParentName] = useState('');

  // Editing States
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [editAdmNo, setEditAdmNo] = useState('');
  const [editFname, setEditFname] = useState('');
  const [editLname, setEditLname] = useState('');
  const [editClassLvl, setEditClassLvl] = useState('Form 1');
  const [editStreamLvl, setEditStreamLvl] = useState('Stream A');
  const [editGender, setEditGender] = useState('male');
  const [editParentName, setEditParentName] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      const { data } = await supabase
        .from('student_profiles')
        .select(`
          id,
          admission_number,
          gender,
          profiles:id(first_name, last_name, email, status)
        `);
      if (data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          admission_number: item.admission_number,
          gender: item.gender,
          first_name: item.profiles?.first_name,
          last_name: item.profiles?.last_name,
          class: 'Form 1', // Default placeholder loaded dynamically
          stream: 'Stream A',
          status: item.profiles?.status || 'active',
          parent: 'Guardian'
        }));
        setStudents(mapped);
      }
    };
    loadStudents();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admNo || !fname || !lname) return;

    const generatedId = crypto.randomUUID();
    const newStudent = {
      id: generatedId,
      admission_number: admNo,
      first_name: fname,
      last_name: lname,
      class: classLvl,
      stream: streamLvl,
      gender,
      status: 'active',
      parent: parentName
    };

    setStudents([newStudent, ...students]);
    setShowAddForm(false);
    
    // Clear form
    setAdmNo('');
    setFname('');
    setLname('');
    setParentName('');

    // Attempt to register in Supabase
    try {
      await supabase.from('profiles').insert([{
        id: generatedId,
        first_name: fname,
        last_name: lname,
        status: 'active'
      }]);
      await supabase.from('student_profiles').insert([{
        id: generatedId,
        admission_number: admNo,
        gender: gender
      }]);
    } catch (err) {
      console.error('Supabase registration error:', err);
    }
  };

  const handleStartEdit = (std: any) => {
    setEditingStudent(std);
    setEditAdmNo(std.admission_number);
    setEditFname(std.first_name);
    setEditLname(std.last_name);
    setEditClassLvl(std.class || 'Form 1');
    setEditStreamLvl(std.stream || 'Stream A');
    setEditGender(std.gender || 'male');
    setEditParentName(std.parent || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setStudents(students.map(s => {
      if (s.id === editingStudent.id) {
        return {
          ...s,
          admission_number: editAdmNo,
          first_name: editFname,
          last_name: editLname,
          class: editClassLvl,
          stream: editStreamLvl,
          gender: editGender,
          parent: editParentName
        };
      }
      return s;
    }));

    const id = editingStudent.id;
    setEditingStudent(null);

    // Save changes to Supabase
    try {
      await supabase.from('profiles').update({
        first_name: editFname,
        last_name: editLname
      }).eq('id', id);

      await supabase.from('student_profiles').update({
        admission_number: editAdmNo,
        gender: editGender
      }).eq('id', id);
    } catch (err) {
      console.error('Supabase update student error:', err);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this student record? This action will remove all registration details.')) return;
    
    setStudents(students.filter(s => s.id !== id));

    try {
      await supabase.from('student_profiles').delete().eq('id', id);
      await supabase.from('profiles').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase delete student error:', err);
    }
  };

  const toggleStatus = async (id: string) => {
    let nextStatus = 'active';
    setStudents(students.map(s => {
      if (s.id === id) {
        nextStatus = s.status === 'active' ? 'suspended' : 'active';
        return { ...s, status: nextStatus };
      }
      return s;
    }));

    try {
      await supabase.from('profiles').update({ status: nextStatus }).eq('id', id);
    } catch (err) {
      console.error('Supabase toggle status error:', err);
    }
  };

  const filteredStudents = students.filter(s => 
    `${s.first_name} ${s.last_name} ${s.admission_number}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-6 rounded-2xl flex justify-between items-center border border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Student Directory (Registration & Catalog)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Display registers, verify accounts status, search student catalog data.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Student</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleRegister} className="glass-panel p-6 rounded-2xl space-y-4 border-indigo-500/20">
          <h3 className="text-sm font-bold text-white">Student Registration Form</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              required
              value={admNo}
              onChange={(e) => setAdmNo(e.target.value)}
              placeholder="Admission Number (e.g. VLC/2026/0006)"
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
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Guardian Full Name"
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <select
              value={streamLvl}
              onChange={(e) => setStreamLvl(e.target.value)}
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
            >
              <option value="Stream A">Stream A</option>
              <option value="Stream B">Stream B</option>
              <option value="Stream C">Stream C</option>
            </select>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
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
              Add Student Record
            </button>
          </div>
        </form>
      )}

      {/* Edit Student Modal Overlay */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleSaveEdit} 
            className="glass-panel p-6 rounded-2xl space-y-4 border border-indigo-500/30 max-w-xl w-full bg-[#0c0d15] animate-scale-in"
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                Edit Student Details
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingStudent(null)} 
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Admission Number</label>
                <input
                  type="text"
                  required
                  value={editAdmNo}
                  onChange={(e) => setEditAdmNo(e.target.value)}
                  className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Guardian Name</label>
                <input
                  type="text"
                  value={editParentName}
                  onChange={(e) => setEditParentName(e.target.value)}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Class Cohort</label>
                <select
                  value={editClassLvl}
                  onChange={(e) => setEditClassLvl(e.target.value)}
                  className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
                >
                  <option value="Form 1">Form 1</option>
                  <option value="Form 2">Form 2</option>
                  <option value="Form 3">Form 3</option>
                  <option value="Form 4">Form 4</option>
                  <option value="Form 5">Form 5</option>
                  <option value="Form 6">Form 6</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Stream</label>
                <select
                  value={editStreamLvl}
                  onChange={(e) => setEditStreamLvl(e.target.value)}
                  className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
                >
                  <option value="Stream A">Stream A</option>
                  <option value="Stream B">Stream B</option>
                  <option value="Stream C">Stream C</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Gender</label>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                  className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
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

      {/* Filter and Table view */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-[rgba(255,255,255,0.08)]">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or admission number..."
            className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="py-3 px-4 font-semibold uppercase">Admission No</th>
                <th className="py-3 px-4 font-semibold uppercase">Full Name</th>
                <th className="py-3 px-4 font-semibold uppercase">Gender</th>
                <th className="py-3 px-4 font-semibold uppercase">Class / Stream</th>
                <th className="py-3 px-4 font-semibold uppercase">Guardian</th>
                <th className="py-3 px-4 font-semibold uppercase">Status</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((std) => (
                <tr key={std.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">{std.admission_number}</td>
                  <td className="py-4 px-4 font-medium text-white">{std.first_name} {std.last_name}</td>
                  <td className="py-4 px-4 capitalize text-gray-400">{std.gender}</td>
                  <td className="py-4 px-4 text-gray-400">{std.class} • {std.stream}</td>
                  <td className="py-4 px-4 text-gray-400">{std.parent}</td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      std.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {std.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {isAdmin ? (
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(std)}
                          className="text-[10px] font-bold px-2.5 py-1 rounded border border-white/10 text-gray-300 hover:bg-white/5 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-indigo-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(std.id)}
                          className="text-[10px] font-bold px-2.5 py-1 rounded border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                          <span>Delete</span>
                        </button>
                        <button
                          onClick={() => toggleStatus(std.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded transition border cursor-pointer ${
                            std.status === 'active' 
                              ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {std.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-[10px] italic">Access Protected</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 font-medium">
                    No student records match search terms.
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
