
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AdminAccess = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkAdminStatus();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!error && data?.role === 'admin') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAccess = () => {
    navigate('/admin');
  };

  if (loading || !isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAdminAccess}
      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
    >
      <Shield className="w-4 h-4 mr-2" />
      Admin Panel
    </Button>
  );
};

export default AdminAccess;
