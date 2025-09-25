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
    unit: 'units',
    status_id: '1',
  });
  const [errors, setErrors] = useState({});

  const itemTypes = ['Grains', 'Pulses', 'Oil', 'Vegetables', 'Spices', 'Dairy', 'Others'];
  const unitTypes = ['kg', 'grams', 'liters', 'units'];

  // FETCH ITEMS
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await itemsApi.getAll();
      const rawItems = response?.data ?? [];

      const normalizedItems = rawItems.map((item) => {
        const status_id = Number(item.status_id ?? 1);
        return {
          item_id: item.item_id ?? '',
          name: item.name ?? item.item_name ?? 'Unknown',
          type: item.type ?? '',
          unit: item.unit ?? 'units',
          status_id,
          status: status_id === 1 ? 'Active' : 'Inactive',
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

  // VALIDATION
  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') {
      if (!value.trim()) error = 'Item name is required';
      else if (!/^[A-Za-z\s\-&()\.]+$/.test(value.trim()))
        error = 'Only alphabets and - & ( ) . are allowed';
    }
    if (name === 'type' && !value.trim()) error = 'Please select item type';
    if (name === 'unit' && !value.trim()) error = 'Please select unit';
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === '';
  };

  const validateForm = () => {
    const fields = ['name', 'type', 'unit'];
    let valid = true;
    fields.forEach((field) => {
      const value = formData[field] || '';
      if (!validateField(field, value)) valid = false;
    });
    return valid;
  };

  // HANDLE CHANGE
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) validateField(e.target.name, e.target.value);
  };
  const handleTypeChange = (value) => {
    setFormData({ ...formData, type: value });
    if (errors.type) validateField('type', value);
  };
  const handleUnitChange = (value) => {
    setFormData({ ...formData, unit: value });
    if (errors.unit) validateField('unit', value);
  };

  // ADD / EDIT
  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      type: formData.type.trim(),
      unit: formData.unit.trim(),
      status_id: Number(formData.status_id || 1),
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
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // EDIT
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name ?? '',
      type: item.type ?? '',
      unit: item.unit ?? 'units',
      status_id: item.status_id?.toString() ?? '1',
    });
    setErrors({});
    setShowDialog(true);
  };

  // DELETE
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
    setFormData({ name: '', type: '', unit: 'units', status_id: '1' });
    setErrors({});
  };

  const filteredItems = items.filter((item) =>
    statusFilter === 'all' ? true : item.status_id === Number(statusFilter)
  );

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

                {/* Unit */}
                <div className="space-y-1">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit || ''} onValueChange={handleUnitChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitTypes.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unit && <p className="text-red-600 text-xs">{errors.unit}</p>}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="spinner spinner-sm"></div> Saving...
                      </span>
                    ) : editingItem ? 'Update' : 'Add'} Item
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
            <div className="py-8 flex justify-center items-center gap-2">
              <div className="spinner"></div>
              <span>Loading items...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <p className="text-muted-foreground py-8">No items found. Add your first item!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-left">
                {filteredItems.map((item, index) => (
                  <TableRow key={item.item_id ?? index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <Badge variant={item.status_id === 1 ? 'success' : 'destructive'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-left">
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
