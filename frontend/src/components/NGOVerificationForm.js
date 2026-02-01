import { useState } from 'react';
import { ngoApi, utilityApi } from '@/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MapComponent } from './MapComponent';
import { 
  Building2, 
  FileText, 
  MapPin, 
  Upload,
  Check,
  Clock,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export const NGOVerificationForm = ({ existingVerification, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organization_name: existingVerification?.organization_name || '',
    registration_number: existingVerification?.registration_number || '',
    address: existingVerification?.address || '',
    city: existingVerification?.city || '',
    state: existingVerification?.state || '',
    pincode: existingVerification?.pincode || '',
    website: existingVerification?.website || '',
    description: existingVerification?.description || '',
    location: existingVerification?.location || null,
    documents: existingVerification?.documents || [],
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({ ...prev, location }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        const response = await utilityApi.uploadFile(file);
        setUploadedFiles(prev => [...prev, { name: file.name, id: response.data.file_id }]);
        setFormData(prev => ({ 
          ...prev, 
          documents: [...prev.documents, response.data.file_id] 
        }));
        toast.success(`Uploaded: ${file.name}`);
      } catch (error) {
        toast.error(`Failed to upload: ${file.name}`);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.organization_name || !formData.registration_number || 
        !formData.address || !formData.city || !formData.state || 
        !formData.pincode || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      await ngoApi.submitVerification(formData);
      toast.success('Verification submitted! Admin will review your application.');
      onSubmit();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationSelect({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success('Location captured!');
        },
        () => toast.error('Could not get your location')
      );
    }
  };

  // If already submitted, show status
  if (existingVerification) {
    return (
      <Card className="border-stone-200 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            NGO Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {existingVerification.status === 'pending' && (
              <>
                <Clock className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium">Pending Review</p>
                  <p className="text-sm text-muted-foreground">
                    Your verification is being reviewed by our admin team.
                  </p>
                </div>
              </>
            )}
            {existingVerification.status === 'rejected' && (
              <>
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Rejected</p>
                  <p className="text-sm text-muted-foreground">
                    Reason: {existingVerification.rejection_reason || 'No reason provided'}
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div className="pt-4 border-t border-stone-200">
            <h4 className="font-medium mb-2">Submitted Details</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>Organization:</strong> {existingVerification.organization_name}</p>
              <p><strong>Registration:</strong> {existingVerification.registration_number}</p>
              <p><strong>Address:</strong> {existingVerification.address}, {existingVerification.city}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">NGO Verification</h1>
        <p className="text-muted-foreground mt-2">
          Complete the verification process to start receiving food donations
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
              s < step ? 'bg-success text-success-foreground' :
              s === step ? 'bg-primary text-primary-foreground' :
              'bg-secondary text-secondary-foreground'
            }`}>
              {s < step ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 3 && <ChevronRight className="h-5 w-5 text-muted-foreground mx-2" />}
          </div>
        ))}
      </div>

      {/* Step 1: Organization Details */}
      {step === 1 && (
        <Card className="border-stone-200" data-testid="verification-step-1">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Step 1: Organization Details
            </CardTitle>
            <CardDescription>
              Provide accurate information about your NGO. All details will be verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organization_name">Organization Name *</Label>
                <Input
                  id="organization_name"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleInputChange}
                  placeholder="Your NGO name"
                  data-testid="org-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number *</Label>
                <Input
                  id="registration_number"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleInputChange}
                  placeholder="NGO registration number"
                  data-testid="reg-number-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address"
                data-testid="address-input"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  data-testid="city-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  data-testid="state-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="Pincode"
                  data-testid="pincode-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://your-ngo.org"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Organization Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your organization and the communities you serve..."
                rows={4}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Organization Location *
              </Label>
              <p className="text-sm text-muted-foreground">
                Select your organization's location on the map for distance-based matching
              </p>
              <div className="flex gap-2 mb-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={useMyLocation}
                  className="rounded-full"
                  data-testid="use-location-btn"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Use My Location
                </Button>
                {formData.location && (
                  <Badge className="bg-success text-success-foreground">
                    <Check className="h-3 w-3 mr-1" />
                    Location set
                  </Badge>
                )}
              </div>
              <div className="h-[300px] rounded-xl overflow-hidden border border-stone-200">
                <MapComponent
                  center={formData.location || { lat: 28.6139, lng: 77.2090 }}
                  onClick={handleLocationSelect}
                  markers={formData.location ? [{ position: formData.location, title: 'Your Location' }] : []}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                className="rounded-full"
                data-testid="next-step-1"
              >
                Next: Upload Documents
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload Documents */}
      {step === 2 && (
        <Card className="border-stone-200" data-testid="verification-step-2">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Step 2: Upload Documents
            </CardTitle>
            <CardDescription>
              Upload required government and identity proofs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Upload NGO Registration Certificate, Address Proof, and other documents
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                All documents must be clear and readable
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                data-testid="file-upload-input"
              />
              <label htmlFor="file-upload">
                <Button asChild className="rounded-full cursor-pointer">
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Select Files
                  </span>
                </Button>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm">{file.name}</span>
                    <Check className="h-4 w-4 text-success ml-auto" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)} 
                className="rounded-full"
              >
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                className="rounded-full"
                data-testid="next-step-2"
              >
                Next: Review & Submit
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <Card className="border-stone-200" data-testid="verification-step-3">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              Step 3: Review & Submit
            </CardTitle>
            <CardDescription>
              Review your information before submitting for admin approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 p-4 bg-secondary/50 rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Organization Name</p>
                  <p className="font-medium">{formData.organization_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registration Number</p>
                  <p className="font-medium">{formData.registration_number}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {formData.address}, {formData.city}, {formData.state} - {formData.pincode}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Documents</p>
                  <p className="font-medium">{uploadedFiles.length} file(s) uploaded</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {formData.location ? `${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}` : 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-warning/10 rounded-xl">
              <p className="text-sm text-warning-foreground">
                <strong>Note:</strong> After submission, your verification will be reviewed by our admin team. 
                You will be notified once approved or if additional information is needed.
              </p>
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep(2)} 
                className="rounded-full"
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="rounded-full"
                disabled={loading}
                data-testid="submit-verification"
              >
                {loading ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

