
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Shield } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation - in real app, this would be actual authentication
    if (username && password) {
      setTimeout(() => {
        onLogin();
        onClose();
      }, 1000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
        <DialogHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
            <Shield className="text-white w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Admin Access
          </DialogTitle>
          <p className="text-gray-600 text-sm">
            Enter your admin credentials to access the dashboard
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              🔐 Administrative Panel
            </Badge>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-red-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-red-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium transition-all duration-200"
            >
              Sign In to Admin Panel
            </Button>
          </form>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-xs text-amber-800 mb-2">
              <strong>Secure Access:</strong> This area is restricted to authorized administrators only
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">Admin Dashboard</Badge>
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">Management Tools</Badge>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need access? Contact: 8220879805
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
