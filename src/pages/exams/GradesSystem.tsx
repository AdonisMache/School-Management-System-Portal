import React, { useState } from 'react';
import { FileSpreadsheet, Save, CheckCircle, Award } from 'lucide-react';

export const GradesSystem: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedClass, setSelectedClass] = useState('Form 4');
  const [assessmentType, setAssessmentType] = useState('Mid-Term');
  const [maxMarks, setMaxMarks] = useState(100);

  const [studentMarks, setStudentMarks] = useState<any[]>([
    { id: '1', name: 'Alice Smith', adm: 'ADM/2026/0001', score: 85 },
    { id: '2', name: 'Bob Jones', adm: 'ADM/2026/0002', score: 72 },
    { id: '3', name: 'Charlie Miller', adm: 'ADM/2026/0003', score: 94 },
    { id: '4', name: 'Diana Watson', adm: 'ADM/2026/0004', score: 45 },
    { id: '5', name: 'Ethan Carter', adm: 'ADM/2026/0005', score: 68 }
  ]);

  const [saved, setSaved] = useState(false);

  const handleScoreChange = (id: string, newScore: number) => {
    let bounded = Math.min(Math.max(newScore, 0), maxMarks);
    if (isNaN(bounded)) bounded = 0;
    setStudentMarks(studentMarks.map(s => s.id === id ? { ...s, score: bounded } : s));
  };

  const getLetterGrade = (score: number) => {
    const pct = (score / maxMarks) * 100;
    if (pct >= 85) return { grade: 'A', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (pct >= 75) return { grade: 'B', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
    if (pct >= 60) return { grade: 'C', color: 'text-indigo-300 bg-indigo-500/5 border-indigo-500/10' };
    if (pct >= 50) return { grade: 'D', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { grade: 'F', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
  };

  // Rank calculation based on marks
  const sortedStudents = [...studentMarks].sort((a, b) => b.score - a.score);
  const getRank = (score: number) => {
    return sortedStudents.findIndex(s => s.score === score) + 1;
  };

  const handleSaveMarks = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    // In a live Supabase implementation:
    // We would map and insert records into student_marks table
    // For the demo, this interactively saves state in the browser and reports success.
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-6 flex justify-between items-center border border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            Grades & Examination Mark Sheets
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Input student results, compute terminal letter grades, track cohort rank positions, export scorecard summaries.
          </p>
        </div>
      </div>

      {/* Class Selector Bar */}
      <div className="glass-panel p-6 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
          >
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="English Literature">English Literature</option>
            <option value="History">History</option>
          </select>
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
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assessment Type</label>
          <select
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value)}
            className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
          >
            <option value="Continuous Assessment">Continuous Assessment</option>
            <option value="Test">Class Test</option>
            <option value="Exercise">Home Exercise</option>
            <option value="Mid-Term">Mid-Term Exam</option>
            <option value="End-Term">Term-End Exam</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Max Marks</label>
          <input
            type="number"
            value={maxMarks}
            onChange={(e) => setMaxMarks(Number(e.target.value))}
            className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <button
          onClick={handleSaveMarks}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Save className="w-4 h-4" />
          <span>Save Mark Sheet</span>
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p>Marks successfully saved for {selectedClass} • {selectedSubject} ({assessmentType})!</p>
        </div>
      )}

      {/* Roster & Marks Entry Grid */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="py-3 px-4 font-semibold uppercase">Admission No</th>
                <th className="py-3 px-4 font-semibold uppercase">Student Full Name</th>
                <th className="py-3 px-4 font-semibold uppercase">Score Input</th>
                <th className="py-3 px-4 font-semibold uppercase text-center">Letter Grade</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Class Rank</th>
              </tr>
            </thead>
            <tbody>
              {studentMarks.map((student) => {
                const gradeInfo = getLetterGrade(student.score);
                const rank = getRank(student.score);
                return (
                  <tr key={student.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-4 px-4 font-bold text-white">{student.adm}</td>
                    <td className="py-4 px-4 font-medium text-white">{student.name}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={student.score}
                          onChange={(e) => handleScoreChange(student.id, Number(e.target.value))}
                          className="w-16 bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-2 py-1 text-xs text-white text-center focus:outline-none"
                        />
                        <span className="text-gray-500">/ {maxMarks}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border ${gradeInfo.color}`}>
                        {gradeInfo.grade}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-gray-400">
                      <span className="flex items-center justify-end gap-1">
                        <Award className="w-3.5 h-3.5 text-indigo-400" />
                        Rank #{rank}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
