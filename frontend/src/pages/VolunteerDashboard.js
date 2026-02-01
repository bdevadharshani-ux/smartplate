import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { volunteerApi, analyticsApi, utilityApi } from '@/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DashboardLayout } from '../components/DashboardLayout';
import { MapComponent } from '../components/MapComponent';
import { 
  Truck, 
  MapPin, 
  Clock,
  Package,
  CheckCircle2,
  Star,
  Award,
  AlertCircle,
  Navigation,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

export const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, anaRes, ngosRes] = await Promise.all([
        volunteerApi.getProfile(),
        analyticsApi.getUser(),
        utilityApi.getVerifiedNGOs(),
      ]);
      
      setProfile(profileRes.data);
      setAnalytics(anaRes.data);
      setNgos(ngosRes.data || []);
      
      // Only fetch deliveries if verified
      if (profileRes.data?.status === 'approved') {
        const [delRes, availRes] = await Promise.all([
          volunteerApi.getDeliveries(),
          volunteerApi.getAvailableDeliveries(userLocation?.lat, userLocation?.lng),
        ]);
        setDeliveries(delRes.data || []);
        setAvailableDeliveries(availRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => console.log('Location denied')
      );
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAcceptDelivery = async (deliveryId) => {
    try {
      await volunteerApi.acceptDelivery(deliveryId);
      toast.success('Delivery accepted!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to accept delivery');
    }
  };

  const handlePickup = async (deliveryId) => {
    try {
      await volunteerApi.pickupDelivery(deliveryId);
      toast.success('Pickup confirmed!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to confirm pickup');
    }
  };

  const handleComplete = async (deliveryId) => {
    try {
      await volunteerApi.completeDelivery(deliveryId);
      toast.success('Delivery completed!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to complete delivery');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-warning text-warning-foreground', text: 'Pending' },
      assigned: { color: 'bg-primary text-primary-foreground', text: 'Assigned' },
      picked_up: { color: 'bg-accent text-accent-foreground', text: 'Picked Up' },
      in_transit: { color: 'bg-accent text-accent-foreground', text: 'In Transit' },
      delivered: { color: 'bg-success text-success-foreground', text: 'Delivered' },
      confirmed: { color: 'bg-success text-success-foreground', text: 'Confirmed' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Show verification pending state
  if (!profile || profile.status !== 'approved') {
    return (
      <DashboardLayout>
        <div className="space-y-8" data-testid="volunteer-verification-pending">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              Volunteer Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Help deliver food to those in need</p>
          </div>

          <Card className="border-stone-200 border-l-4 border-l-warning">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-warning/10 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Verification Required</h3>
                  <p className="text-muted-foreground mt-1">
                    Volunteer verification is coming soon. You will be able to upload your ID proof 
                    and get verified to start helping with deliveries.
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Status: <Badge className="bg-warning text-warning-foreground ml-2">
                      {profile?.status || 'Pending Review'}
                    </Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map showing NGOs even when not verified */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                NGO Locations Near You
              </CardTitle>
              <CardDescription>Showing verified NGOs in your area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-xl overflow-hidden">
                <MapComponent 
                  center={userLocation || { lat: 28.6139, lng: 77.2090 }}
                  markers={ngos.map(ngo => ({
                    position: ngo.location,
                    title: ngo.organization_name,
                    type: 'ngo'
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="volunteer-dashboard">
        {/* Header */}
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Volunteer Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Help deliver food to those in need</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-stone-200" data-testid="stat-deliveries">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.total_deliveries || 0}</p>
                  <p className="text-sm text-muted-foreground">Deliveries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-stone-200" data-testid="stat-score">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-xl">
                  <Star className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(analytics?.performance_score || 5.0).toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-stone-200" data-testid="stat-badges">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-xl">
                  <Award className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(analytics?.badges || []).length}</p>
                  <p className="text-sm text-muted-foreground">Badges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Deliveries */}
        {deliveries.filter(d => !['delivered', 'confirmed'].includes(d.status)).length > 0 && (
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="font-heading">Active Deliveries</CardTitle>
              <CardDescription>Your current delivery assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveries.filter(d => !['delivered', 'confirmed'].includes(d.status)).map((delivery) => (
                  <div 
                    key={delivery.id} 
                    className="p-4 rounded-xl border border-stone-200"
                    data-testid={`delivery-${delivery.id}`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(delivery.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Navigation className="h-4 w-4 text-primary" />
                          <span className="font-medium">Pickup:</span>
                          <span className="text-muted-foreground">{delivery.pickup_address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-accent" />
                          <span className="font-medium">Drop:</span>
                          <span className="text-muted-foreground">{delivery.dropoff_address}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {delivery.status === 'assigned' && (
                          <Button 
                            className="rounded-full"
                            onClick={() => handlePickup(delivery.id)}
                            data-testid={`pickup-btn-${delivery.id}`}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Confirm Pickup
                          </Button>
                        )}
                        {delivery.status === 'picked_up' && (
                          <Button 
                            className="rounded-full"
                            onClick={() => handleComplete(delivery.id)}
                            data-testid={`complete-btn-${delivery.id}`}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Complete Delivery
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Deliveries */}
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="font-heading">Available Deliveries</CardTitle>
            <CardDescription>Deliveries waiting for volunteers</CardDescription>
          </CardHeader>
          <CardContent>
            {availableDeliveries.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No available deliveries at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableDeliveries.map((delivery) => (
                  <div 
                    key={delivery.id} 
                    className="p-4 rounded-xl border border-stone-200 hover:bg-secondary/30 smooth-transition"
                    data-testid={`available-${delivery.id}`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Navigation className="h-4 w-4 text-primary" />
                          <span className="font-medium">From:</span>
                          <span className="text-muted-foreground">{delivery.pickup_address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-accent" />
                          <span className="font-medium">To:</span>
                          <span className="text-muted-foreground">{delivery.dropoff_address}</span>
                        </div>
                        {delivery.distance && (
                          <p className="text-sm text-primary font-medium">
                            {delivery.distance.toFixed(1)} km away
                          </p>
                        )}
                        {delivery.extra_volunteer_required && (
                          <Badge className="bg-accent text-accent-foreground">
                            Extra Help Needed
                          </Badge>
                        )}
                      </div>
                      <Button 
                        className="rounded-full"
                        onClick={() => handleAcceptDelivery(delivery.id)}
                        data-testid={`accept-btn-${delivery.id}`}
                      >
                        Accept Delivery
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Nearby NGOs
            </CardTitle>
            <CardDescription>Showing verified NGOs in your area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-xl overflow-hidden">
              <MapComponent 
                center={userLocation || { lat: 28.6139, lng: 77.2090 }}
                markers={ngos.map(ngo => ({
                  position: ngo.location,
                  title: ngo.organization_name,
                  type: 'ngo'
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery History */}
        {deliveries.filter(d => ['delivered', 'confirmed'].includes(d.status)).length > 0 && (
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="font-heading">Delivery History</CardTitle>
              <CardDescription>Your completed deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveries.filter(d => ['delivered', 'confirmed'].includes(d.status)).map((delivery) => (
                  <div 
                    key={delivery.id} 
                    className="p-4 rounded-xl border border-stone-200"
                    data-testid={`history-${delivery.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{delivery.dropoff_address}</p>
                        <p className="text-sm text-muted-foreground">
                          Delivered on {new Date(delivery.delivered_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(delivery.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

