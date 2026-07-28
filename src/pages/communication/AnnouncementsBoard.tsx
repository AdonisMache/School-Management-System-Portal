import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Megaphone, Plus, CheckCircle, Clock } from 'lucide-react';

export const AnnouncementsBoard: React.FC = () => {
  const { hasPermission } = useAuth();
  const canPost = hasPermission('announcements:write');

  const [announcements, setAnnouncements] = useState<any[]>([
    { id: '1', title: 'Staff Assembly Meeting', content: 'Principal reports finalization briefings will be held tomorrow morning at 8:00 AM. Attendance is mandatory for all academic staff.', target: 'teachers', date: '2026-06-23' },
    { id: '2', title: 'Term 1 Parents Day', content: 'Parents consultations schedules have been published inside your respective portal. Consultations start at 9:00 AM on Friday.', target: 'parents', date: '2026-06-22' },
    { id: '3', title: 'Inter-House Sports Gala Registration', content: 'Registration for tracking activities is open. Visit your department head to select sports and races.', target: 'all', date: '2026-06-20' }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('all');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newPost = {
      id: crypto.randomUUID(),
      title,
      content,
      target,
      date: new Date().toISOString().split('T')[0]
    };

    setAnnouncements([newPost, ...announcements]);
    setShowAddForm(false);
    setSuccess(true);
    
    // Clear forms
    setTitle('');
    setContent('');

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            School Broadcasts & Announcements Board
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Dispatch announcements parameters, schedule notices target filters, update school alerts.
          </p>
        </div>
        {canPost && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create Notice</span>
          </button>
        )}
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p>Announcement successfully published and broadcasted!</p>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handlePost} className="glass-panel p-6 rounded-2xl space-y-4 border-indigo-500/20">
          <h3 className="text-sm font-bold text-white">Create New Broadcast</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement Title"
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
            >
              <option value="all">Broadcast to All Users</option>
              <option value="teachers">Broadcast to Teachers</option>
              <option value="parents">Broadcast to Parents</option>
              <option value="students">Broadcast to Students</option>
            </select>
          </div>

          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Announcement Message..."
            rows={4}
            className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
          />

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
              Broadcast Notice
            </button>
          </div>
        </form>
      )}

      {/* Broadcast Feed list */}
      <div className="space-y-6">
        {announcements.map((post) => (
          <div key={post.id} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                post.target === 'all' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
                  : post.target === 'teachers' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
              }`}>
                Audience: {post.target}
              </span>
              <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {post.date}
              </span>
            </div>
            <h3 className="text-md font-bold text-white leading-tight">{post.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
