import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const initialVendors = [
  {
    id: 'VEN001',
    name: 'Fresh Foods Suppliers',
    mobile: '9876543210',
    contactPerson: 'Rajesh Kumar',
    contactMobile: '9876543210',
    contactEmail: 'rajesh@freshfoods.com',
    gst: 'GST123456789',
    pan: 'ABCDE1234F',
    license: 'LIC123456',
    address: '123 Market Street, Food District, Mumbai, Maharashtra - 400001'
  },
  {
    id: 'VEN002',
    name: 'Grain Masters',
    mobile: '9876543211',
    contactPerson: 'Priya Sharma',
    contactMobile: '9876543211',
    contactEmail: 'priya@grainmasters.com',
    gst: 'GST987654321',
    pan: 'FGHIJ5678K',
    license: 'LIC654321',
    address: '456 Wholesale Market, Grain Complex, Delhi - 110001'
  }
];

export function VendorsModule() {
  const [vendors, setVendors] = useState(initialVendors);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingVendor, setViewingVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    contactPerson: '',
    contactMobile: '',
    contactEmail: '',
    license: '',
    gst: '',
    pan: '',
    address: ''
  });

  const generateVendorId = () => {
    const lastId = vendors.length > 0 ? 
      Math.max(...vendors.map(vendor => parseInt(vendor.id.replace('VEN', '')))) : 0;
    return `VEN${String(lastId + 1).padStart(3, '0')}`;
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.mobile || !formData.contactPerson) {
      toast.error('Please fill all required fields');
      return;
    }

    const newVendor = {
      id: generateVendorId(),
      ...formData
    };
    setVendors([...vendors, newVendor]);
    toast.success('Vendor added successfully!');
    
    setFormData({
      name: '',
      mobile: '',
      contactPerson: '',
      contactMobile: '',
      contactEmail: '',
      license: '',
      gst: '',
      pan: '',
      address: ''
    });
    setShowAddDialog(false);
  };

  const handleView = (vendor) => {
    setViewingVendor(vendor);
    setShowViewDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">Manage your supplier vendors</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>
                Register a new vendor with complete details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vendor Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter vendor name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    placeholder="Enter mobile number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="license">License Number</Label>
                <Input
                  id="license"
                  placeholder="Enter license number"
                  value={formData.license}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Point of Contact</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Enter contact person name"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactMobile">Contact Mobile</Label>
                      <Input
                        id="contactMobile"
                        placeholder="Enter contact mobile"
                        value={formData.contactMobile}
                        onChange={(e) => setFormData({ ...formData, contactMobile: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="Enter contact email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Number</Label>
                  <Input
                    id="gst"
                    placeholder="Enter GST number"
                    value={formData.gst}
                    onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input
                    id="pan"
                    placeholder="Enter PAN number"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  Add Vendor
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendors List</CardTitle>
          <CardDescription>All registered vendors in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.mobile}</TableCell>
                  <TableCell>{vendor.contactPerson}</TableCell>
                  <TableCell className="font-mono text-sm">{vendor.gst}</TableCell>
                  <TableCell className="font-mono text-sm">{vendor.pan}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(vendor)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Vendor Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>Complete vendor information</DialogDescription>
          </DialogHeader>
          {viewingVendor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Vendor Name</Label>
                  <p className="text-sm text-muted-foreground mt-1">{viewingVendor.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Mobile Number</Label>
                  <p className="text-sm text-muted-foreground mt-1">{viewingVendor.mobile}</p>
                </div>
              </div>
              
              <div>
                <Label className="font-medium">License Number</Label>
                <p className="text-sm text-muted-foreground mt-1">{viewingVendor.license || 'Not provided'}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Point of Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Contact Person</Label>
                    <p className="text-sm text-muted-foreground mt-1">{viewingVendor.contactPerson}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Contact Mobile</Label>
                    <p className="text-sm text-muted-foreground mt-1">{viewingVendor.contactMobile || 'Not provided'}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Label className="font-medium">Contact Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">{viewingVendor.contactEmail || 'Not provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">GST Number</Label>
                  <p className="text-sm text-muted-foreground mt-1">{viewingVendor.gst || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="font-medium">PAN Number</Label>
                  <p className="text-sm text-muted-foreground mt-1">{viewingVendor.pan || 'Not provided'}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Full Address</Label>
                <p className="text-sm text-muted-foreground mt-1">{viewingVendor.address || 'Not provided'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}