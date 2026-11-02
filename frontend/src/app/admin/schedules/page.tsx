'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Plus, Edit, Trash2, Calendar, X, Save, Loader2, Clock } from 'lucide-react';

interface Schedule {
  id: number;
  service_id: number;
  service_name: string;
  area: string;
  day_of_week: string;
  time_slot: string;
  frequency: string;
  notes: string;
  is_active: boolean;
}

interface Service { id: number; name: string; category: string; }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Daily', 'Weekdays', 'Weekends'];
const FREQUENCIES = ['daily', 'weekly', 'bi-weekly', 'monthly'];
const AREAS = ['All Areas', 'North Ward', 'South Ward', 'East Ward', 'West Ward', 'Central Ward'];

const dayColor: Record<string, string> = {
  Monday: 'bg-blue-50 text-blue-700', Tuesday: 'bg-purple-50 text-purple-700',
  Wednesday: 'bg-green-50 text-green-700', Thursday: 'bg-yellow-50 text-yellow-700',
  Friday: 'bg-orange-50 text-orange-700', Saturday: 'bg-pink-50 text-pink-700',
  Sunday: 'bg-red-50 text-red-700', Daily: 'bg-indigo-50 text-indigo-700',
  Weekdays: 'bg-teal-50 text-teal-700', Weekends: 'bg-rose-50 text-rose-700',
};

export default function AdminSchedulesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterArea, setFilterArea] = useState('All Areas');
  const emptyForm = { service_id: 0, area: 'North Ward', day_of_week: 'Monday', time_slot: '', frequency: 'weekly', notes: '', is_active: true };
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const fetchData = useCallback(async () => {
    try {
      const [schData, svcData] = await Promise.all([
        apiFetch('/schedules?limit=200'),
        apiFetch('/services?limit=100')
      ]);
      setSchedules(schData.schedules || []);
      const svcs = svcData.services || [];
      setServices(svcs);
      if (svcs.length > 0) setForm(f => ({...f, service_id: svcs[0].id}));
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') { router.push('/dashboard'); return; }
      fetchData();
    }
  }, [user, authLoading, router, fetchData]);

  const filtered = schedules.filter(s => filterArea === 'All Areas' || s.area === filterArea);

  const openCreate = () => {
    setEditing(null);
    setForm({...emptyForm, service_id: services[0]?.id || 0});
    setShowModal(true);
  };
  const openEdit = (s: Schedule) => {
    setEditing(s);
    setForm({ service_id: s.service_id, area: s.area, day_of_week: s.day_of_week, time_slot: s.time_slot, frequency: s.frequency, notes: s.notes || '', is_active: s.is_active });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.service_id || !form.time_slot.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await apiFetch(`/admin/schedules/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
        setSchedules(prev => prev.map(s => s.id === editing.id ? updated : s));
      } else {
        const created = await apiFetch('/admin/schedules', { method: 'POST', body: JSON.stringify(form) });
        setSchedules(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this schedule entry?')) return;
    setDeletingId(id);
    try {
      await apiFetch(`/admin/schedules/${id}`, { method: 'DELETE' });
      setSchedules(prev => prev.filter(s => s.id !== id));
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
            <p className="text-sm text-gray-500 mt-1">{schedules.length} schedule entries</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Schedule
          </button>
        </div>

        {/* Area filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {AREAS.map(a => (
            <button key={a} onClick={() => setFilterArea(a)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterArea === a ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {a}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No schedules found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Service</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Area</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Day</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Time</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Frequency</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(s => (
                  <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${!s.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.service_name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.area}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dayColor[s.day_of_week] || 'bg-gray-100 text-gray-600'}`}>{s.day_of_week}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />{s.time_slot}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{s.frequency}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50">
                          {deletingId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Edit Schedule' : 'Add Schedule'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
                <select value={form.service_id} onChange={e => setForm(f => ({...f, service_id: Number(e.target.value)}))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <select value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    {AREAS.filter(a => a !== 'All Areas').map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                  <select value={form.day_of_week} onChange={e => setForm(f => ({...f, day_of_week: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot *</label>
                  <input value={form.time_slot} onChange={e => setForm(f => ({...f, time_slot: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 7:00 AM - 9:00 AM" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select value={form.frequency} onChange={e => setForm(f => ({...f, frequency: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none capitalize">
                    {FREQUENCIES.map(fr => <option key={fr} value={fr} className="capitalize">{fr}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Optional notes (e.g. except public holidays)" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="sch_active" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} className="w-4 h-4 text-indigo-600 rounded" />
                <label htmlFor="sch_active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.service_id || !form.time_slot.trim()}
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
