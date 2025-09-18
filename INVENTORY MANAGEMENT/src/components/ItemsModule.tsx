import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'http://172.16.4.40:9000/api/items';

export function ItemsModule() {
  const [items, setItems] = useState([]);
  const [showDialog, setShowDialog] = useState(false);  
  const [editingItem, setEditingItem] = useState(null);

  // ✅ Fixed: Use status_id consistently
  const [formData, setFormData] = useState({ 
    name: '', 
    type: '', 
    status_id: '1',  // ✅ Use status_id, not status
    units: '',
    kg: '',
    grams: '',
    litres: '',
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ Add loading state

  const itemTypes = ['Grains', 'Pulses', 'Oil', 'Vegetables', 'Spices', 'Dairy', 'Others'];

  // -----------------------------
  // FETCH ITEMS
  // -----------------------------
  const fetchItems = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch items");

      const data = await res.json();
      console.log("Fetched items:", data);

      // Backend sometimes returns { data: [...] }
      const raw = Array.isArray(data) ? data : data.data || [];

      const normalizedItems = raw.map((item) => {
        // ✅ Safely handle ID conversion
        const db_id = (item.item_id ?? item.id ?? "").toString().trim(); 
        const safeId = db_id ? String(db_id).trim() : "";
        
        let status_id = Number(item.status_id ?? 1);
        // ✅ ENSURE status_id is always 1 or 2
        if (![1, 2].includes(status_id)) status_id = 1;

        console.log(`Item ${safeId}: raw status_id = ${item.status_id}, normalized = ${status_id}`);

        return {
          item_id: safeId,   // ✅ always string
          name: item.name ?? item.item_name ?? "",
          type: item.type ?? item.item_type ?? "",
          status_id,
          status: status_id === 1 ? "Active" : "Inactive",
          units: item.units ?? "",
          grams: item.grams ?? "",
          kg: item.kg ?? "",
          litres: item.litres ?? "",
        };
      });

      console.log("Normalized items:", normalizedItems.slice(0, 3));
      setItems(normalizedItems.reverse());
    } catch (err) {
      console.error("Fetch items error:", err);
      toast.error("Error fetching items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // -----------------------------
  // HANDLE FORM CHANGES
  // -----------------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value) => setFormData({ ...formData, type: value });

  // -----------------------------
  // SUBMIT ADD OR EDIT - COMPLETELY FIXED
  // -----------------------------
  const handleSubmit = async () => {
    if (isSubmitting) return; // ✅ Prevent double submit

    const nameTrimmed = (formData.name || '').trim();
    const typeTrimmed = (formData.type || '').trim();

    if (!nameTrimmed || !typeTrimmed) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!/^[A-Za-z\s\-&()\.]+$/.test(nameTrimmed)) {
      toast.error('Item Name should contain only alphabets or allowed characters');
      return;
    }

    if (!formData.units && !formData.kg && !formData.grams && !formData.litres) {
      toast.error('Please enter at least one quantity (Units, Kg, Grams, or Litres)');
      return;
    }

    // Duplicate check before adding
    if (!editingItem) {
      const duplicate = items.find(
        (i) => i.name.toLowerCase() === nameTrimmed.toLowerCase()
      );
      if (duplicate) {
        toast.error(`Item "${nameTrimmed}" already exists!`);
        return;
      }
    }

    // ✅ Create payload with proper typing
    const payload = {
      name: nameTrimmed,
      type: typeTrimmed,
      status_id: Number(formData.status_id || 1), // ✅ Ensure it's a number
      units: Number(formData.units) || 0,
      kg: Number(formData.kg) || 0,
      grams: Number(formData.grams) || 0,
      litres: Number(formData.litres) || 0,
    };

    // ✅ Only add item_id for editing
    if (editingItem) {
      payload.item_id = editingItem.item_id;
    }

    // ✅ Debug: Log payload
    console.log('Submitting payload:', JSON.stringify(payload, null, 2));

    setIsSubmitting(true);

    try {
      const url = editingItem 
        ? `${API_URL}/${editingItem.item_id}` 
        : API_URL;
      
      const method = editingItem ? 'PUT' : 'POST';

      console.log(`Making ${method} request to:`, url);

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log(`Response status: ${res.status}`);

      // ✅ Handle response safely
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        data = { message: 'Invalid response format' };
      }

      console.log('Response data:', data);

      if (res.status === 409) {
        toast.error('This item already exists!');
        return;
      }

      if (!res.ok) {
        const errorMsg = data.error || data.message || `Server error: ${res.status}`;
        throw new Error(errorMsg);
      }

      toast.success(editingItem ? 'Item updated successfully!' : 'Item added successfully!');
      await fetchItems();
      handleCloseDialog();
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err.message || 'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------------
  // EDIT - FIXED STATUS MAPPING
  // -----------------------------
  const handleEdit = (item) => {
    console.log('Editing item:', item); // ✅ Debug log
    
    setEditingItem(item);
    setFormData({
      name: item.name ?? '',
      type: item.type ?? '',
      status_id: item.status_id?.toString() ?? '1', // ✅ Fixed: Use status_id
      units: item.units ?? '',
      kg: item.kg ?? '',
      grams: item.grams ?? '',
      litres: item.litres ?? '',
    });
    setShowDialog(true);
  };

  // -----------------------------
  // DELETE (mark inactive)
  // -----------------------------
  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to mark "${item.name}" as Inactive?`)) return;

    try {
      const itemId = item?.item_id?.toString().trim();
      if (!itemId) throw new Error("Item ID is required");

      console.log('Deleting item ID:', itemId);

      const res = await fetch(`${API_URL}/${itemId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      console.log(`Delete response status: ${res.status}`);

      if (!res.ok) {
        let data;
        try {
          data = await res.json();
        } catch {
          data = { message: 'Invalid response' };
        }
        console.error("Delete error response:", data);
        throw new Error(data.error || data.message || "Failed to update item");
      }

      let successData;
      try {
        successData = await res.json();
      } catch {
        successData = { message: 'Success' };
      }
      
      console.log("Delete success response:", successData);

      toast.success(`Item "${item.name}" marked as Inactive!`);
      await fetchItems();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Something went wrong while marking item inactive");
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingItem(null);
    // ✅ Fixed: Reset with status_id, not status
    setFormData({ 
      name: '', 
      type: '', 
      status_id: '1', 
      units: '', 
      kg: '', 
      grams: '', 
      litres: '' 
    });
  };

  const filteredItems = items.filter((item) =>
    statusFilter === 'all' ? true : item.status_id === Number(statusFilter)
  );

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage your inventory items</p>

        <div className="flex gap-2">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="2">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Add/Edit Dialog */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {editingItem ? 'Edit Item' : 'Add Item'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                <div className="text-sm text-muted-foreground">
                  {editingItem ? 'Update item information' : 'Create a new inventory item'}
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter item name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                {/* Units, Kg, Grams, Litres side by side */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Units</Label>
                    <Input
                      type="number"
                      name="units"
                      value={formData.units}
                      onChange={handleChange}
                      placeholder="Enter units"
                      min="0"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Kg</Label>
                    <Input
                      type="number"
                      name="kg"
                      value={formData.kg}
                      onChange={handleChange}
                      placeholder="Enter Kg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Grams</Label>
                    <Input
                      type="number"
                      name="grams"
                      value={formData.grams}
                      onChange={handleChange}
                      placeholder="Enter grams"
                      min="0"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Litres</Label>
                    <Input
                      type="number"
                      name="litres"
                      value={formData.litres}
                      onChange={handleChange}
                      placeholder="Enter litres"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Item Type *</Label>
                  <Select
                    value={formData.type || ''}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleCloseDialog}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : (editingItem ? 'Update' : 'Add')} Item
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items List</CardTitle>
          <CardDescription>All inventory items in the system</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {items.length === 0 ? (
            <p className="text-muted-foreground py-8">No items found. Add your first item!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">S.No</TableHead>
                  <TableHead className="text-center">Name</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item, index) => (
                  <TableRow key={item.item_id ?? index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      {[item.units ? `${item.units} Units` : null, 
                        item.kg ? `${item.kg} Kg` : null, 
                        item.grams ? `${item.grams} g` : null, 
                        item.litres ? `${item.litres} L` : null]
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={item.status === 'Active' ? 'default' : 'destructive'}
                        className={item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 