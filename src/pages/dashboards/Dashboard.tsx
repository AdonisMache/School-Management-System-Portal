import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  GraduationCap, 
  DollarSign, 
  CalendarDays, 
  Shield,
  Activity,
  HardDrive,
  Settings,
  PlusCircle,
  FileCheck,
  AlertOctagon,
  ChevronRight,
  BookMarked
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, roles } = useAuth();
  
  // Consolidate role resolution: if user has super_admin/principal/director, fall back to school_admin.
  let primaryRole = roles[0] || 'student';
  if (['super_admin', 'director', 'principal', 'vice_principal', 'dept_manager', 'hod'].includes(primaryRole)) {
    primaryRole = 'school_admin';
  }

  // Helper to render role badge
  const renderRoleBadge = () => (
    <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-500/25">
      Role: {primaryRole.replace('_', ' ')}
    </span>
  );

  // =========================================================================
  // 1. SCHOOL ADMIN DASHBOARD (Consolidates all administrative tasks)
  // =========================================================================
  const renderSchoolAdmin = () => (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: '1,248', icon: Users, color: 'text-indigo-400' },
          { label: 'Total Teachers', value: '84', icon: GraduationCap, color: 'text-indigo-400' },
          { label: 'Daily Attendance', value: '96.4%', icon: CalendarDays, color: 'text-emerald-400' },
          { label: 'Outstanding Fees', value: '$23,400', icon: DollarSign, color: 'text-amber-400' }
        ].map((item, i) => (
          <div key={i} className="glass-panel p-4 rounded-xl flex items-center justify-between border border-white/5">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold">{item.label}</p>
              <p className="text-lg font-black text-white mt-1">{item.value}</p>
            </div>
            <item.icon className={`w-6 h-6 ${item.color}/80`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day-to-Day Operations Console */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            School Admin Console
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-white">Enroll Student</h4>
              <p className="text-[10px] text-gray-400">Add profiles, assign cohort streams, and record guardian details.</p>
              <a href="/students" className="text-[10px] text-indigo-400 hover:underline font-semibold block mt-1">Register Student →</a>
            </div>
            <div className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-white">Manage Classes</h4>
              <p className="text-[10px] text-gray-400">Configure Form cohorts, stream groups, and map subject teachers.</p>
              <a href="/academics" className="text-[10px] text-indigo-400 hover:underline font-semibold block mt-1">Configure Setup →</a>
            </div>
            <div className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-white">Manage Teachers</h4>
              <p className="text-[10px] text-gray-400">Register qualifications, edit subject permissions, and map rosters.</p>
              <a href="/teachers" className="text-[10px] text-indigo-400 hover:underline font-semibold block mt-1">Add Teacher →</a>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-white mb-2">Quick Administration Tools</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: 'Access Audit Logs', href: '/audit' },
                { label: 'Record Fee Payment', href: '/finance' },
                { label: 'Academic Setup', href: '/academics' },
                { label: 'Broadcast Bulletin', href: '/announcements' }
              ].map((action, i) => (
                <a key={i} href={action.href} className="p-2.5 rounded-xl bg-white/2 border border-white/5 text-[10px] text-center text-gray-300 hover:bg-indigo-600 hover:text-white transition-all font-semibold">
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* System Diagnostics & Health */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            System Control Panel
          </h3>
          
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-white/2 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                <span className="text-gray-400">DB Storage</span>
              </div>
              <span className="font-bold text-white">4.2 GB / 10 GB</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-white/2 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-400">Server Uptime</span>
              </div>
              <span className="font-bold text-emerald-400">99.98%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-white/2 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400">DB Backups</span>
              </div>
              <span className="font-bold text-white">Daily (Automated)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Growth Chart */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
        <h3 className="text-md font-bold text-white">Enrollment Statistics (Form Capacity Growth)</h3>
        <div className="h-44 w-full bg-white/2 rounded-xl flex items-end justify-between p-4 border border-white/5 relative">
          <div className="absolute top-4 left-4 text-xs text-gray-500">Student Capacity Growth (2022 - 2026)</div>
          {[480, 620, 850, 1020, 1248].map((val, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-1/6">
              <div 
                className="w-8 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-300"
                style={{ height: `${(val / 1300) * 110}px` }}
              ></div>
              <span className="text-[10px] text-gray-400 font-semibold">{2022 + i} ({val})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // 2. ACCOUNTANT DASHBOARD
  // =========================================================================
  const renderAccountant = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-white/5">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase">Collected Fees</span>
            <p className="text-2xl font-black text-emerald-400">$124,800</p>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-500/20" />
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-white/5">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase">Arrears Outstanding</span>
            <p className="text-2xl font-black text-red-400">$23,400</p>
          </div>
          <AlertOctagon className="w-8 h-8 text-red-500/20" />
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-white/5">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase">Payments Logged Today</span>
            <p className="text-2xl font-black text-indigo-400">14 invoices</p>
          </div>
          <FileCheck className="w-8 h-8 text-indigo-500/20" />
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-bold text-white">Quick Roster Transaction logger</h3>
          <a href="/finance" className="text-[10px] text-indigo-400 hover:underline font-bold">Open Accounts Ledger →</a>
        </div>
        <p className="text-xs text-gray-400">
          Record student tuition collections, boarding dues payments, and check cash and bank balances statements.
        </p>
      </div>
    </div>
  );

  // =========================================================================
  // 3. TEACHER DASHBOARD
  // =========================================================================
  const renderTeacher = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lessons Schedule */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
          <h3 className="text-md font-bold text-white">Lessons Roster Today</h3>
          <div className="space-y-3 text-xs">
            {[
              { time: '08:30 AM - 09:45 AM', subject: 'Form 4A Mathematics', room: 'Lab 2' },
              { time: '11:00 AM - 12:15 PM', subject: 'Form 5B Physics', room: 'Classroom 4' }
            ].map((lesson, i) => (
              <div key={i} className="p-3 bg-white/2 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{lesson.subject}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{lesson.time}</p>
                </div>
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold px-2 py-1 rounded">
                  {lesson.room}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Commands */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
          <h3 className="text-md font-bold text-white">Academic Roster Commands</h3>
          <p className="text-xs text-gray-400">
            Track daily class attendances, grade test sheets, and dispatch homework assignments parameters.
          </p>
          <div className="flex gap-4">
            <a href="/attendance" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-center text-xs font-bold transition-all">
              Mark Attendance
            </a>
            <a href="/marks" className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl py-3 text-center text-xs font-bold transition-all">
              Log Exam Marks
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // 4. STUDENT DASHBOARD
  // =========================================================================
  const renderStudent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assignments due list */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
          <h3 className="text-md font-bold text-white flex items-center justify-between">
            <span>My Homework Assignments</span>
            <span className="bg-indigo-500/20 text-indigo-400 text-[9px] px-2 py-0.5 rounded font-bold">3 Due</span>
          </h3>
          <div className="space-y-2 text-xs">
            {[
              { title: 'Calculus Exercises Sheet', subject: 'Mathematics', due: 'In 2 days', status: 'Pending' },
              { title: 'Newton Mechanics Lab Report', subject: 'Physics', due: 'In 5 days', status: 'Submitted' }
            ].map((asg, i) => (
              <div key={i} className="p-3 bg-white/2 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{asg.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{asg.subject} • Due {asg.due}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  asg.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>{asg.status}</span>
              </div>
            ))}
          </div>
          <a href="/assignments" className="text-[10px] text-indigo-400 hover:underline font-bold block pt-2 text-right">View All Assignments →</a>
        </div>

        {/* E-Library quick check */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
          <h3 className="text-md font-bold text-white">E-Library Resources</h3>
          <p className="text-xs text-gray-400">
            Explore syllabus materials, past examination papers, revision guide books, and class lecture notes.
          </p>
          <a href="/library" className="w-full flex items-center justify-center gap-2 p-3 bg-white/2 border border-white/5 hover:border-indigo-500/30 rounded-xl text-xs font-semibold hover:bg-white/5 transition-all">
            <BookMarked className="w-4 h-4 text-indigo-400" />
            Explore Library Catalog
          </a>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // 5. PARENT PORTAL DASHBOARD
  // =========================================================================
  const renderParent = () => (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
        <h3 className="text-md font-bold text-white">My Children Progress Summary</h3>
        <div className="space-y-4">
          {[
            { name: 'Alice Smith', class: 'Form 2A', attendance: '98%', balance: '$120.00', performance: 'A' },
            { name: 'Bob Smith', class: 'Form 4B', attendance: '94%', balance: '$0.00', performance: 'B+' }
          ].map((child, i) => (
            <div key={i} className="p-4 bg-white/2 border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-950 flex items-center justify-center font-bold text-indigo-300">
                  {child.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white">{child.name}</p>
                  <p className="text-[10px] text-gray-500">{child.class}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center md:text-left">
                <div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Attendance</p>
                  <p className="font-semibold text-white mt-0.5">{child.attendance}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Term Grade</p>
                  <p className="font-semibold text-indigo-400 mt-0.5">{child.performance}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Fee Balance</p>
                  <p className={`font-semibold mt-0.5 ${child.balance !== '$0.00' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {child.balance}
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 cursor-pointer">
                <span>View Full Reports</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Selector for the dashboard based on the consolidated 5 roles
  const renderDashboardByRole = () => {
    switch (primaryRole) {
      case 'school_admin':
        return renderSchoolAdmin();
      case 'accountant':
        return renderAccountant();
      case 'teacher':
        return renderTeacher();
      case 'student':
        return renderStudent();
      case 'parent':
        return renderParent();
      default:
        return renderStudent();
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome banner segment */}
      <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.08)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="space-y-2">
          {renderRoleBadge()}
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Hello, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-gray-400 text-sm max-w-lg">
            Welcome back to the Apex SMS dashboard. All access controls are active under dynamic database policies.
          </p>
        </div>
        <div className="shrink-0">
          <div className="text-left md:text-right">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Academic Term</p>
            <p className="text-lg font-bold text-white mt-1">2026/2027 • Term 1</p>
          </div>
        </div>
      </div>

      {/* Role Dashboard Component */}
      {renderDashboardByRole()}
    </div>
  );
};
