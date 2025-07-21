
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const ReferralManagement = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Referral System Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              The referral system has been removed from this application.
            </p>
            <p className="text-sm text-gray-500">
              Contact the administrator if you need referral functionality restored.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralManagement;
