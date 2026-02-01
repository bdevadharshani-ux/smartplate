import { useState } from 'react';
import { requestApi } from '@/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { MapComponent } from './MapComponent';
import { MapPin, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const CreateRequestModal = ({ open, onOpenChange, onSuccess, verification }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    food_type: '',
    quantity: '',
    urgency_level: 'medium',
    description: '',
    location: verification?.location || null,
    address: verification?.address ? `${verification.address}, ${verification.city}` : '',
    expires_at: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({ ...prev, location }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.food_type || !formData.quantity || !formData.location || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      };
      
      await requestApi.create(submitData);
      toast.success('Food request created! Waiting for admin approval.');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        food_type: '',
        quantity: '',
        urgency_level: 'medium',
        description: '',
        location: verification?.location || null,
        address: verification?.address ? `${verification.address}, ${verification.city}` : '',
        expires_at: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const useNGOLocation = () => {
    if (verification?.location) {
      setFormData(prev => ({ 
        ...prev, 
        location: verification.location,
        address: `${verification.address}, ${verification.city}`
      }));
      toast.success('Using NGO location');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Create Food Request
          </DialogTitle>
          <DialogDescription>
            Submit a new food request for your community
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="food_type">Food Type *</Label>
              <Select 
                value={formData.food_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, food_type: value }))}
              >
                <SelectTrigger data-testid="food-type-select">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cooked">Cooked Food</SelectItem>
                  <SelectItem value="packaged">Packaged Food</SelectItem>
                  <SelectItem value="raw">Raw Ingredients</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (servings) *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Number of servings needed"
                data-testid="quantity-input"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="urgency_level">Urgency Level</Label>
            <Select 
              value={formData.urgency_level} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, urgency_level: value }))}
            >
              <SelectTrigger data-testid="urgency-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Within a week</SelectItem>
                <SelectItem value="medium">Medium - Within 2-3 days</SelectItem>
                <SelectItem value="high">High - Within 24 hours</SelectItem>
                <SelectItem value="critical">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Critical - Immediate
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Additional details about the request..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Full delivery address"
              data-testid="address-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
            <Input
              id="expires_at"
              name="expires_at"
              type="datetime-local"
              value={formData.expires_at}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Pickup Location *
            </Label>
            <div className="flex gap-2 mb-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={useNGOLocation}
                className="rounded-full"
                size="sm"
              >
                Use NGO Location
              </Button>
              {formData.location && (
                <span className="text-sm text-success flex items-center">
                  Location set ✓
                </span>
              )}
            </div>
            <div className="h-[200px] rounded-xl overflow-hidden border border-stone-200">
              <MapComponent
                center={formData.location || { lat: 28.6139, lng: 77.2090 }}
                zoom={14}
                onClick={handleLocationSelect}
                markers={formData.location ? [{ position: formData.location, title: 'Delivery Location', type: 'ngo' }] : []}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="rounded-full"
              disabled={loading}
              data-testid="submit-request"
            >
              {loading ? 'Creating...' : 'Create Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

