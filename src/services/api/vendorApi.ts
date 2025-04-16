
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

export const getVendorRecommendations = async (
  category: string,
  location: string,
  budget?: number
): Promise<Vendor[]> => {
  try {
    let query = supabase
      .from('vendors')
      .select('*')
      .eq('vendor_category', category)
      .eq('is_active', true);
      
    // Add location filter if provided
    if (location) {
      query = query.ilike('address->city', `%${location}%`);
    }
    
    // Add budget filter if provided
    if (budget) {
      query = query.lte('pricing_range->min', budget);
    }
    
    const { data, error } = await query.limit(10);
    
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

export const getUserVendors = async (): Promise<any[]> => {
  try {
    // Get the current user's ID from Supabase
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    const { data: userIdData, error: userIdError } = await supabase
      .from('users')
      .select('user_id')
      .eq('firebase_uid', userData.user.id)
      .single();
      
    if (userIdError) throw userIdError;
    
    const { data, error } = await supabase
      .from('user_vendors')
      .select(`
        user_vendor_id,
        vendor_name,
        vendor_category,
        contact_info,
        status,
        booked_date,
        notes,
        linked_vendor_id,
        vendors(*)
      `)
      .eq('user_id', userIdData.user_id);
      
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
    }));
  } catch (error) {
    console.error('Error fetching user vendors:', error);
    throw error;
  }
};
