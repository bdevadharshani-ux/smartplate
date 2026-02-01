import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';

export const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const getDashboardLink = () => {
    switch (user.role) {
      case 'ngo':
        return '/ngo-dashboard';
      case 'donor':
        return '/donor-dashboard';
      case 'volunteer':
        return '/volunteer-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/select-role';
    }
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to={getDashboardLink()} className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
            SP
          </div>
          <span className="text-xl font-bold text-primary">SmartPlate</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/analytics">
            <Button variant="ghost" size="sm" data-testid="nav-analytics-btn">
              Analytics
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" size="sm" data-testid="nav-profile-btn">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            data-testid="nav-logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};