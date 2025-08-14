import React, { useEffect, useState } from 'react';
import { fetchGuestList, addGuest, updateGuest, removeGuest, Guest } from '../../services/api/guestListApi';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Updated status colors to match the new theme
const STATUS_STYLES: Record<string, string> = {
  Pending: "secondary",
  Invited: "default",
  Confirmed: "default", // Using primary color for confirmed
  Declined: "destructive",
};

export default function GuestsPage() {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Guest>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('');

  const weddingId = user?.wedding_id || null;

  const loadGuests = async () => {
    setLoading(true);
    try {
      if (weddingId) {
        const data = await fetchGuestList(weddingId);
        setGuests(data);
      }
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (weddingId) loadGuests();
  }, [weddingId]);

  const handleEdit = (guest: Guest) => {
    setForm(guest);
    setEditingId(guest.guest_id);
    setShowForm(true);
  };

  const handleDelete = async (guest_id: string) => {
    if (!window.confirm('Are you sure you want to remove this guest?')) return;
    try {
      await removeGuest(guest_id);
      setGuests((prev) => prev.filter((g) => g.guest_id !== guest_id));
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to remove guest');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guest_name || !user?.wedding_id) return;
    try {
      if (editingId) {
        const updated = await updateGuest(editingId, form);
        setGuests((prev) => prev.map((g) => (g.guest_id === editingId ? updated : g)));
      } else {
        const newGuest = await addGuest({ ...form, wedding_id: user.wedding_id } as Guest);
        setGuests((prev) => [newGuest, ...prev]);
      }
      setShowForm(false);
      setForm({});
      setEditingId(null);
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to save guest');
    }
  };

  const filteredGuests = guests.filter(g => {
    const match =
      g.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      (g.contact_info || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.relation || '').toLowerCase().includes(search.toLowerCase());
    if (filter) return match && (g.status === filter || g.side === filter);
    return match;
  });

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle className="text-3xl">Guest List</CardTitle>
          <CardDescription>Manage your wedding guests and track RSVPs.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Search guests..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
          <Button onClick={() => { setShowForm(true); setForm({}); setEditingId(null); }}>
            + Add Guest
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="text-destructive mb-4">{error}</div>}
        {showForm && (
          <form className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-background/50" onSubmit={handleFormSubmit}>
            <Input placeholder="Name" value={form.guest_name || ''} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))} required />
            <Input placeholder="Contact Info (Email/Phone)" value={form.contact_info || ''} onChange={e => setForm(f => ({ ...f, contact_info: e.target.value }))} />
            <Input placeholder="Relation" value={form.relation || ''} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))} />
            <Select value={form.side || ''} onValueChange={value => setForm(f => ({ ...f, side: value }))}>
              <SelectTrigger><SelectValue placeholder="Side" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Groom">Groom</SelectItem>
                <SelectItem value="Bride">Bride</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.status || ''} onValueChange={value => setForm(f => ({ ...f, status: value }))}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Invited">Invited</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
              </SelectContent>
            </Select>
            <Input className="md:col-span-2" placeholder="Dietary Requirements" value={form.dietary_requirements || ''} onChange={e => setForm(f => ({ ...f, dietary_requirements: e.target.value }))} />
            <div className="md:col-span-2 flex gap-2 mt-2">
              <Button type="submit">{editingId ? 'Update Guest' : 'Add Guest'}</Button>
              <Button variant="outline" type="button" onClick={() => { setShowForm(false); setForm({}); setEditingId(null); }}>Cancel</Button>
            </div>
          </form>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Relation</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dietary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading guests...</TableCell></TableRow>
              ) : filteredGuests.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">No guests found.</TableCell></TableRow>
              ) : filteredGuests.map(guest => (
                <TableRow key={guest.guest_id}>
                  <TableCell className="font-medium">{guest.guest_name}</TableCell>
                  <TableCell>{guest.contact_info}</TableCell>
                  <TableCell>{guest.relation}</TableCell>
                  <TableCell>{guest.side}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_STYLES[guest.status || 'Pending'] || 'secondary'}>{guest.status || 'Pending'}</Badge>
                  </TableCell>
                  <TableCell>{guest.dietary_requirements}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(guest)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(guest.guest_id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
