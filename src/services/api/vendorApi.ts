
import { supabase } from '../supabase/config';


export interface Vendor {
  id: string;
  name: string;
  category: string;
  contactEmail: string;
  phoneNumber: string;
  websiteUrl: string;
  address: {
    fullAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  pricingRange: {
    min: number;
    max: number;
    currency: string;
    unit: string;
    details: string;
  };
  rating: number;
  description: string;
  portfolioImageUrls: string[];
}

// Get user ID from current auth
const getCurrentUserId = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('User not authenticated');
  // Get internal user_id from Supabase based on supabase user id
  const { data, error } = await supabase
    .from('users')
    .select('user_id')
    .eq('supabase_auth_uid', userData.user.id)
    .single();
  if (error) throw error;
  return data.user_id;
};

export const getVendorRecommendations = async (
  category: string,
  location: string,
  budget?: number
): Promise<Vendor[]> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
    // If API_BASE_URL is set, try to use the backend API first
    if (API_BASE_URL) {
      try {
        // If you need to send a Supabase access token, get it here
        // const { data: { session } } = await supabase.auth.getSession();
        // const accessToken = session?.access_token;
        const response = await fetch(`${API_BASE_URL}/vendors/recommend`, {
          method: 'GET',
          headers: {
            // 'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          // Add query parameters
          // Use URLSearchParams to handle undefined values
          body: JSON.stringify({ category, location, budget }),
        });
        
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (apiError) {
        console.error('Error calling backend API, falling back to Supabase:', apiError);
      }
    }
    
    // Fallback to direct Supabase query if API fails or isn't configured
    let query = supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true);
    if (category) {
      query = query.eq('vendor_category', category);
    }
      
    // Add location filter if provided
    if (location) {
      query = query.ilike('address->city', `%${location}%`);
    }
    
    // Add budget filter if provided
    if (budget) {
      query = query.lte('pricing_range->min', budget);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(vendor => ({
      id: vendor.vendor_id,
      name: vendor.vendor_name,
      category: vendor.vendor_category,
      contactEmail: vendor.contact_email,
      phoneNumber: vendor.phone_number,
      websiteUrl: vendor.website_url,
      address: vendor.address,
      pricingRange: vendor.pricing_range,
      rating: vendor.rating,
      description: vendor.description,
      portfolioImageUrls: vendor.portfolio_image_urls,
    }));
  } catch (error) {
    console.error('Error fetching vendor recommendations:', error);
    throw error;
  }
};

export const getVendorDetails = async (vendorId: string): Promise<Vendor> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
    // If API_BASE_URL is set, try to use the backend API first
    if (API_BASE_URL) {
      try {
        // If you need to send a Supabase access token, get it here
        // const { data: { session } } = await supabase.auth.getSession();
        // const accessToken = session?.access_token;
        const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}`, {
          method: 'GET',
          headers: {
            // 'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (apiError) {
        console.error('Error calling backend API, falling back to Supabase:', apiError);
      }
    }
    
    // Fallback to direct Supabase query
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
      contactEmail: data.contact_email,
      phoneNumber: data.phone_number,
      websiteUrl: data.website_url,
      address: data.address,
      pricingRange: data.pricing_range,
      rating: data.rating,
      description: data.description,
      portfolioImageUrls: data.portfolio_image_urls,
    };
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    throw error;
  }
};

export const addVendorToUser = async (vendor: any) => {
  const userId = await getCurrentUserId();
  // Prefer vendor.vendor_id for global vendors, fallback to vendor.id
  const linked_vendor_id = vendor.vendor_id || vendor.id;
  const { data, error } = await supabase
    .from('user_shortlisted_vendors')
    .insert([
      {
        user_id: userId,
        vendor_name: vendor.name || vendor.vendor_name || '',
        vendor_category: vendor.category || vendor.vendor_category || '',
        contact_info: vendor.contact || vendor.phoneNumber || vendor.phone_number || '',
        status: 'user_added',
        linked_vendor_id,
      },
    ])
    .select();
  if (error) throw error;
  return data;
};

export const removeVendorFromUser = async (userVendorId: string) => {
  // Always delete by user_vendor_id (UUID primary key)
  const { error } = await supabase
    .from('user_shortlisted_vendors')
    .delete()
    .eq('user_vendor_id', userVendorId);
  if (error) throw error;
  return true;
};

export const getUserVendors = async (): Promise<any[]> => {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
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
        vendors(*)
      `)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return data.map(item => ({
      id: item.user_vendor_id,
      name: item.vendor_name,
      category: item.vendor_category,
      contactInfo: item.contact_info,
      status: item.status,
      bookedDate: item.booked_date,
      notes: item.notes,
      linkedVendor: item.vendors,
      estimatedCost: item.estimated_cost,
    }));
  } catch (error) {
    console.error('Error fetching user vendors:', error);
    throw error;
  }
};
