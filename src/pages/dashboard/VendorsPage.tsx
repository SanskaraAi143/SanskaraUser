import React, { useState, useEffect, type ChangeEvent } from "react";
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
import { getUserVendors } from "@/services/api/vendorApi";
import { useAuth } from '@/context/AuthContext';

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
  status: 'recommended' | 'contacted' | 'booked' | 'pending' | 'completed';
  notes?: string;
  linkedVendor?: any; // Allow linkedVendor for type checks
}

const VendorsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [allVendors, setAllVendors] = useState<Vendor[]>([]); // For global vendors
  const [showAllVendors, setShowAllVendors] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getUserVendors(user.id)
      .then((data) => {
        const allowedStatuses = ["booked", "recommended", "contacted", "pending", "completed"] as const;
        type VendorStatus = typeof allowedStatuses[number];
        const mapped = data.map((item: any) => {
          const vendor = item.linkedVendor || {};
          let status: VendorStatus = "pending";
          if (allowedStatuses.includes(item.status)) {
            status = item.status;
          }
          return {
            id: item.id,
            name: item.name || vendor.vendor_name || '',
            category: item.category || vendor.vendor_category || '',
            location: vendor.address?.city && vendor.address?.state ? `${vendor.address.city}, ${vendor.address.state}` : vendor.address?.fullAddress || '',
            rating: vendor.rating || 0,
            contact: item.contactInfo || vendor.phone_number || '',
            email: vendor.contact_email || '',
            price: vendor.pricing_range ? `${vendor.pricing_range.min ? '₹' + vendor.pricing_range.min.toLocaleString() : ''}${vendor.pricing_range.max ? '-₹' + vendor.pricing_range.max.toLocaleString() : ''} ${vendor.pricing_range.unit || ''}` : '',
            bookingDate: item.bookedDate || '',
            status,
            notes: item.notes || '',
            linkedVendor: item.linkedVendor,
          };
        });
        setVendors(mapped);
        setError(null);
      })
      .catch((e) => {
        setError(e.message || 'Failed to load vendors');
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Fetch all vendors for 'View All Vendors' mode
  useEffect(() => {
    if (showAllVendors && allVendors.length === 0) {
      setLoading(true);
      import('@/services/api/vendorApi').then(({ getVendorRecommendations }) => {
        getVendorRecommendations('', '', undefined)
          .then((data: any[]) => {
            const allowedStatuses = ["booked", "recommended", "contacted", "pending", "completed"] as const;
            type VendorStatus = typeof allowedStatuses[number];
            const mapped = data.map((vendor: any) => {
              let status: VendorStatus = "pending";
              if (allowedStatuses.includes(vendor.status)) {
                status = vendor.status;
              }
              return {
                id: vendor.id || vendor.vendor_id || '',
                name: vendor.name || vendor.vendor_name || '',
                category: vendor.category || vendor.vendor_category || '',
                location: vendor.address?.city && vendor.address?.state ? `${vendor.address.city}, ${vendor.address.state}` : vendor.address?.fullAddress || '',
                rating: vendor.rating || 0,
                contact: vendor.phoneNumber || vendor.phone_number || '',
                email: vendor.contactEmail || vendor.contact_email || '',
                price: vendor.pricingRange ? `${vendor.pricingRange.min ? '₹' + vendor.pricingRange.min.toLocaleString() : ''}${vendor.pricingRange.max ? '-₹' + vendor.pricingRange.max.toLocaleString() : ''} ${vendor.pricingRange.unit || ''}` : '',
                bookingDate: '',
                status,
                notes: vendor.description || '',
              };
            });
            setAllVendors(mapped);
            setError(null);
          })
          .catch((e: any) => {
            setError(e.message || 'Failed to load all vendors');
          })
          .finally(() => setLoading(false));
      });
    }
  }, [showAllVendors, allVendors.length]);

  const filteredVendors = vendors.filter(vendor => {
    if (activeTab !== "all" && vendor.status !== activeTab) {
      return false;
    }
    return (
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
        <button
          className="px-4 py-2 rounded bg-wedding-red text-white hover:bg-wedding-dark-red transition disabled:opacity-60"
          onClick={() => setShowAllVendors((v) => !v)}
        >
          {showAllVendors ? 'View My Vendors' : 'View All Vendors'}
        </button>

      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full sm:w-64 lg:w-72">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        {!showAllVendors && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex gap-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="contacted">Contacted</TabsTrigger>
              <TabsTrigger value="booked">Booked</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-40 bg-gray-50 rounded-lg">
            <span>Loading...</span>
          </div>
        ) : error ? (
          <div className="col-span-full flex justify-center items-center h-40 bg-red-50 rounded-lg">
            <span className="text-red-600">{error}</span>
          </div>
        ) : (showAllVendors ? allVendors : filteredVendors).length > 0 ? (
          (showAllVendors ? allVendors : filteredVendors).filter(vendor => {
            return (
              vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              vendor.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              vendor.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }).map((vendor) => (
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
                  {!showAllVendors && (
                    <Badge
                      className={`
                        ${vendor.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                        ${vendor.status === 'booked' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                        ${vendor.status === 'contacted' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                        ${vendor.status === 'pending' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' : ''}
                      `}
                    >
                      {vendor.status === 'completed' ? 'Completed' : vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </Badge>
                  )}
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
              {showAllVendors ? (
                <CardFooter className="flex justify-end pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    disabled={vendors.some((v) => v.linkedVendor?.vendor_id === vendor.id || v.id === vendor.id)}
                    onClick={async () => {
                      try {
                        // Dynamically import addVendorToUser and fallback if not found
                        const api = await import('@/services/api/vendorApi');
                        if (typeof api.addVendorToUser === 'function') {
                          await api.addVendorToUser(user.id, vendor);
                          window.location.reload();
                        } else {
                          throw new Error('addVendorToUser not found');
                        }
                      } catch (err) {
                        if (typeof toast === 'function') toast({ title: 'Error', description: 'Could not add vendor' });
                      }
                    }}
                  >
                    {vendors.some((v) => v.linkedVendor?.vendor_id === vendor.id || v.id === vendor.id)
                      ? 'Added'
                      : 'Add to My Vendors'}
                  </Button>
                </CardFooter>
              ) : (
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="outline" size="sm">
                    Contact
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      try {
                        const api = await import('@/services/api/vendorApi');
                        await api.removeVendorFromUser(vendor.id); // vendor.id is user_vendor_id for user vendors
                        if (typeof toast === 'function') toast({ title: 'Removed', description: 'Vendor removed from your list.' });
                        // Instantly remove from UI
                        setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
                      } catch (err) {
                        if (typeof toast === 'function') toast({ title: 'Error', description: 'Could not remove vendor' });
                        setLoading(false);
                      }
                    }}
                  >
                    Remove
                  </Button>
                </CardFooter>
              )}
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
