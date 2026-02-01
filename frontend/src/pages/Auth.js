import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { GrainTexture } from '../components/GrainTexture';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Shield, Heart, Users, Truck, CheckCircle } from 'lucide-react';

const GOOGLE_CLIENT_ID = '258865302551-92d6t56v3als95fpmq81pn1ef82md6t5.apps.googleusercontent.com';

const AuthContent = () => {
  const navigate = useNavigate();
  const { login, API } = useAuth();
  const [activeTab, setActiveTab] = useState('signin');
  const [loading, setLoading] = useState(false);

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor'
  });

  const roleOptions = [
    { value: 'donor', label: 'Donor', icon: Heart, description: 'Donate surplus food to those in need' },
    { value: 'ngo', label: 'NGO', icon: Shield, description: 'Create food requests and receive donations' },
    { value: 'volunteer', label: 'Volunteer', icon: Truck, description: 'Help deliver food from donors to NGOs' }
  ];

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signInData.email || !signInData.password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, signInData);
      login(response.data.token, response.data.user);
      toast.success('Welcome back!');
      
      const dashboardMap = {
        ngo: '/ngo-dashboard',
        donor: '/donor-dashboard',
        volunteer: '/volunteer-dashboard',
        admin: '/admin-dashboard'
      };
      navigate(dashboardMap[response.data.user.role] || '/select-role');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpData.fullName || !signUpData.email || !signUpData.password) {
      toast.error('Please fill all required fields');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signUpData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, {
        name: signUpData.fullName,
        email: signUpData.email,
        password: signUpData.password,
        role: signUpData.role
      });
      
      login(response.data.token, response.data.user);
      toast.success('Account created successfully!');
      navigate('/verify-phone');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      const response = await axios.post(`${API}/auth/google`, {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      });

      login(response.data.token, response.data.user);
      toast.success('Welcome to SmartPlate!');
      
      if (!response.data.user.phone_verified) {
        navigate('/verify-phone');
      } else if (!response.data.user.role) {
        navigate('/select-role');
      } else {
        const dashboardMap = {
          ngo: '/ngo-dashboard',
          donor: '/donor-dashboard',
          volunteer: '/volunteer-dashboard',
          admin: '/admin-dashboard'
        };
        navigate(dashboardMap[response.data.user.role]);
      }
    } catch (error) {
      toast.error('Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen flex">
      <GrainTexture />
      
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground p-12 flex-col justify-between relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold text-xl">
              SP
            </div>
            <span className="text-3xl font-bold">SmartPlate</span>
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Zero Hunger, Zero Waste
          </h1>
          <p className="text-lg opacity-90 mb-12 leading-relaxed">
            A secure, AI-assisted food redistribution platform connecting NGOs, donors, and volunteers to reduce food waste and hunger.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium">Verified NGOs</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium">Trusted Donors</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium">Active Volunteers</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome</h2>
            <p className="text-muted-foreground">Sign in to your account or create a new one</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg bg-muted p-1" data-testid="auth-tabs">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'signin'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="signin-tab"
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="signup-tab"
            >
              Sign Up
            </button>
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4" data-testid="signin-form">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  data-testid="signin-email"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <Input
                  type="password"
                  placeholder="••••••"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  data-testid="signin-password"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full h-12 text-base"
                data-testid="signin-submit-btn"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-muted-foreground">Or sign in with</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google sign in failed')}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="pill"
                />
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4" data-testid="signup-form">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={signUpData.fullName}
                  onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                  data-testid="signup-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  data-testid="signup-email"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <Input
                  type="password"
                  placeholder="••••••"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  data-testid="signup-password"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="••••••"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  data-testid="signup-confirm-password"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">I want to join as</label>
                <Select value={signUpData.role} onValueChange={(value) => setSignUpData({ ...signUpData, role: value })}>
                  <SelectTrigger data-testid="signup-role-select" className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-3 py-1">
                            <Icon className="w-5 h-5 text-primary" />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            </div>
                            {signUpData.role === option.value && (
                              <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full h-12 text-base"
                data-testid="signup-submit-btn"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-muted-foreground">Or sign up with</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google sign up failed')}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="pill"
                />
              </div>
            </form>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <a href="/admin-login" className="hover:text-primary underline">
              Admin Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Auth = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthContent />
    </GoogleOAuthProvider>
  );
};