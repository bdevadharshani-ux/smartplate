import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { analyticsApi } from '@/api';
import { useAuth } from '../context/AuthContext';
import { 
  Utensils, 
  Building2, 
  Users, 
  Heart, 
  Truck, 
  ArrowRight, 
  CheckCircle2,
  MapPin,
  Shield,
  Leaf,
  TrendingUp
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    meals_delivered: 0,
    ngos_served: 0,
    active_volunteers: 0,
    donors_registered: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await analyticsApi.getPublic();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}`);
    } else {
      navigate('/auth');
    }
  };

  const features = [
    {
      icon: Building2,
      title: 'Verified NGOs',
      description: 'Only verified NGOs can create food requests, ensuring trust and accountability.',
    },
    {
      icon: MapPin,
      title: 'Location-Based Matching',
      description: 'Smart matching based on proximity for faster, fresher deliveries.',
    },
    {
      icon: Shield,
      title: 'Fraud Prevention',
      description: 'Geo-tagged photos, dual-admin verification, and complete audit trails.',
    },
    {
      icon: TrendingUp,
      title: 'AI-Assisted',
      description: 'AI helps prioritize urgent requests and optimize matching decisions.',
    },
  ];

  const howItWorks = [
    { step: 1, title: 'NGO Creates Request', description: 'Verified NGOs post their food requirements' },
    { step: 2, title: 'Donors Accept', description: 'Donors view requests and commit to fulfilling' },
    { step: 3, title: 'Volunteers Deliver', description: 'Verified volunteers handle last-mile delivery' },
    { step: 4, title: 'NGO Confirms', description: 'NGO confirms receipt, completing the loop' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-primary" />
              <span className="font-heading text-xl font-bold text-primary">SmartPlate</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#how-it-works" className="text-sm text-foreground hover:text-primary smooth-transition">
                How It Works
              </a>
              <a href="#impact" className="text-sm text-foreground hover:text-primary smooth-transition">
                Impact
              </a>
            </nav>
            <Button 
              className="rounded-full"
              onClick={handleGetStarted}
              data-testid="header-get-started-btn"
            >
              {isAuthenticated ? 'Dashboard' : 'Get Started'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                  <Leaf className="h-4 w-4 mr-2" />
                  SDG-2 Zero Hunger Initiative
                </span>
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
                  Rescue Food,{' '}
                  <span className="text-primary">Feed Communities</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">
                  SmartPlate connects surplus food with those who need it most. 
                  A trust-first platform verified by NGOs, powered by volunteers.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="rounded-full text-base px-8"
                  onClick={handleGetStarted}
                  data-testid="hero-get-started-btn"
                >
                  Join the Movement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full text-base px-8"
                  asChild
                >
                  <a href="#how-it-works">Learn More</a>
                </Button>
              </div>
            </div>
            
            <div className="lg:col-span-6">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1710092784814-4a6f158913b8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHx2b2x1bnRlZXJzJTIwZGlzdHJpYnV0aW5nJTIwZm9vZHxlbnwwfHx8fDE3Njk3MDU4NjR8MA&ixlib=rb-4.1.0&q=85&w=800"
                  alt="Volunteers distributing food"
                  className="rounded-3xl shadow-soft w-full object-cover aspect-[4/3]"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-card p-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-xl">
                      <Heart className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.meals_delivered.toLocaleString()}+</p>
                      <p className="text-sm text-muted-foreground">Meals Delivered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section id="impact" className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center" data-testid="stat-meals">
              <Utensils className="h-10 w-10 mx-auto mb-3 opacity-80" />
              <p className="text-3xl sm:text-4xl font-bold">{stats.meals_delivered.toLocaleString()}</p>
              <p className="text-sm opacity-80 mt-1">Meals Delivered</p>
            </div>
            <div className="text-center" data-testid="stat-ngos">
              <Building2 className="h-10 w-10 mx-auto mb-3 opacity-80" />
              <p className="text-3xl sm:text-4xl font-bold">{stats.ngos_served}</p>
              <p className="text-sm opacity-80 mt-1">NGOs Served</p>
            </div>
            <div className="text-center" data-testid="stat-volunteers">
              <Truck className="h-10 w-10 mx-auto mb-3 opacity-80" />
              <p className="text-3xl sm:text-4xl font-bold">{stats.active_volunteers}</p>
              <p className="text-sm opacity-80 mt-1">Active Volunteers</p>
            </div>
            <div className="text-center" data-testid="stat-donors">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-80" />
              <p className="text-3xl sm:text-4xl font-bold">{stats.donors_registered}</p>
              <p className="text-sm opacity-80 mt-1">Registered Donors</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              How SmartPlate Works
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              A simple, transparent process that ensures food reaches those who need it most
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative" data-testid={`step-${item.step}`}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-[80%] border-t-2 border-dashed border-stone-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Built for Trust & Impact
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Every feature designed to ensure transparency, security, and maximum social impact
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={feature.title} className="border-stone-200 card-hover" data-testid={`feature-${index}`}>
                <CardContent className="p-6">
                  <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of NGOs, donors, and volunteers working together to reduce food waste and hunger.
          </p>
          <Button 
            size="lg" 
            className="rounded-full text-base px-8"
            onClick={handleGetStarted}
            data-testid="cta-get-started-btn"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6" />
              <span className="font-heading text-lg font-bold">SmartPlate</span>
            </div>
            <p className="text-sm opacity-80">
              © 2025 SmartPlate. Fighting hunger, reducing waste.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

