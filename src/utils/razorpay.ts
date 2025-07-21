
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  try {
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: { amount: amount * 100, currency } // Convert to paise
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const initializeRazorpay = (options: RazorpayOptions) => {
  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
