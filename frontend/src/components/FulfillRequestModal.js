import { useState, useRef } from 'react';
import { donorApi, utilityApi } from '@/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { 
  Heart, 
  Camera, 
  MapPin, 
  Package,
  Upload,
  Check,
  Truck,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export const FulfillRequestModal = ({ request, open, onOpenChange, onSuccess, userLocation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: request?.quantity - (request?.fulfilled_quantity || 0) || '',
    food_condition: '',
    availability_time: '',
    delivery_method: '',
    food_photo: null,
    geo_tag: userLocation || null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      const response = await utilityApi.uploadFile(file);
      setFormData(prev => ({ ...prev, food_photo: response.data.file_id }));
      
      // Get geotag if available
      if (userLocation) {
        setFormData(prev => ({ ...prev, geo_tag: userLocation }));
      }
      
      toast.success('Photo uploaded!');
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            geo_tag: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
          }));
          toast.success('Location captured!');
        },
        () => toast.error('Could not get your location')
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.quantity || !formData.food_condition || 
        !formData.availability_time || !formData.delivery_method) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!formData.food_photo) {
      toast.error('Please upload a photo of the food');
      return;
    }
    
    setLoading(true);
    try {
      const submitData = {
        request_id: request.id,
        quantity: parseInt(formData.quantity),
        food_condition: formData.food_condition,
        availability_time: new Date(formData.availability_time).toISOString(),
        delivery_method: formData.delivery_method,
        food_photo: formData.food_photo,
        geo_tag: formData.geo_tag,
      };
      
      await donorApi.createFulfillment(submitData);
      toast.success('Thank you for your donation!');
      onSuccess();
      
      // Reset form
      setFormData({
        quantity: '',
        food_condition: '',
        availability_time: '',
        delivery_method: '',
        food_photo: null,
        geo_tag: null,
      });
      setPhotoPreview(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit fulfillment');
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;

  const remainingQuantity = request.quantity - (request.fulfilled_quantity || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Heart className="h-5 w-5 text-accent" />
            Fulfill Food Request
          </DialogTitle>
          <DialogDescription>
            Donate food to {request.ngo_name}
          </DialogDescription>
        </DialogHeader>
        
        {/* Request Summary */}
        <div className="p-4 bg-secondary/50 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">NGO</span>
            <span className="font-medium">{request.ngo_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Food Type</span>
            <span className="font-medium capitalize">{request.food_type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Needed</span>
            <span className="font-medium">{remainingQuantity} servings</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Urgency</span>
            <Badge className={
              request.urgency_level === 'critical' ? 'bg-destructive text-destructive-foreground' :
              request.urgency_level === 'high' ? 'bg-accent text-accent-foreground' :
              'bg-warning text-warning-foreground'
            }>
              {request.urgency_level === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {request.urgency_level}
            </Badge>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Donate *</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              max={remainingQuantity}
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder={`Up to ${remainingQuantity} servings`}
              data-testid="donate-quantity-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="food_condition">Food Condition *</Label>
            <Select 
              value={formData.food_condition} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, food_condition: value }))}
            >
              <SelectTrigger data-testid="food-condition-select">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fresh">Fresh - Just prepared</SelectItem>
                <SelectItem value="cooked">Cooked - Within few hours</SelectItem>
                <SelectItem value="packed">Packed - Sealed packaging</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="availability_time">Available From *</Label>
            <Input
              id="availability_time"
              name="availability_time"
              type="datetime-local"
              value={formData.availability_time}
              onChange={handleInputChange}
              data-testid="availability-time-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="delivery_method">Delivery Method *</Label>
            <Select 
              value={formData.delivery_method} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, delivery_method: value }))}
            >
              <SelectTrigger data-testid="delivery-method-select">
                <SelectValue placeholder="Select delivery method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Self Delivery - I will deliver
                  </span>
                </SelectItem>
                <SelectItem value="volunteer">
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Volunteer Delivery - Need pickup
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              Food Photo * (Camera only)
            </Label>
            <p className="text-xs text-muted-foreground">
              Upload a geo-tagged photo of the food for verification
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
              data-testid="photo-input"
            />
            
            {photoPreview ? (
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Food preview" 
                  className="w-full h-48 object-cover rounded-xl"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Retake
                </Button>
                <Badge className="absolute top-2 right-2 bg-success text-success-foreground">
                  <Check className="h-3 w-3 mr-1" />
                  Uploaded
                </Badge>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full h-32 rounded-xl border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <span>Take Photo</span>
                </div>
              </Button>
            )}
          </div>
          
          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Your Location
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={useCurrentLocation}
                className="rounded-full"
                size="sm"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Capture Location
              </Button>
              {formData.geo_tag && (
                <Badge className="bg-success text-success-foreground">
                  <Check className="h-3 w-3 mr-1" />
                  Location captured
                </Badge>
              )}
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
              className="rounded-full bg-accent hover:bg-accent/90"
              disabled={loading}
              data-testid="submit-fulfillment"
            >
              {loading ? 'Submitting...' : 'Donate Food'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};



