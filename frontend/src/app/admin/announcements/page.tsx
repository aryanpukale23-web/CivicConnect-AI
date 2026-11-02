'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Plus, Edit, Trash2, Bell, AlertTriangle, Info, CheckCircle, X, Save, Loader2 } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  area: string;
  priority: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const AREAS = ['All Areas', 'North Ward', 'South Ward', 'East Ward', 'West Ward', 'Central Ward'];

const priorityIcon = (p: string) => {
  if (p === 'urgent') return <AlertTriangle className="w-4 h-4 text-red-500" />;
  if (p === 'high') return <Bell className="w-4 h-4 text-orange-500" />;
  if (p === 'medium') return <Info className="w-4 h-4 text-blue-500" />;
  return <CheckCircle className="w-4 h-4 text-green-500" />;
};

const priorityBadge: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

export default function AdminAnnouncementsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', content: '', area: 'All Areas', priority: 'medium', is_active: true });

  const fetchAnnouncements = useCallback(async () => {
    try {
      const data = await apiFetch('/announcements?limit=100');
      setAnnouncements(data.announcements || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') { router.push('/dashboard'); return; }
      fetchAnnouncements();
    }
  }, [user, authLoading, router, fetchAnnouncements]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', content: '', area: 'All Areas', priority: 'medium', is_active: true });
    setShowModal(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({ title: a.title, content: a.content, area: a.area, priority: a.priority, is_active: a.is_active });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await apiFetch(`/announcements/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
        setAnnouncements(prev => prev.map(a => a.id === editing.id ? updated : a));
      } else {
        const created = await apiFetch('/announcements', { method: 'POST', body: JSON.stringify(form) });
        setAnnouncements(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this announcement?')) return;
    setDeletingId(id);
    try {
      await apiFetch(`/announcements/${id}`, { method: 'DELETE' });
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch { /* silent */ } finally { setDeletingId(null); }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="text-sm text-gray-500 mt-1">{announcements.length} total announcements</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" /> New Announcement
          </button>
        </div>

        {/* List */}
        {announcements.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No announcements yet. Create one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className={`bg-white rounded-xl shadow-sm border p-5 ${!a.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {priorityIcon(a.priority)}
                      <h3 className="font-semibold text-gray-900 truncate">{a.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityBadge[a.priority]}`}>{a.priority}</span>
                      {!a.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border">Inactive</span>}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{a.content}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>📍 {a.area}</span>
                      <span>🕒 {new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEdit(a)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                      {deletingId === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Edit Announcement' : 'New Announcement'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Announcement title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))}
                  rows={4} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  placeholder="Announcement details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <select value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none capitalize">
                    {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))}
                  className="w-4 h-4 text-indigo-600 rounded" />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active (visible to citizens)</label>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.content.trim()}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
