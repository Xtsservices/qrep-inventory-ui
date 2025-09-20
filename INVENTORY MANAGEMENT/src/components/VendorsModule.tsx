import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Plus, Eye, Trash } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";


const API_URL = "http://172.16.4.139:9000/api/vendors";

export function VendorsModule() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingVendor, setViewingVendor] = useState<any>(null);

  const [formData, setFormData] = useState({
    vendor_name: "",
    mobile_number: "",
    contact_person: "",
    contact_mobile: "",
    contact_email: "",
    license_number: "",
    gst_number: "",
    pan_number: "",
    full_address: "",
  });

  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    fetchVendors();
  }, []);

  // ✅ Fetch vendors and remove duplicates by mobile_number
  const fetchVendors = async () => {
    try {
      const res = await axios.get(API_URL);
      const raw = res.data.data || [];

      const unique = raw.filter(
        (v: any, i: number, self: any[]) =>
          i === self.findIndex((x) => x.mobile_number === v.mobile_number)
      );

      setVendors(unique);
    } catch (error: any) {
      console.error("Error fetching vendors:", error.response?.data || error.message);
      toast.error("Failed to fetch vendors");
    }
  };

  // ------------------- Form Validation -------------------
  const validateForm = () => {
    const errors: any = {};

    // Vendor Name
    if (!formData.vendor_name.trim()) errors.vendor_name = "Vendor Name is required";

    // Mobile Number
    if (!formData.mobile_number.trim()) {
      errors.mobile_number = "Mobile Number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile_number)) {
      errors.mobile_number = "Enter a valid 10-digit Indian mobile number";
    }

    // License Number (Required)
    if (!formData.license_number.trim()) {
      errors.license_number = "License Number is required";
    } else if (!/^[A-Z0-9\-\/]{3,20}$/.test(formData.license_number)) {
      errors.license_number = "Invalid License Number format";
    }

    // Contact Person
    if (!formData.contact_person.trim()) errors.contact_person = "Contact Person is required";
     // Contact Mobile (now required)
     if (!formData.contact_mobile.trim()) {
       errors.contact_mobile = "Contact Mobile is required";
       } else if (!/^[6-9]\d{9}$/.test(formData.contact_mobile)) {
       errors.contact_mobile = "Enter a valid 10-digit Indian mobile number";
    }
    // Contact Email (optional)
    if (!formData.contact_email.trim()) {
    errors.contact_email = "Contact Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(formData.contact_email)) {
    errors.contact_email = "Invalid email format";
  }

    // GST Number (optional but validated if filled)
    if (!formData.gst_number.trim()) {
    errors.gst_number = "GST Number is required";
  } else if (
    !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst_number)
  ) {
    errors.gst_number = "Invalid GST Number";
  }

    // PAN Number (optional but validated if filled)
    if (!formData.pan_number.trim()) {
    errors.pan_number = "PAN Number is required";
  } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number)) {
    errors.pan_number = "Invalid PAN Number";
  }
   // Full Address (now required)
  if (!formData.full_address.trim()) errors.full_address = "Full Address is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ------------------- Handle Form Submission -------------------
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields");
      document.getElementById("add-vendor-form")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // ✅ Check duplicate mobile locally
    const duplicate = vendors.find((v) => v.mobile_number === formData.mobile_number);
    if (duplicate) {
      toast.error("Vendor with this mobile number already exists");
      return;
    }

    try {
      const payload = { ...formData, created_by: 1 };
      await axios.post(API_URL, payload, { headers: { "Content-Type": "application/json" } });
      toast.success("Vendor added successfully!");
      setFormData({
        vendor_name: "",
        mobile_number: "",
        contact_person: "",
        contact_mobile: "",
        contact_email: "",
        license_number: "",
        gst_number: "",
        pan_number: "",
        full_address: "",
      });
      setFormErrors({});
      fetchVendors();
      setShowAddDialog(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add vendor");
    }
  };

  const handleView = (vendor: any) => {
    setViewingVendor(vendor);
    setShowViewDialog(true);
  };


  const handleDelete = async (vendor_id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;

    try {
      await axios.delete(`${API_URL}/${vendor_id}`);
      toast.success("Vendor deleted successfully!");
      fetchVendors();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete vendor");
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage your supplier vendors</p>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>Register a new vendor with complete details</DialogDescription>
            </DialogHeader>

            <Card>
              <CardContent id="add-vendor-form" className="space-y-6 mt-4">
                {/* Vendor Name & Mobile Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <Label className="font-medium mb-1">Vendor Name*</Label>
                    <Input
                      placeholder="Enter vendor name"
                      value={formData.vendor_name}
                      onChange={(e) =>
                        setFormData({ ...formData, vendor_name: e.target.value })
                      }
                      className={formErrors.vendor_name ? "border-red-600" : ""}
                    />
                    {formErrors.vendor_name && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.vendor_name}</p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <Label className="font-medium mb-1">Mobile Number*</Label>
                    <Input
                      placeholder="Enter mobile number"
                      maxLength={10}
                      value={formData.mobile_number}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, mobile_number: onlyNums });
                      }}
                      className={formErrors.mobile_number ? "border-red-600" : ""}
                    />
                    {formErrors.mobile_number && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.mobile_number}</p>
                    )}
                  </div>
                </div>

                {/* License Number */}
                <div className="flex flex-col">
                  <Label className="font-medium mb-1">License Number*</Label>
                  <Input
                    placeholder="Enter license number"
                    value={formData.license_number}
                    onChange={(e) =>
                      setFormData({ ...formData, license_number: e.target.value })
                    }
                    className={formErrors.license_number ? "border-red-600" : ""}
                  />
                  {formErrors.license_number && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.license_number}</p>
                  )}
                </div>

                {/* Contact Person & Mobile */}
                <p className="font-medium">Point of Contact</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                  <div className="flex flex-col">
                    <Label className="font-medium mb-1">Contact Person*</Label>
                    <Input
                      placeholder="Enter contact person name"
                      value={formData.contact_person}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_person: e.target.value })
                      }
                      className={formErrors.contact_person ? "border-red-600" : ""}
                    />
                    {formErrors.contact_person && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.contact_person}</p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <Label className="font-medium mb-1">Contact Mobile</Label>
                    <Input
                      placeholder="Enter contact mobile"
                      maxLength={10}
                      value={formData.contact_mobile}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, contact_mobile: onlyNums });
                      }}
                      className={formErrors.contact_mobile ? "border-red-600" : ""}
                    />
                    {formErrors.contact_mobile && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.contact_mobile}</p>
                    )}
                  </div>
                </div>

                {/* Contact Email */}
                <div className="flex flex-col">
                  <Label className="font-medium mb-1">Contact Email</Label>
                  <Input
                    placeholder="Enter contact email"
                    value={formData.contact_email}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_email: e.target.value })
                    }
                    className={formErrors.contact_email ? "border-red-600" : ""}
                  />
                  {formErrors.contact_email && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.contact_email}</p>
                  )}
                </div>

                {/* GST & PAN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <Label className="font-medium mb-1">GST Number</Label>
                    <Input
                      placeholder="Enter GST number"
                      value={formData.gst_number}
                      onChange={(e) =>
                        setFormData({ ...formData, gst_number: e.target.value })
                      }
                      className={formErrors.gst_number ? "border-red-600" : ""}
                    />
                    {formErrors.gst_number && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.gst_number}</p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <Label className="font-medium mb-1">PAN Number</Label>
                    <Input
                      placeholder="Enter PAN number"
                      value={formData.pan_number}
                      onChange={(e) =>
                        setFormData({ ...formData, pan_number: e.target.value })
                      }
                      className={formErrors.pan_number ? "border-red-600" : ""}
                    />
                    {formErrors.pan_number && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.pan_number}</p>
                    )}
                  </div>
                </div>

                {/* Full Address */}
                <div className="flex flex-col">
                  <Label className="font-medium mb-1">Full Address</Label>
                  <Input
                    placeholder="Enter complete address"
                    value={formData.full_address}
                    onChange={(e) =>
                      setFormData({ ...formData, full_address: e.target.value })
                    }
                    className={formErrors.full_address ? "border-red-600" : ""}
                  />
                  {formErrors.full_address && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.full_address}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button className="mt-4 w-full md:w-1/3" onClick={handleSubmit}>
                  Add Vendor
                </Button>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vendors List */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors List</CardTitle>
          <CardDescription>All registered vendors in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(vendors) && vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <TableRow key={vendor.vendor_id}>
                    <TableCell>{vendor.vendor_name}</TableCell>
                    <TableCell>{vendor.mobile_number}</TableCell>
                    <TableCell>{vendor.license_number}</TableCell>
                    <TableCell>{vendor.contact_person}</TableCell>
                    <TableCell>{vendor.gst_number}</TableCell>
                    <TableCell>{vendor.pan_number}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(vendor)}
                        className="mr-2"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(vendor.vendor_id)}
                      >
                        <Trash className="w-4 h-4 mr-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No vendors found
                  </TableCell>
                </TableRow>
              )}
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
                  <p className="text-sm text-muted-foreground mt-1">{viewingVendor.vendor_name}</p>
                </div>
                <div>
                  <Label className="font-medium">Mobile Number</Label>
                  <p className="text-sm text-muted-foreground mt-1">{viewingVendor.mobile_number}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">License Number</Label>
                <p className="text-sm text-muted-foreground mt-1">{viewingVendor.license_number}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Point of Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Contact Person</Label>
                    <p className="text-sm text-muted-foreground mt-1">{viewingVendor.contact_person}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Contact Mobile</Label>
                    <p className="text-sm text-muted-foreground mt-1">{viewingVendor.contact_mobile || "Not provided"}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Label className="font-medium">Contact Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">{viewingVendor.contact_email || "Not provided"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">GST Number</Label>
                  <p className="text-sm text-muted-foreground mt-1">{viewingVendor.gst_number || "Not provided"}</p>
                </div>
                <div>
                  <Label className="font-medium">PAN Number</Label>
                  <p className="text-sm text-muted-foreground mt-1">{viewingVendor.pan_number || "Not provided"}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Full Address</Label>
                <p className="text-sm text-muted-foreground mt-1">{viewingVendor.full_address || "Not provided"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
