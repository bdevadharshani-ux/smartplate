import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
import { GrainTexture } from '../components/GrainTexture';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Auth = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [tab, setTab] = useState('signin');
  const [loading, setLoading] = useState(false);

  const [signin, setSignin] = useState({ email: '', password: '' });
  const [signup, setSignup] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'donor'
  });

  /* ---------------- SIGN IN ---------------- */
  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!signin.email || !signin.password) {
      toast.error('Fill all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, signin);
      setAuth(res.data.token, res.data.user);

      toast.success('Welcome back!');
      navigate(`/${res.data.user.role}-dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SIGN UP ---------------- */
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!signup.name || !signup.email || !signup.password) {
      toast.error('Fill all fields');
      return;
    }

    if (signup.password !== signup.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/register`, {
        name: signup.name,
        email: signup.email,
        password: signup.password,
        role: signup.role
      });

      setAuth(res.data.token, res.data.user);
      toast.success('Account created!');
      navigate('/select-role');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <GrainTexture />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-center">SmartPlate</h2>

          <div className="flex bg-muted rounded-lg p-1">
            <button
              className={`flex-1 py-2 rounded-md ${tab === 'signin' && 'bg-white'}`}
              onClick={() => setTab('signin')}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 rounded-md ${tab === 'signup' && 'bg-white'}`}
              onClick={() => setTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <Input
                placeholder="Email"
                value={signin.email}
                onChange={(e) =>
                  setSignin({ ...signin, email: e.target.value })
                }
              />
              <Input
                type="password"
                placeholder="Password"
                value={signin.password}
                onChange={(e) =>
                  setSignin({ ...signin, password: e.target.value })
                }
              />
              <Button className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <Input
                placeholder="Full Name"
                value={signup.name}
                onChange={(e) =>
                  setSignup({ ...signup, name: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                value={signup.email}
                onChange={(e) =>
                  setSignup({ ...signup, email: e.target.value })
                }
              />
              <Input
                type="password"
                placeholder="Password"
                value={signup.password}
                onChange={(e) =>
                  setSignup({ ...signup, password: e.target.value })
                }
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={signup.confirm}
                onChange={(e) =>
                  setSignup({ ...signup, confirm: e.target.value })
                }
              />

              <Select
                value={signup.role}
                onValueChange={(v) =>
                  setSignup({ ...signup, role: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="donor">Donor</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                </SelectContent>
              </Select>

              <Button className="w-full" disabled={loading}>
                {loading ? 'Creating…' : 'Sign Up'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
