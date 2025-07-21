
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const ReferralProgram = () => {
  return (
    <div className="bg-gradient-to-br from-kiki-purple-50 to-kiki-blue-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-600 rounded-2xl mb-6">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Referral Program Unavailable
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The referral program is currently not available. Please check back later or contact support for more information.
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Program Status</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              The referral system has been temporarily disabled.
            </p>
            <p className="text-sm text-gray-500">
              We apologize for any inconvenience. Please contact our support team if you have any questions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralProgram;
