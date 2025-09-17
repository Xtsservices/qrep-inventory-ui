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

  // ✅ Include kg + litres
  const [formData, setFormData] = useState({ 
    name: '', 
    type: '', 
    status: '1',
    units: '',
    kg: '',
    grams: '',
    litres: '',
    
  });

  const [statusFilter, setStatusFilter] = useState('all');

  const itemTypes = ['Grains', 'Pulses', 'Oil', 'Vegetables', 'Spices', 'Dairy', 'Others'];

  // -----------------------------
  // FETCH ITEMS
  // -----------------------------
  const fetchItems = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      const raw = Array.isArray(data) ? data : data.data || [];

      const normalizedItems = raw.map((item) => {
        const id = item.item_id ?? item.id ?? item.itemId ?? null;
        const name = item.item_name ?? item.name ?? item.itemName ?? '';
        const type = item.type ?? item.item_type ?? item.category ?? '';
       let status_id = Number(item.status_id ?? item.statusId ?? item.status ?? 1);
if (![1, 2].includes(status_id)) status_id = 1; // default only if truly missing

const status = status_id === 1 ? "Active" : "Inactive";

        const units = item.units ?? '';
        const grams = item.grams ?? '';
        const kg = item.kg ?? item.kilograms ?? '';
        const litres = item.litres ?? '';
        return { id, name, type, status_id, status, units, kg, grams, litres };
      });

      setItems(normalizedItems.reverse());
    } catch (err) {
      console.error(err);
      toast.error('Error fetching items');
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
  // SUBMIT ADD OR EDIT
  // -----------------------------
const handleSubmit = async () => {
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

    const payload = {
      item_name: nameTrimmed,
      type: typeTrimmed,
      status_id: Number(formData.status),
      units: Number(formData.units) || 0,
      kg: Number(formData.kg) || 0,
      grams: Number(formData.grams) || 0,
      litres: Number(formData.litres) || 0,
    };

    try {
      const res = editingItem
        ? await fetch(`${API_URL}/${editingItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        toast.error('This item already exists!');
        return;
      }

      if (!res.ok) throw new Error(data.error || data.message || 'Something went wrong');

      toast.success(editingItem ? 'Item updated successfully!' : 'Item added successfully!');
      await fetchItems();
      handleCloseDialog();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    }
  };

  // -----------------------------
  // EDIT & DELETE (mark inactive)
  // -----------------------------
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      status: item.status_id.toString(),
      units: item.units,
      kg: item.kg,
      grams: item.grams,
      litres: item.litres,
    });
    setShowDialog(true);
  };
const handleDelete = async (item) => {
  if (!confirm(`Are you sure you want to mark "${item.name}" as Inactive?`)) return;

  try {
    const payload = {
      item_name: item.name,
      item_type: item.type,
      status_id: 2, // mark as inactive
    };

    const itemId = item.id ?? item.item_id;
    if (!itemId) throw new Error('Item ID missing');

    const res = await fetch(`${API_URL}/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Try to parse backend error message
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || 'Failed to update item');
    }

    toast.success(`Item "${item.name}" marked as Inactive!`);
    await fetchItems();
  } catch (err) {
    console.error(err);
    toast.error(err.message || 'Something went wrong while marking item inactive');
  }
};


  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingItem(null);
    setFormData({ name: '', type: '', status: '1', units: '', kg: '', grams: '', litres: '' });
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

                {/* ✅ Units, Kg, Grams, Litres side by side */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Units</Label>
                    <Input
                      type="number"
                      name="units"
                      value={formData.units}
                      onChange={handleChange}
                      placeholder="Enter units"
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
                    />
                  </div>
                </div>

                <div className="space-y-2">
  <Label htmlFor="type">Item Type *</Label>
  <Select
    value={formData.type || ''}     // ✅ ensure correct value is passed
    onValueChange={handleTypeChange}
  >
    <SelectTrigger>
      {/* ✅ show selected type instead of placeholder */}
      <SelectValue placeholder="Select item type">
        {formData.type || 'Select item type'}
      </SelectValue>
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
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingItem ? 'Update' : 'Add'} Item
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item, index) => (
                <TableRow key={item.id ?? index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
 <TableCell>
                    {[item.units ? `${item.units} Units` : null, item.kg ? `${item.kg} Kg` : null, item.grams ? `${item.grams} g` : null, item.litres ? `${item.litres} L` : null]
                      .filter(Boolean)
                      .join(', ') || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Active' ? 'success' : 'destructive'}>
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
        </CardContent>
      </Card>
    </div>
  );
}
