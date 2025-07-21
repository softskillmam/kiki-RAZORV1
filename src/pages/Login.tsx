
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, UserPlus, AlertCircle, BookOpen, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const { isAuthenticated, login, signUp, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      checkUserRoleAndRedirect();
    }
  }, [isAuthenticated, navigate]);

  const checkUserRoleAndRedirect = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profile?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      navigate('/');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const { error } = await login(loginEmail, loginPassword);
    
    if (error) {
      setError('Invalid credentials. Please check your email and password.');
    }
    
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }
    
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    
    if (error) {
      if (error.message.includes('already registered')) {
        setError('This email is already registered. Please try logging in instead.');
      } else {
        setError(error.message || 'Failed to create account. Please try again.');
      }
    } else {
      setError('');
      setActiveTab('login');
    }
    
    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) {
        setError(error.message);
      } else {
        setResetEmailSent(true);
        setError('');
      }
    } catch (error: any) {
      setError('Failed to send reset email. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError('');
    
    const { error } = await signInWithGoogle();
    if (error) {
      setError('Failed to sign in with Google. Please try again.');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kiki-purple-50 via-white to-kiki-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-kiki-purple-600" />
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kiki-purple-50 via-white to-kiki-blue-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-2xl border-kiki-purple-200">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="text-white w-8 h-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Reset Password
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Enter your email to receive a password reset link
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resetEmailSent ? (
              <div className="text-center space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Password reset email sent! Check your inbox and follow the instructions to reset your password.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                    setForgotPasswordEmail('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="border-kiki-purple-200 focus:border-kiki-purple-400"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-kiki-purple-600 to-kiki-blue-600 hover:from-kiki-purple-700 hover:to-kiki-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Email'
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiki-purple-50 via-white to-kiki-blue-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full shadow-2xl border-kiki-purple-200">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-600 rounded-2xl flex items-center justify-center">
            <BookOpen className="text-white w-8 h-8" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to KIKI Learning Hub
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Sign in to your account or create a new one
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign-in Button at the top */}
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full border-kiki-purple-200 hover:bg-kiki-purple-50 h-12 text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-3" />
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground font-medium">Or continue with email</span>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="border-kiki-purple-200 focus:border-kiki-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="border-kiki-purple-200 focus:border-kiki-purple-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-kiki-purple-600 hover:text-kiki-purple-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-kiki-purple-600 to-kiki-blue-600 hover:from-kiki-purple-700 hover:to-kiki-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Enter your full name"
                    className="border-kiki-purple-200 focus:border-kiki-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="border-kiki-purple-200 focus:border-kiki-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="border-kiki-purple-200 focus:border-kiki-purple-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSignupPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm your password"
                      className="border-kiki-purple-200 focus:border-kiki-purple-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-kiki-purple-600 to-kiki-blue-600 hover:from-kiki-purple-700 hover:to-kiki-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-sm text-kiki-purple-600 hover:text-kiki-purple-700 hover:bg-kiki-purple-50"
            >
              ← Back to KIKI Learning Hub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
