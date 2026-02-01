import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { GrainTexture } from '../components/GrainTexture';
import { Shield } from 'lucide-react';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, API } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminSetup = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter admin email');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/admin-setup`, {
        email,
        name: name || 'Admin'
      });
      
      login(response.data.token, response.data.user);
      toast.success(response.data.message);
      navigate('/admin-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to setup admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <GrainTexture />
      <Card className="w-full max-w-md relative z-10" data-testid="admin-login-card">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Admin Setup</CardTitle>
          <CardDescription>
            Create or login as an admin user (Max 2 admins allowed)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminSetup} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Admin Email</label>
              <Input
                type="email"
                placeholder="admin@smartplate.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="admin-email-input"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Admin Name (Optional)</label>
              <Input
                type="text"
                placeholder="Admin Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="admin-name-input"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full"
              data-testid="admin-setup-btn"
            >
              {loading ? 'Setting up...' : 'Setup Admin Account'}
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Note: This endpoint is for initial setup only. SmartPlate supports dual-admin system (Admin A & Admin B).
            </p>
            <Link to="/" className="block text-center mt-4">
              <Button variant="ghost" className="text-sm" data-testid="back-home-btn">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};