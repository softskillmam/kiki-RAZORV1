
// This file has been replaced with Supabase storage functionality
// Images are now uploaded directly to Supabase storage buckets
// See PaymentScreenshotViewer component for implementation details

export const uploadToCloudinary = async (file: File): Promise<string> => {
  throw new Error('Cloudinary upload has been deprecated. Use Supabase storage instead.');
};
