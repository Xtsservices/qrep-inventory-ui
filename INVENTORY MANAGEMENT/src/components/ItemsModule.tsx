import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { itemsApi } from '../api/api';

export function ItemsModule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status_id: '1',
    units: '',
    kg: '',
    grams: '',
    litres: '',
  });
  const [errors, setErrors] = useState({});

  const itemTypes = ['Grains', 'Pulses', 'Oil', 'Vegetables', 'Spices', 'Dairy', 'Others'];

  // -----------------------------
  // FETCH ITEMS
  // -----------------------------
const fetchItems = async () => {
  try {
    setLoading(true);
    const response = await itemsApi.getAll();
    const rawItems = response?.data ?? [];

    console.log("API items:", rawItems); // <-- add this line

    const normalizedItems = rawItems.map((item) => {
      const status_id = Number(item.status_id ?? 1);
      return {
        item_id: item.item_id ?? '',
        name: item.name ?? item.item_name ?? item.itemName ?? 'Unknown', // check multiple keys
        type: item.type ?? '', 
        status_id,
        status: status_id === 1 ? 'Active' : 'Inactive',
        units: Number(item.units) || 0,
        kg: Number(item.kg) || 0,
        grams: Number(item.grams) || 0,
        litres: Number(item.litres) || 0,
      };
    });

    setItems(normalizedItems.reverse());
  } catch (err) {
    console.error("Fetch items error:", err);
    toast.error("Error fetching items");
  } finally {
    setLoading(false);
  }
};
  




  useEffect(() => { fetchItems(); }, []);

  // -----------------------------
  // FORM VALIDATION
  // -----------------------------
  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') {
      if (!value.trim()) error = 'Item name is required';
      else if (!/^[A-Za-z\s\-&()\.]+$/.test(value.trim()))
        error = 'Only alphabets and - & ( ) . are allowed';
    }
    if (['units', 'kg', 'grams', 'litres'].includes(name)) {
      if (value && Number(value) < 0) error = 'Value cannot be negative';
    }
    if (name === 'type' && !value.trim()) error = 'Please select item type';
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === '';
  };

  const validateForm = () => {
    const fields = ['name', 'type', 'units', 'kg', 'grams', 'litres'];
    let valid = true;
    fields.forEach((field) => {
      const value = formData[field] || '';
      if (!validateField(field, value)) valid = false;
    });

    if (!formData.units && !formData.kg && !formData.grams && !formData.litres) {
      setErrors((prev) => ({ ...prev, units: 'Enter at least one quantity' }));
      valid = false;
    }
    return valid;
  };

  // -----------------------------
  // HANDLE CHANGE
  // -----------------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) validateField(e.target.name, e.target.value);
  };
  const handleTypeChange = (value) => {
    setFormData({ ...formData, type: value });
    if (errors.type) validateField('type', value);
  };

  // -----------------------------
  // ADD / EDIT SUBMIT
  // -----------------------------
const handleSubmit = async () => {
  if (isSubmitting) return;
  if (!validateForm()) return;

  const itemNameTrimmed = formData.name.trim();
  const typeTrimmed = formData.type.trim();

  // Prevent empty name
  if (!itemNameTrimmed) {
    toast.error("Item name is required");
    return;
  }

  // Check duplicate locally
  if (!editingItem && items.some(i => i.name.toLowerCase() === itemNameTrimmed.toLowerCase())) {
    toast.error(`Item "${itemNameTrimmed}" already exists!`);
    return;
  }

  // Prepare payload for backend
  const payload = {
    name: itemNameTrimmed,   // must always come from form input
    type: typeTrimmed,       // dropdown selection
    status_id: Number(formData.status_id || 1),
    units: Number(formData.units) || 0,
    kg: Number(formData.kg) || 0,
    grams: Number(formData.grams) || 0,
    litres: Number(formData.litres) || 0,
  };

  if (editingItem) payload.item_id = editingItem.item_id;

  setIsSubmitting(true);
  try {
    if (editingItem) {
      await itemsApi.update(editingItem.item_id, payload);
      toast.success("Item updated successfully!");
    } else {
      await itemsApi.add(payload);
      toast.success("Item added successfully!");
    }
    await fetchItems();
    handleCloseDialog();
  } catch (err: any) {
    console.error("Submit error:", err);
    toast.error(err.response?.data?.error || err.message || "Something went wrong");
  } finally {
    setIsSubmitting(false);
  }
};



  // -----------------------------
  // EDIT
  // -----------------------------
  const handleEdit = (item) => {

    const normalizedType =
      itemTypes.find((t) => t.toLowerCase() === (item.type ?? '').toLowerCase().trim()) || '';
    setEditingItem(item);
  setFormData({
  name: item.name ?? item.item_name ?? '', // <-- check both keys
  type: normalizedType,
  status_id: item.status_id?.toString() ?? '1',
  units: item.units ?? '',
  kg: item.kg ?? '',
  grams: item.grams ?? '',
  litres: item.litres ?? '',
});

    setErrors({});
    setShowDialog(true);
  };


  // -----------------------------
  // DELETE (soft delete)
  // -----------------------------
  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to mark "${item.name}" as Inactive?`)) return;
    try {
      await itemsApi.update(item.item_id, { ...item, status_id: 2 });
      toast.success(`Item "${item.name}" marked as Inactive!`);
      await fetchItems();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to mark inactive');
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingItem(null);
    setFormData({ name: '', type: '', status_id: '1', units: '', kg: '', grams: '', litres: '' });
    setErrors({});
  };

  const filteredItems = items.filter((item) =>
    statusFilter === 'all' ? true : item.status_id === Number(statusFilter)
  );

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage your inventory items</p>
        <div className="flex gap-2">
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

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {editingItem ? 'Edit Item' : 'Add Item'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                <div className="text-sm text-muted-foreground">
                  {editingItem ? 'Update item information' : 'Create a new inventory item'}
                </div>
              </DialogHeader>
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    placeholder="Enter item name"
                    className={errors.name ? 'border-red-600' : ''}
                  />
                  {errors.name && <p className="text-red-600 text-xs">{errors.name}</p>}
                </div>

                {/* Quantities */}
                <div className="flex gap-4">
                  {['units', 'kg', 'grams', 'litres'].map((field) => (
                    <div key={field} className="flex-1 space-y-1">
                      <Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                      <Input
                        type="number"
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        onBlur={(e) => validateField(e.target.name, e.target.value)}
                        placeholder={`Enter ${field}`}
                        min="0"
                        step={field === 'kg' || field === 'litres' ? '0.01' : '1'}
                        className={errors[field] ? 'border-red-600' : ''}
                      />
                      {errors[field] && <p className="text-red-600 text-xs">{errors[field]}</p>}
                    </div>
                  ))}
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <Label htmlFor="type">Item Type *</Label>
                  <Select value={formData.type || ''} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypes.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-600 text-xs">{errors.type}</p>}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Add'} Item
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items List</CardTitle>
          <CardDescription>All inventory items in the system</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {loading ? (
            <p className="py-8">Loading items...</p>
          ) : filteredItems.length === 0 ? (
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
                      {[
                        item.units > 0 ? `${item.units} Units` : null,
                        item.kg > 0 ? `${item.kg} Kg` : null,
                        item.grams > 0 ? `${item.grams} g` : null,
                        item.litres > 0 ? `${item.litres} L` : null,
                      ].filter(Boolean).join(', ') || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status_id === 1 ? 'success' : 'destructive'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
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
