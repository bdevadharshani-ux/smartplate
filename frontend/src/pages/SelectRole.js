import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { GrainTexture } from '../components/GrainTexture';
import { Users, Heart, Truck } from 'lucide-react';

export const SelectRole = () => {
  const navigate = useNavigate();
  const { API, user, updateUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'ngo',
      title: 'NGO',
      description: 'Represent communities in need and create food requests',
      icon: Users,
      color: 'bg-primary'
    },
    {
      id: 'donor',
      title: 'Donor',
      description: 'Donate surplus food from restaurants, events, or home',
      icon: Heart,
      color: 'bg-accent'
    },
    {
      id: 'volunteer',
      title: 'Volunteer',
      description: 'Help deliver food from donors to those in need',
      icon: Truck,
      color: 'bg-primary'
    }
  ];

  const handleSelectRole = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/select-role`, { role: selectedRole });
      toast.success('Role selected! Complete your profile.');
      updateUser({ ...user, role: selectedRole });
      
      const registrationMap = {
        ngo: '/ngo-dashboard',
        donor: '/donor-dashboard',
        volunteer: '/volunteer-dashboard'
      };
      navigate(registrationMap[selectedRole]);
    } catch (error) {
      toast.error('Failed to select role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <GrainTexture />
      <Card className="w-full max-w-3xl relative z-10" data-testid="select-role-card">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Choose Your Role</CardTitle>
          <CardDescription>
            Select how you'd like to contribute to fighting hunger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                    selectedRole === role.id
                      ? 'border-primary bg-secondary/50 shadow-lg scale-105'
                      : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                  }`}
                  data-testid={`role-${role.id}-btn`}
                >
                  <div className={`w-12 h-12 ${role.color} rounded-full flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{role.title}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </button>
              );
            })}
          </div>

          <Button
            onClick={handleSelectRole}
            disabled={!selectedRole || loading}
            className="w-full rounded-full h-12 text-lg"
            data-testid="confirm-role-btn"
          >
            {loading ? 'Processing...' : 'Continue'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};