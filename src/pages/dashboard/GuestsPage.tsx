
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Home, 
  Check, 
  X, 
  HelpCircle, 
  Filter 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  side: 'bride' | 'groom' | 'both';
  rsvp: 'yes' | 'no' | 'pending';
  group: string;
  dietaryRequirements?: string;
  plusOne: boolean;
  invited: boolean;
}

const GuestsPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  
  // Sample data - in a real application, this would come from Firebase or an API
  const [guests, setGuests] = useState<Guest[]>([
    {
      id: "1",
      name: "Raj and Priya Sharma",
      email: "raj.sharma@example.com",
      phone: "+91 9876543210",
      address: "123 Park Street, Mumbai",
      side: 'bride',
      rsvp: 'yes',
      group: 'Family',
      dietaryRequirements: 'Vegetarian',
      plusOne: true,
      invited: true
    },
    {
      id: "2",
      name: "Amit Singh",
      email: "amit.singh@example.com",
      phone: "+91 9876543211",
      address: "456 Lake View, Delhi",
      side: 'groom',
      rsvp: 'yes',
      group: 'Friends',
      plusOne: false,
      invited: true
    },
    {
      id: "3",
      name: "Sneha Patel",
      email: "sneha.patel@example.com",
      phone: "+91 9876543212",
      address: "789 Green Avenue, Ahmedabad",
      side: 'both',
      rsvp: 'pending',
      group: 'Colleagues',
      dietaryRequirements: 'No dairy',
      plusOne: true,
      invited: true
    },
    {
      id: "4",
      name: "Vikas Reddy",
      email: "vikas.reddy@example.com",
      phone: "+91 9876543213",
      address: "101 Hillside, Hyderabad",
      side: 'groom',
      rsvp: 'no',
      group: 'Extended Family',
      plusOne: false,
      invited: true
    }
  ]);

  const guestStats = {
    total: guests.length,
    attending: guests.filter(g => g.rsvp === 'yes').length,
    pending: guests.filter(g => g.rsvp === 'pending').length,
    declined: guests.filter(g => g.rsvp === 'no').length,
    brideSide: guests.filter(g => g.side === 'bride').length,
    groomSide: guests.filter(g => g.side === 'groom').length,
  };

  const filteredGuests = guests.filter(guest => {
    // Filter by tab first
    if (activeTab === 'attending' && guest.rsvp !== 'yes') return false;
    if (activeTab === 'pending' && guest.rsvp !== 'pending') return false;
    if (activeTab === 'declined' && guest.rsvp !== 'no') return false;
    if (activeTab === 'bride' && guest.side !== 'bride') return false;
    if (activeTab === 'groom' && guest.side !== 'groom') return false;
    
    // Then filter by search
    return guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           guest.group.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const handleAddGuest = () => {
    toast({
      title: "Feature coming soon",
      description: "Guest management will be available in the next update",
    });
    setAddGuestOpen(false);
  };

  const getRsvpBadge = (rsvp: Guest['rsvp']) => {
    switch(rsvp) {
      case 'yes':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Attending</Badge>;
      case 'no':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Declined</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  const getRsvpIcon = (rsvp: Guest['rsvp']) => {
    switch(rsvp) {
      case 'yes':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'no':
        return <X className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <HelpCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guest List</h1>
          <p className="text-muted-foreground">
            Manage wedding invitations and track RSVPs.
          </p>
        </div>
        <Button onClick={() => setAddGuestOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Guest
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{guestStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attending</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold text-green-600">{guestStats.attending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold text-yellow-600">{guestStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Declined</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold text-red-600">{guestStats.declined}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bride's Side</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold text-wedding-red">{guestStats.brideSide}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Groom's Side</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold text-wedding-maroon">{guestStats.groomSide}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full sm:w-64 lg:w-72">
          <Input
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 sm:w-fit">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="attending">Attending</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="declined">Declined</TabsTrigger>
            <TabsTrigger value="bride">Bride</TabsTrigger>
            <TabsTrigger value="groom">Groom</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter Guests</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Family</DropdownMenuItem>
            <DropdownMenuItem>Friends</DropdownMenuItem>
            <DropdownMenuItem>Colleagues</DropdownMenuItem>
            <DropdownMenuItem>Extended Family</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>With Plus Ones</DropdownMenuItem>
            <DropdownMenuItem>Dietary Requirements</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Guest List */}
      <div className="border rounded-md">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium text-muted-foreground">Guest</th>
              <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Contact</th>
              <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Details</th>
              <th className="text-left p-4 font-medium text-muted-foreground">RSVP</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.length > 0 ? (
              filteredGuests.map((guest) => (
                <tr key={guest.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium">{guest.name}</div>
                    <div className="text-sm text-muted-foreground">{guest.group}</div>
                    <div className="md:hidden mt-1 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {guest.email}
                      </div>
                      <div className="flex items-center mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        {guest.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {guest.email}
                    </div>
                    <div className="flex items-center text-sm mt-1">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {guest.phone}
                    </div>
                    <div className="hidden lg:flex items-center text-sm mt-1">
                      <Home className="h-4 w-4 mr-2 text-gray-500" />
                      {guest.address}
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="text-sm">
                      <Badge className={`
                        ${guest.side === 'bride' ? 'bg-wedding-red/10 text-wedding-red' : ''} 
                        ${guest.side === 'groom' ? 'bg-wedding-maroon/10 text-wedding-maroon' : ''}
                        ${guest.side === 'both' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {guest.side === 'bride' ? "Bride's Side" : 
                         guest.side === 'groom' ? "Groom's Side" : "Both Sides"}
                      </Badge>
                    </div>
                    {guest.dietaryRequirements && (
                      <div className="text-sm mt-1">
                        <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                          {guest.dietaryRequirements}
                        </span>
                      </div>
                    )}
                    {guest.plusOne && (
                      <div className="text-sm mt-1">
                        <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5">
                          +1 Allowed
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      {getRsvpIcon(guest.rsvp)}
                      <span className="ml-2">{getRsvpBadge(guest.rsvp)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                        <DropdownMenuItem>Update RSVP</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <div className="text-muted-foreground">No guests found</div>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveTab("all");
                    }}
                  >
                    Clear filters
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Guest Dialog */}
      <Dialog open={addGuestOpen} onOpenChange={setAddGuestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
            <DialogDescription>
              Add a new guest or family to your wedding guest list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-center text-muted-foreground">
              Guest management feature coming soon!
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddGuestOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGuest}>
              Add Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuestsPage;
