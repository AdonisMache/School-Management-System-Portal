import React, { useState } from 'react';
import { CalendarDays, Save, CheckCircle } from 'lucide-react';

export const AttendanceSystem: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('Form 4');
  const [selectedStream, setSelectedStream] = useState('Stream A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [studentList, setStudentList] = useState<any[]>([
    { id: '1', name: 'Alice Smith', adm: 'ADM/2026/0001', status: 'present' },
    { id: '2', name: 'Bob Jones', adm: 'ADM/2026/0002', status: 'present' },
    { id: '3', name: 'Charlie Miller', adm: 'ADM/2026/0003', status: 'present' },
    { id: '4', name: 'Diana Watson', adm: 'ADM/2026/0004', status: 'absent' },
    { id: '5', name: 'Ethan Carter', adm: 'ADM/2026/0005', status: 'present' }
  ]);

  const [saved, setSaved] = useState(false);

  const handleStatusChange = (id: string, newStatus: string) => {
    setStudentList(studentList.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleSaveAttendance = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    // In a live Supabase implementation:
    // We would map and insert records into student_attendance table
    // For the demo, this interactively saves state in the browser and reports success.
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-6 flex justify-between items-center border border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-400" />
            Attendance Tracking Console
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Log daily student check-ins, record sick leaves, and generate roll call reports.
          </p>
        </div>
      </div>

      {/* Class Selector Bar */}
      <div className="glass-panel p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Class Cohort</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
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

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stream</label>
          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
          >
            <option value="Stream A">Stream A</option>
            <option value="Stream B">Stream B</option>
            <option value="Stream C">Stream C</option>
          </select>
        </div>

        <button
          onClick={handleSaveAttendance}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Save className="w-4 h-4" />
          <span>Save Roster Sheet</span>
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p>Attendance records successfully logged for {selectedClass} • {selectedStream} on {selectedDate}!</p>
        </div>
      )}

      {/* Student List & Attendance Toggles */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="py-3 px-4 font-semibold uppercase">Admission No</th>
                <th className="py-3 px-4 font-semibold uppercase">Student Full Name</th>
                <th className="py-3 px-4 font-semibold uppercase text-center">Status Selection</th>
              </tr>
            </thead>
            <tbody>
              {studentList.map((student) => (
                <tr key={student.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">{student.adm}</td>
                  <td className="py-4 px-4 font-medium text-white">{student.name}</td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center items-center gap-3">
                      {['present', 'absent', 'late', 'sick', 'excused'].map((statusOption) => (
                        <button
                          key={statusOption}
                          onClick={() => handleStatusChange(student.id, statusOption)}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition cursor-pointer ${
                            student.status === statusOption
                              ? statusOption === 'present' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : statusOption === 'absent' ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                : statusOption === 'late' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                              : 'bg-transparent border-white/5 text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {statusOption}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
