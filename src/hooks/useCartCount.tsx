
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useCartCount = () => {
  const { user, isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCartCount = async () => {
    if (!user?.id || !isAuthenticated) {
      setCartCount(0);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart count:', error);
        setCartCount(0);
      } else {
        setCartCount(data?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [user?.id, isAuthenticated]);

  // Set up real-time subscription for cart updates
  useEffect(() => {
    if (!user?.id || !isAuthenticated) return;

    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Cart updated, refreshing count');
          fetchCartCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isAuthenticated]);

  // Refresh cart count when called
  const refreshCartCount = () => {
    fetchCartCount();
  };

  return { cartCount, loading, refreshCartCount };
};
