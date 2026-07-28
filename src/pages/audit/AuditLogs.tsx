import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ScrollText, Search, Activity, CalendarDays } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([
    { id: '1', user: 'admin@vlc.edu', action: 'CREATE_USER', details: 'Added teacher profile for EMP2026/004', ip: '192.168.1.102', timestamp: '2026-06-23 20:12:44' },
    { id: '2', user: 'teacher@vlc.edu', action: 'GRADE_ENTRY', details: 'Uploaded Mid-Term marks for Form 4 Chemistry', ip: '192.168.1.105', timestamp: '2026-06-23 18:34:12' },
    { id: '3', user: 'accountant@vlc.edu', action: 'FEE_PAYMENT', details: 'Recorded payment of $400 for Alice Smith', ip: '192.168.1.108', timestamp: '2026-06-23 16:22:01' },
    { id: '4', user: 'admin@vlc.edu', action: 'PASSWORD_RESET', details: 'Forced password change reset flag on first login for student@vlc.edu', ip: '192.168.1.102', timestamp: '2026-06-23 14:10:55' },
    { id: '5', user: 'admin@vlc.edu', action: 'LOGIN', details: 'User session active', ip: '192.168.1.102', timestamp: '2026-06-23 13:00:00' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          user: item.user_id || 'System Event',
          action: item.action,
          details: `Modified record in ${item.table_name}`,
          ip: item.ip_address || '127.0.0.1',
          timestamp: new Date(item.created_at).toLocaleString()
        }));
        setLogs(mapped);
      }
    };
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    `${l.user} ${l.action} ${l.details}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-6 flex justify-between items-center border border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-indigo-400" />
            System Operations Audit Logs
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Visual logs of authentication activities, table changes, critical updates, IP tracking.
          </p>
        </div>
      </div>

      {/* Roster logs table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail by user, action, details..."
              className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
          <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/25">
            <Activity className="w-3.5 h-3.5" />
            Live System Events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="py-3 px-4 font-semibold uppercase">Timestamp</th>
                <th className="py-3 px-4 font-semibold uppercase">Operator</th>
                <th className="py-3 px-4 font-semibold uppercase">Operation Action</th>
                <th className="py-3 px-4 font-semibold uppercase">Details Description</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="py-4 px-4 font-medium text-gray-400 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-gray-500" />
                    {log.timestamp}
                  </td>
                  <td className="py-4 px-4 font-bold text-white">{log.user}</td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : log.action.includes('RESET') || log.action.includes('CHANGE') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-400 max-w-sm truncate">{log.details}</td>
                  <td className="py-4 px-4 text-right font-mono text-gray-500">{log.ip}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                    No system log events match search terms.
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
