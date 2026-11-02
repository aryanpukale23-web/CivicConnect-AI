'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Plus, Edit, Trash2, Search, MapPin, Phone, X, Save, Loader2, Building2 } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  contact_number: string;
  area: string;
  address: string;
  operating_hours: string;
  is_active: boolean;
}

const CATEGORIES = ['waste_management', 'water_supply', 'electricity', 'public_transport', 'emergency', 'healthcare', 'education', 'parks', 'other'];
const AREAS = ['All Areas', 'North Ward', 'South Ward', 'East Ward', 'West Ward', 'Central Ward'];

const categoryLabel = (c: string) => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export default function AdminServicesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const emptyForm = { name: '', category: 'waste_management', description: '', contact_number: '', area: 'All Areas', address: '', operating_hours: '', is_active: true };
  const [form, setForm] = useState(emptyForm);

  const fetchServices = useCallback(async () => {
    try {
      const data = await apiFetch('/services?limit=100');
      setServices(data.services || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') { router.push('/dashboard'); return; }
      fetchServices();
    }
  }, [user, authLoading, router, fetchServices]);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.area.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null); setForm(emptyForm); setShowModal(true);
  };
  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ name: s.name, category: s.category, description: s.description || '', contact_number: s.contact_number || '', area: s.area, address: s.address || '', operating_hours: s.operating_hours || '', is_active: s.is_active });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await apiFetch(`/admin/services/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
        setServices(prev => prev.map(s => s.id === editing.id ? updated : s));
      } else {
        const created = await apiFetch('/admin/services', { method: 'POST', body: JSON.stringify(form) });
        setServices(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this service? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await apiFetch(`/admin/services/${id}`, { method: 'DELETE' });
      setServices(prev => prev.filter(s => s.id !== id));
    } catch { /* silent */ } finally { setDeletingId(null); }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Civic Services</h1>
            <p className="text-sm text-gray-500 mt-1">{services.length} services registered</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
            placeholder="Search by name, category, or area..." />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{search ? 'No matching services.' : 'No services added yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(s => (
              <div key={s.id} className={`bg-white rounded-xl shadow-sm border p-5 ${!s.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{s.name}</h3>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{categoryLabel(s.category)}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                      {deletingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {s.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{s.description}</p>}
                <div className="space-y-1 text-xs text-gray-500">
                  {s.contact_number && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{s.contact_number}</div>}
                  {s.area && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{s.area}</div>}
                  {s.operating_hours && <div className="text-gray-400">⏰ {s.operating_hours}</div>}
                </div>
                {!s.is_active && <div className="mt-2 text-xs text-gray-400 bg-gray-50 rounded px-2 py-1">Inactive</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. North Ward Garbage Collection" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <select value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  rows={3} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Brief description of this service" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input value={form.contact_number} onChange={e => setForm(f => ({...f, contact_number: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 020-12345678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
                  <input value={form.operating_hours} onChange={e => setForm(f => ({...f, operating_hours: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Mon-Sat 9AM-5PM" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Full address" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="svc_active" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} className="w-4 h-4 text-indigo-600 rounded" />
                <label htmlFor="svc_active" className="text-sm font-medium text-gray-700">Active (visible in directory)</label>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
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
