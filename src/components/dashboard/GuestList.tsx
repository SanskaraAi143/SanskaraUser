import React, { useEffect, useState } from 'react';
import { fetchGuestList, addGuest, updateGuest, removeGuest, Guest } from '../../services/api/guestListApi';
import { getCurrentUserProfile } from '../../services/api/userApi';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-gray-400',
  Invited: 'bg-blue-400',
  Confirmed: 'bg-green-500',
  Declined: 'bg-red-400',
};

export default function GuestList() {
  const [userId, setUserId] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Guest>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-8 animate-fadein">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Guest List</h2>
            <p className="text-gray-500 text-sm mt-1">Manage your wedding guests and track RSVPs.</p>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold shadow"
            onClick={() => { setShowForm(true); setForm({}); setEditingId(null); }}
          >
            + Add Guest
          </button>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="overflow-x-auto mt-4">
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
              ) : guests.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No guests added yet.</td></tr>
              ) : guests.map(guest => (
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
      {/* MODAL: Only rendered when showForm is true */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all" onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setForm({}); setEditingId(null); } }}>
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-[fadeInScale_0.3s_ease]" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              aria-label="Close Guest Form"
              onClick={() => { setShowForm(false); setForm({}); setEditingId(null); }}
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
              {editingId ? 'Edit Guest' : 'Add New Guest'}
              <span className="text-sm font-normal text-gray-400">(All fields optional except Name)</span>
            </h3>
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleFormSubmit}
              autoComplete="off"
              aria-label={editingId ? 'Edit Guest Form' : 'Add Guest Form'}
            >
              <div className="flex flex-col gap-1 md:col-span-2">
                <label htmlFor="guest_name" className="font-semibold text-gray-700 flex items-center gap-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="guest_name"
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  placeholder="e.g., John Doe"
                  value={form.guest_name || ''}
                  onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))}
                  required
                  aria-required="true"
                  aria-describedby="guest_name_help"
                />
                <span id="guest_name_help" className="text-xs text-gray-400">Full name of the guest</span>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="contact_info" className="font-semibold text-gray-700">Contact Info <span className="ml-1 text-xs text-gray-400">(Phone or Email)</span></label>
                <input
                  id="contact_info"
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  placeholder="e.g., 9876543210 or john@email.com"
                  value={form.contact_info || ''}
                  onChange={e => setForm(f => ({ ...f, contact_info: e.target.value }))}
                  aria-describedby="contact_info_help"
                />
                <span id="contact_info_help" className="text-xs text-gray-400">For RSVP or reminders</span>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="relation" className="font-semibold text-gray-700">Relation <span className="text-xs text-gray-400">(e.g., Cousin, Friend)</span></label>
                <input
                  id="relation"
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  placeholder="e.g., Cousin"
                  value={form.relation || ''}
                  onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
                  aria-describedby="relation_help"
                />
                <span id="relation_help" className="text-xs text-gray-400">Optional</span>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="side" className="font-semibold text-gray-700">Side</label>
                <select
                  id="side"
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  value={form.side || ''}
                  onChange={e => setForm(f => ({ ...f, side: e.target.value }))}
                  aria-describedby="side_help"
                >
                  <option value="">Select side</option>
                  <option value="Groom">Groom</option>
                  <option value="Bride">Bride</option>
                  <option value="Both">Both</option>
                </select>
                <span id="side_help" className="text-xs text-gray-400">Which side is this guest from?</span>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="status" className="font-semibold text-gray-700">Status</label>
                <select
                  id="status"
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  value={form.status || ''}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  aria-describedby="status_help"
                >
                  <option value="">Select status</option>
                  <option value="Pending">Pending</option>
                  <option value="Invited">Invited</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Declined">Declined</option>
                </select>
                <span id="status_help" className="text-xs text-gray-400">Current invitation status</span>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label htmlFor="dietary_requirements" className="font-semibold text-gray-700">
                  Dietary Requirements
                  <span className="ml-1 text-xs text-gray-400" title="e.g., Vegan, Jain, No Nuts">(Optional)</span>
                </label>
                <input
                  id="dietary_requirements"
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  placeholder="e.g., Vegan, Jain, No Nuts"
                  value={form.dietary_requirements || ''}
                  onChange={e => setForm(f => ({ ...f, dietary_requirements: e.target.value }))}
                  aria-describedby="dietary_help"
                />
                <span id="dietary_help" className="text-xs text-gray-400">Any food preferences or allergies?</span>
              </div>
              <div className="md:col-span-2 flex gap-3 mt-4 items-center">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition focus:outline-none focus:ring-2 focus:ring-green-400"
                  aria-label={editingId ? 'Update Guest' : 'Add Guest'}
                >
                  {editingId ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Update
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      Add
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-200"
                  onClick={() => { setShowForm(false); setForm({}); setEditingId(null); }}
                  aria-label="Cancel Guest Form"
                >
                  Cancel
                </button>
                <span className="text-xs text-gray-400 ml-2">* Required fields</span>
              </div>
            </form>
          </div>
        </div>
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
            ) : guests.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No guests added yet.</td></tr>
            ) : guests.map(guest => (
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

// Tailwind utility for input
// (You may want to move this to your global CSS)
// .input { @apply border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50; transition: box-shadow 0.2s; }
