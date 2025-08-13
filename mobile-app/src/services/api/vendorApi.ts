import { supabase } from '../supabase/config';
import { logError, ApiError } from '../../utils/errorLogger';
import { Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';


export interface Vendor {
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
  linkedVendor?: SupabaseVendorRaw | null; // Use specific type for better type checking
  // Add properties from SupabaseVendorRaw that are returned by getVendorRecommendations
  vendor_id?: string;
  vendor_name?: string;
  vendor_category?: string;
  contact_email?: string;
  phone_number?: string;
  website_url?: string;
  address?: {
    fullAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  pricing_range?: {
    min: number;
    max: number;
    currency: string;
    unit: string;
    details: string;
  };
  description?: string;
  portfolio_image_urls?: string[];
  is_active?: boolean;
}

export interface SupabaseVendorRaw {
  vendor_id: string;
  vendor_name: string;
  vendor_category: string;
  contact_email: string;
  phone_number: string;
  website_url: string;
  address: {
    fullAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  pricing_range: {
    min: number;
    max: number;
    currency: string;
    unit: string;
    details: string;
  };
  rating: number;
  description: string;
  portfolio_image_urls: string[];
  is_active: boolean;
  status: string; // This is the status from the vendors table, not user_shortlisted_vendors
}

export type UserShortlistedVendorStatus = 'recommended' | 'contacted' | 'booked' | 'pending' | 'completed' | 'user_added';

export interface UserShortlistedVendorRaw {
  user_vendor_id: string;
  vendor_name: string;
  vendor_category: string;
  contact_info: string;
  status: string;
  booked_date: string;
  notes: string;
  linked_vendor_id: string | null;
  estimated_cost: number | null;
  vendors: SupabaseVendorRaw | null; // This is the joined vendor data
}

export interface UserShortlistedVendorItem {
  id: string;
  wedding_id: string;
  name: string;
  category: string;
  contactInfo: string;
  status: UserShortlistedVendorStatus;
  bookedDate?: string;
  notes?: string;
  linkedVendor: SupabaseVendorRaw | null;
  estimatedCost?: number | null;
  owner_party?: string; // Add owner_party
}

export const getVendorRecommendations = async (
  category: string,
  location: string,
  budget?: number
): Promise<Vendor[]> => {
  try {
    let query = supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true);
    if (category) {
      query = query.eq('vendor_category', category);
    }

    if (location) {
      query = query.ilike('address->city', `%${location}%`);
    }

    if (budget) {
      query = query.lte('pricing_range->min', budget);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(vendor => ({
      id: vendor.vendor_id,
      name: vendor.vendor_name,
      category: vendor.vendor_category,
      location: vendor.address?.city && vendor.address?.state ? `${vendor.address.city}, ${vendor.address.state}` : vendor.address?.fullAddress || '',
      rating: vendor.rating || 0,
      contact: vendor.phone_number || '',
      email: vendor.contact_email || '',
      price: vendor.pricing_range ? `${vendor.pricing_range.min ? '₹' + vendor.pricing_range.min.toLocaleString() : ''}${vendor.pricing_range.max ? '-₹' + vendor.pricing_range.max.toLocaleString() : ''} ${vendor.pricing_range.unit || ''}` : '',
      status: vendor.status as "recommended" | "contacted" | "booked" | "pending" | "completed",
      bookingDate: undefined,
      notes: vendor.description || '',
      linkedVendor: undefined,
    }));
  } catch (error: any) {
    logError(error, { context: 'getVendorRecommendations', category: category, location: location, budget: budget });
    Alert.alert("Error fetching vendor recommendations", "Could not load vendor recommendations.");
    throw error;
  }
};

export const getVendorDetails = async (vendorId: string): Promise<Vendor> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('vendor_id', vendorId)
      .single();

    if (error) throw error;

    return {
      id: data.vendor_id,
      name: data.vendor_name,
      category: data.vendor_category,
      location: data.address?.city && data.address?.state ? `${data.address.city}, ${data.address.state}` : data.address?.fullAddress || '',
      rating: data.rating || 0,
      contact: data.phone_number || '',
      email: data.contact_email || '',
      price: data.pricing_range ? `${data.pricing_range.min ? '₹' + data.pricing_range.min.toLocaleString() : ''}${data.pricing_range.max ? '-₹' + data.pricing_range.max.toLocaleString() : ''} ${data.pricing_range.unit || ''}` : '',
      status: data.status as "recommended" | "contacted" | "booked" | "pending" | "completed",
      notes: data.description || '',
      portfolio_image_urls: data.portfolio_image_urls,
    };
  } catch (error: any) {
    logError(error, { context: 'getVendorDetails', vendorId: vendorId });
    Alert.alert("Error fetching vendor details", "Could not load vendor details.");
    throw error;
  }
};

export interface VendorToAdd {
  id?: string;
  vendor_id?: string;
  name?: string;
  vendor_name?: string;
  category?: string;
  vendor_category?: string;
  contact?: string;
  phoneNumber?: string;
  phone_number?: string;
}

export const addVendorToUser = async (wedding_id: string, vendor: VendorToAdd, owner_party: string) => {
  const linked_vendor_id = vendor.vendor_id || vendor.id;
  try {
    const { data, error } = await supabase
      .from('user_shortlisted_vendors')
      .insert([
        {
          wedding_id,
          vendor_name: vendor.name || vendor.vendor_name || '',
          vendor_category: vendor.category || vendor.vendor_category || '',
          contact_info: vendor.contact || vendor.phoneNumber || vendor.phone_number || '',
          status: 'user_added',
          linked_vendor_id,
          owner_party,
        },
      ])
      .select();
    if (error) throw new ApiError(`Failed to add vendor to user: ${error.message}`, 500, error);
    return data;
  } catch (error: any) {
    logError(error, { context: 'addVendorToUser', wedding_id: wedding_id, vendor: vendor, owner_party: owner_party });
    Alert.alert("Error adding vendor", "Could not add vendor.");
    throw error;
  }
};

export const removeVendorFromUser = async (userVendorId: string) => {
  try {
    const { error } = await supabase
      .from('user_shortlisted_vendors')
      .delete()
      .eq('user_vendor_id', userVendorId);
    if (error) throw new ApiError(`Failed to remove vendor from user: ${error.message}`, 500, error);
    return true;
  } catch (error: any) {
    logError(error, { context: 'removeVendorFromUser', userVendorId: userVendorId });
    Alert.alert("Error removing vendor", "Could not remove vendor.");
    throw error;
  }
};

export const getUserVendors = async (wedding_id: string, userId?: string, role?: string): Promise<UserShortlistedVendorItem[]> => {
  let query = supabase
    .from('user_shortlisted_vendors')
    .select(`
      user_vendor_id,
      vendor_name,
      vendor_category,
      contact_info,
      status,
      booked_date,
      notes,
      linked_vendor_id,
      estimated_cost,
      wedding_id,
      owner_party,
      vendors(*)
    `)
    .eq('wedding_id', wedding_id);

  if (role) {
    query = query.or(`owner_party.eq.${role},owner_party.eq.shared,owner_party.eq.couple`);
  }

  try {
    const { data, error } = await query;
    if (error) throw new ApiError(`Failed to get user vendors: ${error.message}`, 500, error);
    return data.map(item => ({
      id: item.user_vendor_id,
      name: item.vendor_name,
      category: item.vendor_category,
      contactInfo: item.contact_info,
      status: item.status,
      bookedDate: item.booked_date,
      notes: item.notes,
      linkedVendor: item.vendors as unknown as SupabaseVendorRaw | null,
      estimatedCost: item.estimated_cost,
      wedding_id: item.wedding_id,
      owner_party: item.owner_party,
    }));
  } catch (error: any) {
    logError(error, { context: 'getUserVendors', wedding_id: wedding_id, userId: userId, role: role });
    Alert.alert("Error fetching user vendors", "Could not load your vendors.");
    throw error;
  }
};

export const useUserVendors = (wedding_id: string, userId?: string, role?: string) => {
  return useQuery<UserShortlistedVendorItem[], Error>({
    queryKey: ['userVendors', wedding_id, userId, role],
    queryFn: () => getUserVendors(wedding_id, userId, role),
    enabled: !!wedding_id,
  });
};
