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
import { getUserVendors, SupabaseVendorRaw, Vendor } from "@/services/api/vendorApi";
import { useAuth } from '@/context/AuthContext';
import VendorsGrid, { DisplayVendor } from "@/components/dashboard/MyWeddingTeamDashboard";

const VendorsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("marketplace"); // Default to marketplace
  const [vendors, setVendors] = useState<DisplayVendor[]>([]); // User's shortlisted/hired vendors
  const [marketplaceVendors, setMarketplaceVendors] = useState<DisplayVendor[]>([]); // All vendors for marketplace
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.wedding_id) return;
    setLoading(true);
    getUserVendors(user.wedding_id, user.internal_user_id, user.role)
      .then((data) => {
        const allowedStatuses = ["booked", "recommended", "contacted", "pending", "completed", "user_added"] as const;
        type VendorStatus = typeof allowedStatuses[number];
        const mapped = data.map((item) => {
          const vendor: SupabaseVendorRaw | null = item.linkedVendor as SupabaseVendorRaw | null;
          let status: VendorStatus = "pending";
          if (allowedStatuses.includes(item.status)) {
            status = item.status;
          }
          return {
            id: item.id,
            wedding_id: item.wedding_id,
            name: item.name || vendor?.vendor_name || '',
            category: item.category || vendor?.vendor_category || '',
            location: vendor?.address?.city && vendor?.address?.state ? `${vendor.address.city}, ${vendor.address.state}` : vendor?.address?.fullAddress || '',
            rating: vendor?.rating || 0,
            contact: item.contactInfo || vendor?.phone_number || '',
            email: vendor?.contact_email || '',
            price: vendor?.pricing_range ? `${vendor.pricing_range.min ? '₹' + vendor.pricing_range.min.toLocaleString() : ''}${vendor.pricing_range.max ? '-₹' + vendor.pricing_range.max.toLocaleString() : ''} ${vendor.pricing_range.unit || ''}` : '',
            bookingDate: item.bookedDate || '',
            status,
            notes: item.notes || '',
            owner_party: item.owner_party, // Add owner_party here
            linkedVendor: item.linkedVendor,
            paymentStatus: '₹50,000 / ₹1,20,000 Paid', // DUMMY DATA
            contractLink: 'https://example.com/contract.pdf' // DUMMY DATA
          };
        });
        setVendors(mapped);
        setError(null);
      })
      .catch((e: unknown) => {
        setError((e as Error).message || 'Failed to load vendors');
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Fetch all vendors for 'Vendor Marketplace'
  useEffect(() => {
    if (activeTab === "marketplace" && marketplaceVendors.length === 0) {
      setLoading(true);
      import('@/services/api/vendorApi').then(({ getVendorRecommendations }) => {
        getVendorRecommendations('', '', undefined)
          .then((data: Vendor[]) => {
            const allowedStatuses = ["booked", "recommended", "contacted", "pending", "completed", "user_added"] as const;
            type VendorStatus = typeof allowedStatuses[number];
            const mapped = data.map((vendor) => {
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
                contact: vendor.phone_number || '',
                email: vendor.contact_email || '',
                price: vendor.pricing_range ? `${vendor.pricing_range.min ? '₹' + vendor.pricing_range.min.toLocaleString() : ''}${vendor.pricing_range.max ? '-₹' + vendor.pricing_range.max.toLocaleString() : ''} ${vendor.pricing_range.unit || ''}` : '',
                bookingDate: '',
                status,
                notes: vendor.description || '',
                paymentStatus: '₹50,000 / ₹1,20,000 Paid', // DUMMY DATA
                contractLink: 'https://example.com/contract.pdf' // DUMMY DATA
              };
            });
            setMarketplaceVendors(mapped);
            setError(null);
          })
          .catch((e: unknown) => {
            setError((e as Error).message || 'Failed to load marketplace vendors');
          })
          .finally(() => setLoading(false));
      });
    }
  }, [activeTab, marketplaceVendors.length]);

  const filteredUserVendors = vendors.filter(vendor => {
    // Filter for "My Wedding Team" tab specific statuses if needed, or by default show all user vendors
    if (activeTab === "my-wedding-team" && searchTerm) {
      return (
        vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true; // Show all user vendors if no search term or not in my-wedding-team tab
  });

  const filteredMarketplaceVendors = marketplaceVendors.filter(vendor => {
    return (
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // This part of the filter logic applies only to the 'My Wedding Team' tab
  const applyUserRoleFilter = (vendor: DisplayVendor) => {
    if (activeTab !== "my-wedding-team") return true; // Only apply this filter in 'My Wedding Team' tab

    // Filter by user role and owner_party
    if (user?.role) {
      const userRole = user.role.toLowerCase();

      // Planners can see all vendors
      if (userRole === 'planner') {
        return true;
      }

      // For non-planner roles, apply owner_party filtering
      const ownerParty = vendor.owner_party?.toLowerCase();
      
      // Always show 'shared' or 'couple' vendors to any user associated with the wedding
      if (ownerParty === 'shared' || ownerParty === 'couple') {
        return true;
      }

      // Show 'bride_side' vendors to users with 'bride' in their role (e.g., 'bride', 'bride_family')
      if (userRole.includes('bride') && ownerParty === 'bride') {
        return true;
      }
      // Show 'groom_side' vendors to users with 'groom' in their role (e.g., 'groom', 'groom_family')
      if (userRole.includes('groom') && ownerParty === 'groom') {
        return true;
      }
      
      // If none of the above conditions are met, hide the vendor for this user
      return false;
    }

    // Default to true if no role or owner_party is defined, or if not in 'My Wedding Team' tab
    return true;
  };

  const vendorsToDisplay = activeTab === "marketplace" ? filteredMarketplaceVendors : filteredUserVendors.filter(applyUserRoleFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage and track all your wedding vendors in one place.
          </p>
        </div>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex gap-2">
            <TabsTrigger value="marketplace">Vendor Marketplace</TabsTrigger>
            <TabsTrigger value="my-wedding-team">My Wedding Team</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
       
    <VendorsGrid
       loading={loading}
       error={error}
       activeTab={activeTab}
       vendorsToDisplay={vendorsToDisplay}
       user={user as { wedding_id: string, internal_user_id: string, role: string }}
       setVendors={setVendors}
     />
    </div>
  );
};



export default VendorsPage;
