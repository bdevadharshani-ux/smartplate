import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { GrainTexture } from '../components/GrainTexture';
import { Shield, Heart, Users, MapPin, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import axios from 'axios';

export const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_meals: 0,
    people_fed: 0,
    ngos_served: 0,
    active_volunteers: 0
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/analytics/public`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, [API]);

  const roleCards = [
    {
      id: 'ngo',
      title: 'Verified NGOs',
      icon: Shield,
      description: 'All NGOs undergo strict verification with document validation before they can request food.',
      color: 'bg-green-50',
      iconColor: 'text-primary'
    },
    {
      id: 'donor',
      title: 'Trusted Donors',
      icon: Heart,
      description: 'Donors upload geo-tagged food photos for admin verification ensuring food quality and authenticity.',
      color: 'bg-orange-50',
      iconColor: 'text-accent'
    },
    {
      id: 'volunteer',
      title: 'Verified Volunteers',
      icon: Users,
      description: 'Volunteers are verified with ID proof and help bridge the gap between donors and NGOs.',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }
  ];

  const features = [
    {
      title: 'Live Tracking',
      description: 'Real-time location updates',
      icon: MapPin,
      color: 'bg-green-50'
    },
    {
      title: 'Fraud Prevention',
      description: 'Geo-tagged verification',
      icon: Shield,
      color: 'bg-green-50'
    },
    {
      title: 'Analytics',
      description: 'Impact measurement',
      icon: TrendingUp,
      color: 'bg-green-50'
    },
    {
      title: 'Smart Matching',
      description: 'AI-assisted logistics',
      icon: Zap,
      color: 'bg-green-50'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <GrainTexture />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              SP
            </div>
            <span className="text-2xl font-bold text-primary">SmartPlate</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/auth')} data-testid="nav-signin-btn">
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')} className="rounded-full" data-testid="nav-getstarted-btn">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6">
            <div className="bg-secondary/50 px-4 py-2 rounded-full text-sm font-medium text-primary flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              SDG-2: Zero Hunger Initiative
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Connecting Surplus Food
            <br />
            <span className="text-primary">With Those Who Need It</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
            SmartPlate is a secure, AI-assisted food redistribution platform that reduces
            food waste and hunger by connecting verified NGOs, donors, and volunteers in real-time.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="rounded-full text-lg px-8 py-6 h-auto"
              onClick={() => navigate('/auth')}
              data-testid="join-movement-btn"
            >
              Join the Movement →
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full text-lg px-8 py-6 h-auto"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="learn-more-btn"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="relative z-10 bg-secondary/30 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center" data-testid="metric-meals">
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                {stats.total_meals}+
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                Meals Redistributed
              </div>
            </div>
            <div className="text-center" data-testid="metric-ngos">
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                {stats.ngos_served}+
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                Verified NGOs
              </div>
            </div>
            <div className="text-center" data-testid="metric-volunteers">
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                {stats.active_volunteers}+
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                Active Volunteers
              </div>
            </div>
            <div className="text-center" data-testid="metric-food-saved">
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                0kg+
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                Food Waste Prevented
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 container mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            How SmartPlate Works
          </h2>
          <p className="text-lg text-muted-foreground">
            A trusted ecosystem for food redistribution with verification, tracking, and AI-powered matching.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {roleCards.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className="group bg-white border border-border rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
                onClick={() => navigate('/auth')}
                data-testid={`role-card-${role.id}`}
              >
                <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 ${role.iconColor}`} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">{role.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{role.description}</p>
              </div>
            );
          })}
        </div>

        {/* Smart Matching & Logistics */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12">
          <div className="mb-8">
            <div className="inline-block bg-accent/10 px-4 py-2 rounded-full text-sm font-semibold text-accent mb-4">
              🔥 AI-Powered
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Smart Matching & Logistics
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Our AI assists with intelligent matching and logistics, but all decisions are reviewed
              and approved by admins to ensure quality and trust.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-foreground">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Urgency scoring for food requests</span>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Nearest location matching for efficient delivery</span>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Food spoilage risk prediction</span>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Partial fulfillment suggestions</span>
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-6 text-center"
                  data-testid={`feature-${feature.title.toLowerCase().replace(' ', '-')}`}
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1 text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join SmartPlate today and be part of the movement to eliminate food waste and hunger.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="rounded-full text-lg px-8 py-6 h-auto"
              onClick={() => navigate('/auth')}
              data-testid="cta-signup-ngo"
            >
              Sign Up as NGO
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full text-lg px-8 py-6 h-auto"
              onClick={() => navigate('/auth')}
              data-testid="cta-become-donor"
            >
              Become a Donor
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full text-lg px-8 py-6 h-auto"
              onClick={() => navigate('/auth')}
              data-testid="cta-volunteer"
            >
              Volunteer
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary font-bold">
                SP
              </div>
              <span className="text-xl font-bold">SmartPlate</span>
            </div>
            <p className="text-sm opacity-90">
              © 2026 SmartPlate. Supporting SDG-2: Zero Hunger
            </p>
            <a
              href="/admin-login"
              className="text-sm opacity-75 hover:opacity-100 underline transition-opacity"
              data-testid="footer-admin-login"
            >
              Admin Login
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};