import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { User, Upload, Save, X, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileScreenProps {
  currentUser: {
    name?: string;
    mobile?: string;
    avatar?: string;
     logo?: string;
  };
  onUpdateProfile: (updatedUser: any) => void;
  onClose: () => void;
}

export function ProfileScreen({ currentUser, onUpdateProfile, onClose }: ProfileScreenProps) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    mobile: currentUser?.mobile || '',
    avatar: currentUser?.avatar || '',
    logo: currentUser?.logo || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(currentUser?.avatar || '');
  const [previewLogo, setPreviewLogo] = useState(currentUser?.logo || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setIsUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPreviewImage(imageUrl);
        setFormData(prev => ({
          ...prev,
          avatar: imageUrl
        }));
        setIsUploading(false);
        toast.success('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo size should be less than 5MB');
        return;
      }

      setIsUploadingLogo(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setPreviewLogo(logoUrl);
        setFormData(prev => ({
          ...prev,
          logo: logoUrl
        }));
        setIsUploadingLogo(false);
        toast.success('Logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.mobile.trim()) {
      toast.error('Mobile number is required');
      return;
    }

    // Validate mobile number (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      toast.error('Mobile number must be 10 digits');
      return;
    }

    // Update user profile
    const updatedUser = {
      ...currentUser,
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      avatar: formData.avatar,
      logo: formData.logo
    };

    onUpdateProfile(updatedUser);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: currentUser?.name || '',
      mobile: currentUser?.mobile || '',
      avatar: currentUser?.avatar || '',
      logo: currentUser?.logo || ''
    });
    setPreviewImage(currentUser?.avatar || '');
    setPreviewLogo(currentUser?.logo || '');
    setIsEditing(false);
  };

  const removeImage = () => {
    setPreviewImage('');
    setFormData(prev => ({
      ...prev,
      avatar: ''
    }));
    toast.success('Image removed');
  };

  const removeLogo = () => {
    setPreviewLogo('');
    setFormData(prev => ({
      ...prev,
      logo: ''
    }));
    toast.success('Logo removed');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6" />
          <h1 className="text-2xl">Profile Settings</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Manage your profile information and upload a profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {previewImage ? (
                  <AvatarImage src={previewImage} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {formData.name.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                </div>
                
                {previewImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    className="gap-2 text-red-600 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Company Logo Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Company Logo</h3>
              <p className="text-sm text-muted-foreground">Upload your company logo to display in the header</p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  {previewLogo ? (
                    <img src={previewLogo} alt="Company Logo" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Logo</p>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploadingLogo}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUploadingLogo}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                  </div>
                  
                  {previewLogo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeLogo}
                      className="gap-2 text-red-600 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your full name"
                className={!isEditing ? 'bg-muted' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                pattern="[0-9]{10}"
                className={!isEditing ? 'bg-muted' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Enter a 10-digit mobile number without country code
              </p>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <User className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Account Status</p>
              <p>Active</p>
            </div>
            <div>
              <p className="text-muted-foreground">Member Since</p>
              <p>January 2024</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Login</p>
              <p>Today, {new Date().toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Profile Completion</p>
              <p className="flex items-center gap-2">
                {formData.name && formData.mobile && formData.avatar && formData.logo ? (
                  <span className="text-green-600">100% Complete</span>
                ) : (
                  <span className="text-orange-600">
                    {Math.round(
                      ((formData.name ? 1 : 0) + 
                       (formData.mobile ? 1 : 0) + 
                       (formData.avatar ? 1 : 0) + 
                       (formData.logo ? 1 : 0)) / 4 * 100
                    )}% Complete
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}