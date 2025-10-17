import React, { useEffect, useState, useMemo } from 'react';
import {
  fetchGuestList,
  addGuest,
  updateGuest,
  removeGuest,
  Guest,
  Household,
  fetchHouseholds,
  addHousehold,
  updateHousehold,
  removeHousehold,
} from '../../services/api/guestListApi';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';


const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-gray-400',
  Invited: 'bg-blue-400',
  Confirmed: 'bg-green-500',
  Declined: 'bg-red-400',
};

// Define your event types
const WEDDING_EVENTS = ['Sangeet', 'Wedding', 'Reception'];

export default function GuestList() {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showHouseholdForm, setShowHouseholdForm] = useState(false);
  const [guestForm, setGuestForm] = useState<Partial<Guest>>({});
  const [householdForm, setHouseholdForm] = useState<Partial<Household>>({});
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editingHouseholdId, setEditingHouseholdId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSide, setFilterSide] = useState('');
  const [filterRsvpStatus, setFilterRsvpStatus] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.wedding_id) {
        const [guestData, householdData] = await Promise.all([
          fetchGuestList(user.wedding_id),
          fetchHouseholds(user.wedding_id),
        ]);
        setGuests(guestData);
        setHouseholds(householdData);
      }
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.wedding_id) loadData();
    // eslint-disable-next-line
  }, [user?.wedding_id]);

  const handleGuestEdit = (guest: Guest) => {
    setGuestForm(guest);
    setEditingGuestId(guest.guest_id);
    setShowGuestForm(true);
  };

  const handleGuestDelete = async (guest_id: string) => {
    if (!window.confirm('Remove this guest?')) return;
    try {
      await removeGuest(guest_id);
      setGuests((prev) => prev.filter((g) => g.guest_id !== guest_id));
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to remove guest');
    }
  };

  const handleGuestFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.guest_name || !user?.wedding_id) return;
    try {
      if (editingGuestId) {
        const updated = await updateGuest(editingGuestId, guestForm);
        setGuests((prev) => prev.map((g) => (g.guest_id === editingGuestId ? updated : g)));
      } else {
        const newGuest = await addGuest({ ...guestForm, wedding_id: user.wedding_id } as Guest);
        setGuests((prev) => [newGuest, ...prev]);
      }
      setShowGuestForm(false);
      setGuestForm({});
      setEditingGuestId(null);
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to save guest');
    }
  };

  const handleHouseholdEdit = (household: Household) => {
    setHouseholdForm(household);
    setEditingHouseholdId(household.household_id);
    setShowHouseholdForm(true);
  };

  const handleHouseholdDelete = async (household_id: string) => {
    if (!window.confirm('Remove this household and all associated guests?')) return;
    try {
      await removeHousehold(household_id);
      setHouseholds((prev) => prev.filter((h) => h.household_id !== household_id));
      // Also remove associated guests
      setGuests((prev) => prev.filter((g) => g.household_id !== household_id));
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to remove household');
    }
  };

  const handleHouseholdFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdForm.household_name || !user?.wedding_id) return;
    try {
      if (editingHouseholdId) {
        const updated = await updateHousehold(editingHouseholdId, householdForm);
        setHouseholds((prev) => prev.map((h) => (h.household_id === editingHouseholdId ? updated : h)));
      } else {
        const newHousehold = await addHousehold({ ...householdForm, wedding_id: user.wedding_id } as Household);
        setHouseholds((prev) => [newHousehold, ...prev]);
      }
      setShowHouseholdForm(false);
      setHouseholdForm({});
      setEditingHouseholdId(null);
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to save household');
    }
  };

  const filteredGuests = useMemo(() => {
    let filtered = guests;

    if (searchTerm) {
      filtered = filtered.filter(
        (guest) =>
          guest.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.contact_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.relation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterSide) {
      filtered = filtered.filter((guest) => guest.side === filterSide);
    }

    if (filterRsvpStatus && filterEvent) {
      filtered = filtered.filter(
        (guest) => guest.rsvp_status?.[filterEvent] === filterRsvpStatus
      );
    } else if (filterRsvpStatus) {
      // If no specific event is selected, filter by overall status (if applicable)
      // For now, this assumes 'Confirmed' means confirmed for at least one event
      // This logic might need refinement based on how 'overall status' is defined
      filtered = filtered.filter((guest) =>
        Object.values(guest.rsvp_status || {}).some(
          (status) => status === filterRsvpStatus
        )
      );
    }

    if (filterTag) {
      filtered = filtered.filter((guest) => guest.tags?.includes(filterTag));
    }

    return filtered;
  }, [guests, searchTerm, filterSide, filterRsvpStatus, filterEvent, filterTag]);

  // Group guests by household
  const guestsByHousehold = useMemo(() => {
    const grouped = households.map(household => ({
      household,
      guests: filteredGuests.filter(guest => guest.household_id === household.household_id)
    }));
    // Add guests without a household
    grouped.push({
      household: { household_id: 'no-household', wedding_id: user?.wedding_id || '', household_name: 'No Household' },
      guests: filteredGuests.filter(guest => !guest.household_id)
    });
    return grouped;
  }, [households, filteredGuests, user?.wedding_id]);

  // Summary statistics
  const totalInvited = guests.length;
  const attendingWedding = guests.filter(g => g.rsvp_status?.Wedding === 'Confirmed').length;
  const attendingReception = guests.filter(g => g.rsvp_status?.Reception === 'Confirmed').length;

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-8 animate-fadein">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Guest List</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your wedding guests, households, and track RSVPs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setShowHouseholdForm(true); setHouseholdForm({}); setEditingHouseholdId(null); }}>
            + Add Household
          </Button>
          <Button onClick={() => { setShowGuestForm(true); setGuestForm({}); setEditingGuestId(null); }}>
            + Add Guest
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Invited</p>
          <p className="text-2xl font-bold text-blue-700">{totalInvited}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Attending Wedding</p>
          <p className="text-2xl font-bold text-green-700">{attendingWedding}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Attending Reception</p>
          <p className="text-2xl font-bold text-purple-700">{attendingReception}</p>
        </div>
      </div>

      {/* Filtering Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <Input
          placeholder="Search by Name, Contact, Relation, Tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="col-span-full sm:col-span-2 lg:col-span-2"
        />
        <Select value={filterSide} onValueChange={setFilterSide}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Side" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sides</SelectItem>
            <SelectItem value="Bride">Bride</SelectItem>
            <SelectItem value="Groom">Groom</SelectItem>
            <SelectItem value="Both">Both</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterEvent} onValueChange={setFilterEvent}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Events</SelectItem>
            {WEDDING_EVENTS.map((event) => (
              <SelectItem key={event} value={event}>
                {event}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRsvpStatus} onValueChange={setFilterRsvpStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by RSVP Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Invited">Invited</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Declined">Declined</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Filter by Tag (e.g., VVIP)"
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
        />
      </div>

      {/* Guest and Household List */}
      <div className="overflow-x-auto mt-4">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : guests.length === 0 && households.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No guests or households added yet.</div>
        ) : (
          guestsByHousehold.map(({ household, guests: householdGuests }) => (
            <div key={household.household_id} className="mb-6 border rounded-lg shadow-sm">
              <div className="flex items-center justify-between bg-gray-50 p-3 border-b rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-800">
                  {household.household_name}
                  {household.household_id !== 'no-household' && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({householdGuests.length} {householdGuests.length === 1 ? 'guest' : 'guests'})
                    </span>
                  )}
                </h3>
                {household.household_id !== 'no-household' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleHouseholdEdit(household)}>
                      Edit Household
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleHouseholdDelete(household.household_id)}>
                      Delete Household
                    </Button>
                  </div>
                )}
              </div>
              {householdGuests.length > 0 ? (
                <table className="min-w-full table-auto border-separate border-spacing-y-2 p-3">
                  <thead>
                    <tr className="bg-white">
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Contact</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Relation</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Side</th>
                      {WEDDING_EVENTS.map((event) => (
                        <th key={event} className="px-4 py-2 text-left font-semibold text-gray-700">
                          {event} RSVP
                        </th>
                      ))}
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Dietary</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Tags</th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {householdGuests.map((guest) => (
                      <tr key={guest.guest_id} className="bg-white hover:bg-blue-50 transition rounded-xl shadow-sm">
                        <td className="px-4 py-2 font-semibold text-gray-800">{guest.guest_name}</td>
                        <td className="px-4 py-2 text-gray-700">{guest.contact_info}</td>
                        <td className="px-4 py-2 text-gray-700">{guest.relation}</td>
                        <td className="px-4 py-2 text-gray-700">{guest.side}</td>
                        {WEDDING_EVENTS.map((event) => (
                          <td key={event} className="px-4 py-2">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold text-white ${
                                STATUS_COLORS[guest.rsvp_status?.[event] || 'Pending'] || 'bg-gray-400'
                              }`}
                            >
                              {guest.rsvp_status?.[event] || 'Pending'}
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-2 text-gray-700">{guest.dietary_requirements}</td>
                        <td className="px-4 py-2 text-gray-700">
                          {guest.tags && guest.tags.length > 0 ? guest.tags.join(', ') : '-'}
                        </td>
                        <td className="px-4 py-2 flex gap-2 justify-center">
                          <Button variant="outline" size="sm" onClick={() => handleGuestEdit(guest)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleGuestDelete(guest.guest_id)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                household.household_id !== 'no-household' && (
                  <p className="p-3 text-gray-500">No guests in this household yet.</p>
                )
              )}
            </div>
          ))
        )}
      </div>

      {/* Guest Form Modal */}
      <Dialog open={showGuestForm} onOpenChange={setShowGuestForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingGuestId ? 'Edit Guest' : 'Add New Guest'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGuestFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guest_name" className="text-right">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guest_name"
                value={guestForm.guest_name || ''}
                onChange={(e) => setGuestForm((f) => ({ ...f, guest_name: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="household_id" className="text-right">
                Household
              </Label>
              <Select
                value={guestForm.household_id || ''}
                onValueChange={(value) => setGuestForm((f) => ({ ...f, household_id: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a household" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Household</SelectItem>
                  {households.map((h) => (
                    <SelectItem key={h.household_id} value={h.household_id}>
                      {h.household_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_info" className="text-right">
                Contact Info
              </Label>
              <Input
                id="contact_info"
                value={guestForm.contact_info || ''}
                onChange={(e) => setGuestForm((f) => ({ ...f, contact_info: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="relation" className="text-right">
                Relation
              </Label>
              <Input
                id="relation"
                value={guestForm.relation || ''}
                onChange={(e) => setGuestForm((f) => ({ ...f, relation: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="side" className="text-right">
                Side
              </Label>
              <Select
                value={guestForm.side || ''}
                onValueChange={(value) => setGuestForm((f) => ({ ...f, side: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select side</SelectItem>
                  <SelectItem value="Groom">Groom</SelectItem>
                  <SelectItem value="Bride">Bride</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dietary_requirements" className="text-right">
                Dietary
              </Label>
              <Input
                id="dietary_requirements"
                value={guestForm.dietary_requirements || ''}
                onChange={(e) => setGuestForm((f) => ({ ...f, dietary_requirements: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags (comma-separated)
              </Label>
              <Input
                id="tags"
                value={guestForm.tags?.join(', ') || ''}
                onChange={(e) =>
                  setGuestForm((f) => ({ ...f, tags: e.target.value.split(',').map((tag) => tag.trim()) }))
                }
                className="col-span-3"
              />
            </div>

            {/* Event-specific RSVPs */}
            <div className="col-span-full">
              <h4 className="mb-2 text-lg font-semibold">Event RSVPs</h4>
              {WEDDING_EVENTS.map((event) => (
                <div key={event} className="grid grid-cols-4 items-center gap-4 mb-2">
                  <Label className="text-right">{event}</Label>
                  <Select
                    value={guestForm.rsvp_status?.[event] || 'Pending'}
                    onValueChange={(value) =>
                      setGuestForm((f) => ({
                        ...f,
                        rsvp_status: { ...f.rsvp_status, [event]: value },
                      }))
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Invited">Invited</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <Button type="submit" className="col-span-full mt-4">
              {editingGuestId ? 'Update Guest' : 'Add Guest'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Household Form Modal */}
      <Dialog open={showHouseholdForm} onOpenChange={setShowHouseholdForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingHouseholdId ? 'Edit Household' : 'Add New Household'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleHouseholdFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="household_name" className="text-right">
                Household Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="household_name"
                value={householdForm.household_name || ''}
                onChange={(e) => setHouseholdForm((f) => ({ ...f, household_name: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={householdForm.address || ''}
                onChange={(e) => setHouseholdForm((f) => ({ ...f, address: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_info" className="text-right">
                Contact Info
              </Label>
              <Input
                id="contact_info"
                value={householdForm.contact_info || ''}
                onChange={(e) => setHouseholdForm((f) => ({ ...f, contact_info: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <Button type="submit" className="col-span-full mt-4">
              {editingHouseholdId ? 'Update Household' : 'Add Household'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tailwind utility for input
// (You may want to move this to your global CSS)
// .input { @apply border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50; transition: box-shadow 0.2s; }
