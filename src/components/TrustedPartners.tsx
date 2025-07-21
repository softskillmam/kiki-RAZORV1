import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrustedPartner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  order_index: number;
}

interface TrustedPartnersHeader {
  title: string;
  description: string;
}

const TrustedPartners = () => {
  const [partners, setPartners] = useState<TrustedPartner[]>([]);
  const [headerData, setHeaderData] = useState<TrustedPartnersHeader>({
    title: 'Globally trusted for delivering impactful learning outcomes',
    description: 'We collaborate with premier institutions across the Globe'
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrustedPartners();
  }, []);

  const fetchTrustedPartners = async () => {
    try {
      setLoading(true);
      
      // Fetch trusted partners data
      const { data: partnersData, error: partnersError } = await supabase
        .from('homepage_content')
        .select('*')
        .eq('section_name', 'trusted_partners')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (partnersError) {
        console.error('Error fetching partners:', partnersError);
        // Don't show toast for this error, just log it
      } else {
        setPartners(partnersData || []);
      }

      // Fetch header data
      const { data: headerData, error: headerError } = await supabase
        .from('homepage_content')
        .select('*')
        .eq('section_name', 'trusted_partners_header')
        .eq('is_active', true)
        .single();

      if (headerError) {
        console.error('Error fetching header:', headerError);
        // Keep default header data if not found
      } else if (headerData) {
        setHeaderData({
          title: headerData.title,
          description: headerData.description || 'We collaborate with premier institutions across the Globe'
        });
      }
    } catch (error) {
      console.error('Error in fetchTrustedPartners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate logo abbreviation from title
  const generateLogo = (title: string) => {
    return title
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 3);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white border-t border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kiki-purple-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white border-t border-b">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {headerData.title}
          </h2>
          <p className="text-gray-600 mb-2">{headerData.description}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-kiki-purple-600">
            <span>📍</span>
            <span>Founders Footprints</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
          {partners.map((partner) => (
            <div key={partner.id} className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover-scale">
              {/* Background Image */}
              <div className="aspect-[4/3] relative">
                <img 
                  src={partner.image_url} 
                  alt={partner.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              </div>
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {/* Logo Badge */}
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {generateLogo(partner.title)}
                    </span>
                  </div>
                  
                  {/* Partner Info */}
                  <h3 className="text-sm font-bold text-gray-900 text-center mb-1">
                    {partner.title}
                  </h3>
                  <p className="text-xs text-gray-600 text-center">
                    {partner.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-kiki-purple-50 rounded-full">
            <span className="text-sm font-medium text-kiki-purple-700">
              Soft Skills & Career Development Focus
            </span>
            <span className="w-1 h-1 bg-kiki-purple-400 rounded-full"></span>
            <span className="text-sm text-kiki-purple-600">
              Contact: 8220879805
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedPartners;
