import { useState, useRef } from "react";
import { donorApi, utilityApi } from "@/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import {
  Heart,
  Camera,
  MapPin,
  Package,
  Check,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const FulfillRequestModal = ({
  request,
  open,
  onOpenChange,
  onSuccess,
  userLocation,
}) => {
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    quantity:
      request?.quantity - (request?.fulfilled_quantity || 0) || "",
    food_condition: "",
    availability_time: "",
    delivery_method: "",
    food_photo: null,
    geo_tag: userLocation || null,
  });

  if (!request) return null;

  const remainingQuantity =
    request.quantity - (request.fulfilled_quantity || 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => setPhotoPreview(event.target.result);
    reader.readAsDataURL(file);

    try {
      const res = await utilityApi.uploadFile(file);
      setFormData((prev) => ({
        ...prev,
        food_photo: res.data.file_id,
        geo_tag: userLocation || prev.geo_tag,
      }));
      toast.success("Photo uploaded!");
    } catch {
      toast.error("Failed to upload photo");
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          geo_tag: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        }));
        toast.success("Location captured!");
      },
      () => toast.error("Could not get location")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      quantity,
      food_condition,
      availability_time,
      delivery_method,
      food_photo,
    } = formData;

    if (
      !quantity ||
      !food_condition ||
      !availability_time ||
      !delivery_method
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!food_photo) {
      toast.error("Please upload food photo");
      return;
    }

    setLoading(true);
    try {
      await donorApi.createFulfillment({
        request_id: request.id,
        quantity: Number(quantity),
        food_condition,
        availability_time: new Date(availability_time).toISOString(),
        delivery_method,
        food_photo,
        geo_tag: formData.geo_tag,
      });

      toast.success("Donation submitted!");
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Failed to submit donation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-accent" />
            Fulfill Food Request
          </DialogTitle>
          <DialogDescription>
            Donate food to {request.ngo_name}
          </DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className="p-4 bg-secondary/50 rounded-xl space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Needed</span>
            <span>{remainingQuantity} servings</span>
          </div>
          <Badge
            className={
              request.urgency_level === "critical"
                ? "bg-destructive"
                : "bg-warning"
            }
          >
            {request.urgency_level === "critical" && (
              <AlertTriangle className="h-3 w-3 mr-1" />
            )}
            {request.urgency_level}
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Label>Quantity *</Label>
          <Input
            type="number"
            name="quantity"
            min="1"
            max={remainingQuantity}
            value={formData.quantity}
            onChange={handleInputChange}
          />

          <Label>Food Condition *</Label>
          <Select
            onValueChange={(v) =>
              setFormData((p) => ({ ...p, food_condition: v }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fresh">Fresh</SelectItem>
              <SelectItem value="cooked">Cooked</SelectItem>
              <SelectItem value="packed">Packed</SelectItem>
            </SelectContent>
          </Select>

          <Label>Available From *</Label>
          <Input
            type="datetime-local"
            name="availability_time"
            value={formData.availability_time}
            onChange={handleInputChange}
          />

          <Label>Delivery Method *</Label>
          <Select
            onValueChange={(v) =>
              setFormData((p) => ({ ...p, delivery_method: v }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select delivery" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self">
                <Package className="h-4 w-4 mr-2" />
                Self delivery
              </SelectItem>
              <SelectItem value="volunteer">
                <Truck className="h-4 w-4 mr-2" />
                Volunteer pickup
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Photo */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={handlePhotoCapture}
          />

          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="rounded-xl"
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current.click()}
            >
              <Camera className="mr-2" /> Take Photo
            </Button>
          )}

          {/* Location */}
          <Button
            type="button"
            variant="outline"
            onClick={useCurrentLocation}
          >
            <MapPin className="mr-2" /> Capture Location
          </Button>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Donate Food"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FulfillRequestModal;
