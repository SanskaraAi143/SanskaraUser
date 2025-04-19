
import React, { useEffect, useState } from 'react';
import { fetchGuestList, addGuest, updateGuest, removeGuest, Guest } from '../../services/api/guestListApi';
import { getCurrentUserProfile } from '../../services/api/userApi';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-gray-400',
  Invited: 'bg-blue-400',
  Confirmed: 'bg-green-500',
  Declined: 'bg-red-400',
};

export default function GuestsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Guest>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('');

  const loadGuests = async () => {
    setLoading(true);
    try {
      if (userId) {
        const data = await fetchGuestList(userId);
        setGuests(data);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch user id on mount
    getCurrentUserProfile().then(profile => {
      setUserId(profile?.user_id || null);
    });
  }, []);

  useEffect(() => {
    if (userId) loadGuests();
    // eslint-disable-next-line
  }, [userId]);

  const handleEdit = (guest: Guest) => {
    setForm(guest);
    setEditingId(guest.guest_id);
    setShowForm(true);
  };

  const handleDelete = async (guest_id: string) => {
    if (!window.confirm('Remove this guest?')) return;
    try {
      await removeGuest(guest_id);
      setGuests((prev) => prev.filter((g) => g.guest_id !== guest_id));
    } catch (e: any) {
      setError(e.message || 'Failed to remove guest');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guest_name || !userId) return;
    try {
      if (editingId) {
        const updated = await updateGuest(editingId, form);
        setGuests((prev) => prev.map((g) => (g.guest_id === editingId ? updated : g)));
      } else {
        const newGuest = await addGuest({ ...form, user_id: userId } as any);
        setGuests((prev) => [newGuest, ...prev]);
      }
      setShowForm(false);
      setForm({});
      setEditingId(null);
    } catch (e: any) {
      setError(e.message || 'Failed to save guest');
    }
  };

  // Filtered guests
  const filteredGuests = guests.filter(g => {
    const match =
      g.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      (g.contact_info || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.relation || '').toLowerCase().includes(search.toLowerCase());
    if (filter) return match && (g.status === filter || g.side === filter);
    return match;
  });

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-8 animate-fadein">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Guest List</h2>
          <p className="text-gray-500">Manage your wedding guests and track RSVPs.</p>
        </div>
        <div className="flex gap-2">
          <input className="input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
            onClick={() => { setShowForm(true); setForm({}); setEditingId(null); }}
          >
            + Add Guest
          </button>
        </div>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {showForm && (
        <form className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleFormSubmit}>
          <input className="input" placeholder="Name" value={form.guest_name || ''} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))} required />
          <input className="input" placeholder="Contact Info" value={form.contact_info || ''} onChange={e => setForm(f => ({ ...f, contact_info: e.target.value }))} />
          <input className="input" placeholder="Relation" value={form.relation || ''} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))} />
          <select className="input" value={form.side || ''} onChange={e => setForm(f => ({ ...f, side: e.target.value }))}>
            <option value="">Side</option>
            <option value="Groom">Groom</option>
            <option value="Bride">Bride</option>
            <option value="Both">Both</option>
          </select>
          <select className="input" value={form.status || ''} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="">Status</option>
            <option value="Pending">Pending</option>
            <option value="Invited">Invited</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Declined">Declined</option>
          </select>
          <input className="input md:col-span-2" placeholder="Dietary Requirements" value={form.dietary_requirements || ''} onChange={e => setForm(f => ({ ...f, dietary_requirements: e.target.value }))} />
          <div className="md:col-span-2 flex gap-2 mt-2">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow">{editingId ? 'Update' : 'Add'}</button>
            <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold" onClick={() => { setShowForm(false); setForm({}); setEditingId(null); }}>Cancel</button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 rounded-l-lg text-left font-semibold text-gray-700">Name</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Contact</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Relation</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Side</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Dietary</th>
              <th className="px-4 py-2 rounded-r-lg text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : filteredGuests.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No guests added yet.</td></tr>
            ) : filteredGuests.map(guest => (
              <tr key={guest.guest_id} className="bg-white hover:bg-blue-50 transition rounded-xl shadow-sm">
                <td className="px-4 py-2 font-semibold text-gray-800">{guest.guest_name}</td>
                <td className="px-4 py-2 text-gray-700">{guest.contact_info}</td>
                <td className="px-4 py-2 text-gray-700">{guest.relation}</td>
                <td className="px-4 py-2 text-gray-700">{guest.side}</td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold text-white ${STATUS_COLORS[guest.status || 'Pending'] || 'bg-gray-400'}`}>{guest.status || 'Pending'}</span>
                </td>
                <td className="px-4 py-2 text-gray-700">{guest.dietary_requirements}</td>
                <td className="px-4 py-2 flex gap-2 justify-center">
                  <button className="text-blue-600 hover:text-blue-900 font-semibold" onClick={() => handleEdit(guest)}>Edit</button>
                  <button className="text-red-500 hover:text-red-800 font-semibold" onClick={() => handleDelete(guest.guest_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
