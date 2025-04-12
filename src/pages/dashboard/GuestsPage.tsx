
import React, { useState, type ChangeEvent } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Filter, 
  MoreVertical, 
  Plus, 
  Search, 
  X 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  relation: string;
  side: 'bride' | 'groom' | 'both';
  status: 'invited' | 'confirmed' | 'declined' | 'pending';
  diet?: string;
  plusOne: boolean;
  notes?: string;
}

const GuestsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  
  // Sample data
  const [guests, setGuests] = useState<Guest[]>([
    {
      id: "1",
      name: "Raj Sharma",
      email: "raj.sharma@example.com",
      phone: "+91 9876543210",
      relation: "Brother",
      side: "groom",
      status: "confirmed",
      diet: "Vegetarian",
      plusOne: true,
      notes: "Allergic to nuts"
    },
    {
      id: "2",
      name: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "+91 9876543211",
      relation: "Friend",
      side: "bride",
      status: "invited",
      diet: "Vegan",
      plusOne: false
    },
    {
      id: "3",
      name: "Amit and Sneha Desai",
      email: "amit.desai@example.com",
      phone: "+91 9876543212",
      relation: "Cousins",
      side: "groom",
      status: "declined",
      diet: "No preference",
      plusOne: false,
      notes: "Cannot attend due to prior commitment"
    },
    {
      id: "4",
      name: "Vikram Singh",
      email: "vikram.singh@example.com",
      phone: "+91 9876543213",
      relation: "Colleague",
      side: "both",
      status: "pending",
      plusOne: true
    },
    {
      id: "5",
      name: "Anjali Mehta",
      email: "anjali.mehta@example.com",
      phone: "+91 9876543214",
      relation: "Aunt",
      side: "bride",
      status: "confirmed",
      diet: "Vegetarian",
      plusOne: false
    }
  ]);

  const filteredGuests = guests.filter(guest => {
    // Filter by search term
    const matchesSearch = 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.relation.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status or side
    if (filter) {
      if (filter === 'bride' || filter === 'groom' || filter === 'both') {
        return matchesSearch && guest.side === filter;
      } else {
        return matchesSearch && guest.status === filter;
      }
    }
    
    return matchesSearch;
  });

  const guestStats = {
    total: guests.length,
    confirmed: guests.filter(g => g.status === 'confirmed').length,
    declined: guests.filter(g => g.status === 'declined').length,
    pending: guests.filter(g => g.status === 'pending' || g.status === 'invited').length,
    plusOnes: guests.filter(g => g.plusOne).length
  };

  const handleAddGuest = () => {
    toast({
      title: "Feature coming soon",
      description: "Guest management will be available in the next update",
    });
  };

  const handleStatusChange = (guestId: string, newStatus: 'invited' | 'confirmed' | 'declined' | 'pending') => {
    setGuests(guests.map(guest => 
      guest.id === guestId ? { ...guest, status: newStatus } : guest
    ));
    
    toast({
      title: "Guest status updated",
      description: `Guest status has been changed to ${newStatus}`,
    });
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests(guests.filter(guest => guest.id !== guestId));
    
    toast({
      title: "Guest removed",
      description: "Guest has been removed from your list",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guest List</h1>
          <p className="text-muted-foreground">
            Manage your wedding guests and track RSVPs.
          </p>
        </div>
        <Button onClick={handleAddGuest}>
          <Plus className="mr-2 h-4 w-4" />
          Add Guest
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guestStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Including {guestStats.plusOnes} plus ones
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{guestStats.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((guestStats.confirmed / guestStats.total) * 100)}% of total guests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Declined</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{guestStats.declined}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((guestStats.declined / guestStats.total) * 100)}% of total guests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Awaiting Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{guestStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((guestStats.pending / guestStats.total) * 100)}% of total guests
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full sm:w-64 lg:w-72">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-8"
            />
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {filter ? `Filter: ${filter.charAt(0).toUpperCase() + filter.slice(1)}` : "Filter"}
              {filter && (
                <X 
                  className="h-4 w-4 hover:text-red-500" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilter(null);
                  }} 
                />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter('invited')}>Invited</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('confirmed')}>Confirmed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('declined')}>Declined</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('pending')}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('bride')}>Bride's Side</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('groom')}>Groom's Side</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('both')}>Both Sides</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden lg:table-cell">Relation</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Diet</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.length > 0 ? (
                filteredGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">
                      {guest.name}
                      {guest.plusOne && (
                        <Badge variant="outline" className="ml-2">
                          +1
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>{guest.email}</div>
                      <div className="text-muted-foreground">{guest.phone}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{guest.relation}</TableCell>
                    <TableCell>
                      <Badge
                        className={`
                          ${guest.side === 'bride' ? 'bg-pink-100 text-pink-800 hover:bg-pink-100' : ''}
                          ${guest.side === 'groom' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                          ${guest.side === 'both' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' : ''}
                        `}
                      >
                        {guest.side.charAt(0).toUpperCase() + guest.side.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`
                          ${guest.status === 'confirmed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                          ${guest.status === 'invited' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                          ${guest.status === 'declined' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                          ${guest.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                        `}
                      >
                        {guest.status.charAt(0).toUpperCase() + guest.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {guest.diet || "Not specified"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(guest.id, 'invited')}>
                            Mark as Invited
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(guest.id, 'confirmed')}>
                            Mark as Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(guest.id, 'declined')}>
                            Mark as Declined
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(guest.id, 'pending')}>
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteGuest(guest.id)}>
                            Remove Guest
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mb-2 text-muted-foreground/50" />
                      <p>No guests found</p>
                      {(searchTerm || filter) && (
                        <Button
                          variant="link"
                          onClick={() => {
                            setSearchTerm("");
                            setFilter(null);
                          }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestsPage;
