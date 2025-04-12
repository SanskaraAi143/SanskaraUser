
import React, { useState, type ChangeEvent } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  Star, 
  Plus, 
  Search 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Vendor {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  contact: string;
  email: string;
  price: string;
  bookingDate?: string;
  status: 'contacted' | 'booked' | 'pending' | 'confirmed';
  notes?: string;
}

const VendorsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Sample data - in a real application, this would come from Firebase or an API
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: "1",
      name: "Royal Palace",
      category: "Venue",
      location: "Mumbai, Maharashtra",
      rating: 4.8,
      contact: "+91 9876543210",
      email: "info@royalpalace.com",
      price: "₹150,000-₹300,000",
      bookingDate: "2025-07-15",
      status: "confirmed",
      notes: "Deposit paid. Need to confirm menu by May."
    },
    {
      id: "2",
      name: "Divine Caterers",
      category: "Catering",
      location: "Jaipur, Rajasthan",
      rating: 4.5,
      contact: "+91 9876543211",
      email: "bookings@divinecaterers.com",
      price: "₹1,500 per plate",
      status: "contacted",
      notes: "Waiting for quote on vegetarian options."
    },
    {
      id: "3",
      name: "Lens Story",
      category: "Photography",
      location: "Delhi, Delhi",
      rating: 4.7,
      contact: "+91 9876543212",
      email: "capture@lensstory.com",
      price: "₹65,000",
      status: "pending",
      notes: ""
    },
    {
      id: "4",
      name: "Flower Dreams",
      category: "Decoration",
      location: "Bengaluru, Karnataka",
      rating: 4.6,
      contact: "+91 9876543213",
      email: "info@flowerdreams.com",
      price: "₹85,000",
      status: "booked",
      notes: "Confirmed red and gold theme."
    }
  ]);

  const filteredVendors = vendors.filter(vendor => {
    if (activeTab !== "all" && vendor.status !== activeTab) {
      return false;
    }
    
    return vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
           vendor.location.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const handleAddVendor = () => {
    toast({
      title: "Feature coming soon",
      description: "Vendor management will be available in the next update",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage and track all your wedding vendors in one place.
          </p>
        </div>
        <Button onClick={handleAddVendor}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full sm:w-64 lg:w-72">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-8"
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 sm:w-fit">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="contacted">Contacted</TabsTrigger>
            <TabsTrigger value="booked">Booked</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{vendor.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Badge variant="outline" className="mr-2">{vendor.category}</Badge>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-wedding-red text-wedding-red mr-1" />
                        <span>{vendor.rating}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge 
                    className={`
                      ${vendor.status === 'confirmed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                      ${vendor.status === 'booked' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                      ${vendor.status === 'contacted' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                      ${vendor.status === 'pending' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' : ''}
                    `}
                  >
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                    <span className="text-sm">{vendor.location}</span>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                    <span className="text-sm">{vendor.contact}</span>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                    <span className="text-sm">{vendor.email}</span>
                  </div>
                  <div className="flex items-start">
                    <ShoppingCart className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                    <span className="text-sm">{vendor.price}</span>
                  </div>
                  {vendor.bookingDate && (
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                      <span className="text-sm">Booked for: {new Date(vendor.bookingDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {vendor.notes && (
                    <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                      <p className="italic">{vendor.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm">
                  Contact
                </Button>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center h-40 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground">No vendors found</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchTerm("");
                  setActiveTab("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorsPage;
