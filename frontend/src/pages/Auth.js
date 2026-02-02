import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { GrainTexture } from '../components/GrainTexture';
import { Shield, Heart, Users, Truck, CheckCircle } from 'lucide-react';

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
    { value: 'donor', label: 'Donor', icon: Heart, description: 'Donate surplus food' },
    { value: 'ngo', label: 'NGO', icon: Shield, description: 'Receive food donations' },
    { value: 'volunteer', label: 'Volunteer', icon: Truck, description: 'Deliver food' }
  ];

  /* ---------------- SIGN IN ---------------- */
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

  /* ---------------- SIGN UP ---------------- */
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

  return (
    <div className="min-h-screen flex">
      <GrainTexture />

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold text-xl">
              SP
            </div>
            <span className="text-3xl font-bold">SmartPlate</span>
          </div>

          <h1 className="text-5xl font-bold mb-6">Zero Hunger, Zero Waste</h1>
          <p className="text-lg opacity-90 mb-12">
            Connecting NGOs, donors, and volunteers to reduce food waste.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Verified NGOs</p>
          </div>
          <div className="text-center">
            <Heart className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Trusted Donors</p>
          </div>
          <div className="text-center">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Active Volunteers</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Welcome</h2>
            <p className="text-muted-foreground">
              Sign in or create a new account
            </p>
          </div>

          {/* TABS */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              className={`flex-1 py-2 rounded-md ${
                activeTab === 'signin' ? 'bg-white' : ''
              }`}
              onClick={() => setActiveTab('signin')}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 rounded-md ${
                activeTab === 'signup' ? 'bg-white' : ''
              }`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {/* SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={signInData.email}
                onChange={(e) =>
                  setSignInData({ ...signInData, email: e.target.value })
                }
              />
              <Input
                type="password"
                placeholder="Password"
                value={signInData.password}
                onChange={(e) =>
                  setSignInData({ ...signInData, password: e.target.value })
                }
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}

          {/* SIGN UP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <Input
                placeholder="Full Name"
                value={signUpData.fullName}
                onChange={(e) =>
                  setSignUpData({ ...signUpData, fullName: e.target.value })
                }
              />
              <Input
                type="email"
                placeholder="Email"
                value={signUpData.email}
                onChange={(e) =>
                  setSignUpData({ ...signUpData, email: e.target.value })
                }
              />
              <Input
                type="password"
                placeholder="Password"
                value={signUpData.password}
                onChange={(e) =>
                  setSignUpData({ ...signUpData, password: e.target.value })
                }
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={signUpData.confirmPassword}
                onChange={(e) =>
                  setSignUpData({
                    ...signUpData,
                    confirmPassword: e.target.value
                  })
                }
              />

              <Select
                value={signUpData.role}
                onValueChange={(value) =>
                  setSignUpData({ ...signUpData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* ✅ FINAL EXPORT – NO GOOGLE PROVIDER */
export const Auth = () => {
  return <AuthContent />;
};
