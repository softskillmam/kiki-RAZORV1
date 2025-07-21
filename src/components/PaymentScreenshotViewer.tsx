
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ZoomIn, Upload, Edit, Save, X } from 'lucide-react';

interface PaymentScreenshotViewerProps {
  orderId: string;
  isAdmin?: boolean;
}

const PaymentScreenshotViewer: React.FC<PaymentScreenshotViewerProps> = ({ orderId, isAdmin = false }) => {
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [newScreenshot, setNewScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchScreenshot();
  }, [orderId]);

  const fetchScreenshot = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('payment_screenshot_url')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      if (data?.payment_screenshot_url) {
        setScreenshotUrl(data.payment_screenshot_url);
      }
    } catch (error) {
      console.error('Error fetching screenshot:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPG or PNG image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setNewScreenshot(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadNewScreenshot = async () => {
    if (!newScreenshot) return;

    setUploading(true);
    try {
      const fileExt = newScreenshot.name.split('.').pop();
      const fileName = `${orderId}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, newScreenshot);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName);

      // Update order with new screenshot URL
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_screenshot_url: urlData.publicUrl })
        .eq('id', orderId);

      if (updateError) throw updateError;

      setScreenshotUrl(urlData.publicUrl);
      setIsEditing(false);
      setNewScreenshot(null);
      setPreviewUrl('');

      toast({
        title: "Success",
        description: "Payment screenshot updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      toast({
        title: "Error",
        description: "Failed to upload screenshot.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!screenshotUrl && !isEditing) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-gray-500">
          No payment screenshot uploaded
          {!isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="ml-2"
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          Payment Screenshot
          {!isAdmin && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {previewUrl && (
              <div className="border rounded p-2">
                <img 
                  src={previewUrl} 
                  alt="New screenshot preview" 
                  className="max-w-full h-32 object-contain mx-auto"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={uploadNewScreenshot}
                disabled={!newScreenshot || uploading}
                size="sm"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setNewScreenshot(null);
                  setPreviewUrl('');
                }}
                size="sm"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img 
              src={screenshotUrl} 
              alt="Payment screenshot" 
              className="w-full h-32 object-contain border rounded cursor-pointer hover:opacity-80 transition-opacity"
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full">
                <DialogHeader>
                  <DialogTitle>Payment Screenshot</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center">
                  <img 
                    src={screenshotUrl} 
                    alt="Payment screenshot" 
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentScreenshotViewer;
