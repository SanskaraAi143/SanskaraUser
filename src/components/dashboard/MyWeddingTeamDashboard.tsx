import React, { useState } from "react";
import {
  Card,
  CardContent,
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { SupabaseVendorRaw, removeVendorFromUser, addVendorToUser } from "@/services/api/vendorApi";
import VendorChat from "@/components/chat/VendorChat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


export interface DisplayVendor {
  id: string;
  wedding_id?: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  contact: string;
  email: string;
  price: string;
  bookingDate?: string;
  status: 'recommended' | 'contacted' | 'booked' | 'pending' | 'completed' | 'user_added';
  notes?: string;
  owner_party?: string;
  paymentStatus?: string;
  contractLink?: string;
  linkedVendor?: SupabaseVendorRaw | null;
  vendor_id?: string;
}

interface VendorCardProps {
  vendor: DisplayVendor;
  activeTab: string;
  user: { wedding_id: string, internal_user_id: string, role: string };
  setVendors: React.Dispatch<React.SetStateAction<DisplayVendor[]>>;
  onChat: (vendor: DisplayVendor) => void;
}

const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  activeTab,
  user,
  setVendors,
  onChat,
}) => {
  const isMyWeddingTeam = activeTab === "my-wedding-team";

  const handleAddVendor = async () => {
    try {
      await addVendorToUser(
        user.wedding_id,
        vendor,
        user.role || 'shared'
      );
      setVendors((prev) => [...prev, { ...vendor, status: 'user_added' }]);
      toast({ title: 'Added', description: 'Vendor added to your wedding team.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not add vendor' });
    }
  };

  const handleRemoveVendor = async () => {
    try {
      await removeVendorFromUser(vendor.id);
      toast({ title: 'Removed', description: 'Vendor removed from your list.' });
      setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
    } catch (err) {
      toast({ title: 'Error', description: 'Could not remove vendor' });
    }
  };

  return (
    <Card key={vendor.id} className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{vendor.name}</CardTitle>
            <div className="flex items-center mt-1">
              <Badge variant="outline" className="mr-2">{vendor.category}</Badge>
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-wedding-red text-wedding-red mr-1" />
                <span>{vendor.rating || 0}</span>
              </div>
            </div>
          </div>
          {isMyWeddingTeam && (
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
              <span className="italic">{vendor.notes}</span>
            </div>
          )}
          {isMyWeddingTeam && (
            <>
              <div className="flex items-start">
                <Phone className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <span className="text-sm">Contact Person: {vendor.contact || 'N/A'}</span>
              </div>
              <div className="flex items-start">
                <ShoppingCart className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <span className="text-sm">Payment: {vendor.paymentStatus || 'Not specified'}</span>
              </div>
              {vendor.contractLink && (
                <div className="flex items-start">
                  <Button asChild variant="link" size="sm" className="p-0 h-auto">
                    <a href={vendor.contractLink} target="_blank" rel="noopener noreferrer">View Contract</a>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
      {isMyWeddingTeam ? (
        <CardFooter className="flex justify-between pt-2">
          <Button variant="default" size="sm" onClick={() => onChat(vendor)}>
            Chat
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemoveVendor}
          >
            Remove
          </Button>
        </CardFooter>
      ) : (
        <CardFooter className="flex justify-end pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleAddVendor}
          >
            Add to My Vendors
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

interface VendorsGridProps {
  loading: boolean;
  error: string | null;
  activeTab: string;
  vendorsToDisplay: DisplayVendor[];
  user: { wedding_id: string, internal_user_id: string, role: string };
  setVendors: React.Dispatch<React.SetStateAction<DisplayVendor[]>>;
}

const VendorsGrid: React.FC<VendorsGridProps> = ({
  loading,
  error,
  activeTab,
  vendorsToDisplay,
  user,
  setVendors,
}) => {
  const [chatVendor, setChatVendor] = useState<DisplayVendor | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full flex justify-center items-center h-40 bg-gray-50 rounded-lg">
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full flex justify-center items-center h-40 bg-red-50 rounded-lg">
          <span className="text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  if (vendorsToDisplay.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full flex justify-center items-center h-40 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-muted-foreground">No vendors found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendorsToDisplay.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            activeTab={activeTab}
            user={user}
            setVendors={setVendors}
            onChat={setChatVendor}
          />
        ))}
      </div>

      <Dialog open={!!chatVendor} onOpenChange={(isOpen) => !isOpen && setChatVendor(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chat with {chatVendor?.name}</DialogTitle>
          </DialogHeader>
          {chatVendor && (
            <VendorChat selectedTopic={`Regarding our wedding on ${new Date().toLocaleDateString()}`} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VendorsGrid;