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

import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'http://172.16.4.151:9000/api/items';

export function ItemsModule() {
  const [items, setItems] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: '' });

  const itemTypes = ['Grains', 'Pulses', 'Oil', 'Vegetables', 'Spices', 'Dairy', 'Others'];

  // -----------------------------
  // FETCH ITEMS
  // -----------------------------
  const fetchItems = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();

      const normalizedItems = (Array.isArray(data) ? data : data?.data || data?.items || []).map(
        (item, index) => ({
          id: item.id ?? item._id ?? index,
          name: item.name,
          type: item.type,
          status: item.status,
        })
      );

      setItems(normalizedItems);
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
  const handleNameChange = (e) => {
    const filtered = e.target.value.replace(/[^A-Za-z\s]/g, '');
    setFormData({ ...formData, name: filtered });
  };

  const handleTypeChange = (value) => {
    setFormData({ ...formData, type: value });
  };

  // -----------------------------
  // SUBMIT ADD OR EDIT
  // -----------------------------
  const handleSubmit = async () => {
    const nameTrimmed = formData.name.trim();
    const typeTrimmed = formData.type.trim().toLowerCase();
    const status = 1;

    if (!nameTrimmed || !typeTrimmed) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(nameTrimmed)) {
      toast.error('Item Name should contain only alphabets');
      return;
    }

    try {
      if (editingItem) {
        // ---------- EDIT ITEM ----------
        const res = await fetch(`${API_URL}/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nameTrimmed, type: typeTrimmed, status }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to update item: ${text}`);
        }

        toast.success('Item updated successfully!');
      } else {
        // ---------- ADD ITEM ----------
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nameTrimmed, type: typeTrimmed, status }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to add item: ${text}`);
        }

        toast.success('Item added successfully!');
      }

      await fetchItems();
      setEditingItem(null);
      setFormData({ name: '', type: '' });
      setShowDialog(false);
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while saving item');
    }
  };

  // -----------------------------
  // EDIT ITEM BUTTON
  // -----------------------------
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, type: item.type });
    setShowDialog(true);
  };

  // -----------------------------
  // DELETE ITEM BUTTON
  // -----------------------------
  const handleDelete = async (item) => {
    try {
      // Using item.id in template literal for the :item_id format
      const res = await fetch(`${API_URL}/${item.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Delete failed: ${text}`);
      }

      toast.success('Item deleted successfully!');
      setItems(items.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while deleting item');
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingItem(null);
    setFormData({ name: '', type: '' });
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage your inventory items</p>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {editingItem ? 'Edit Item' : 'Add Item (Provision)'}
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
                  placeholder="Enter item name (alphabets only)"
                  value={formData.name}
                  onChange={handleNameChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Item Type *</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item type" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>{editingItem ? 'Update' : 'Add'} Item</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-mono">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 1 ? 'default' : 'secondary'}>
                      {item.status === 1 ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
        </CardContent>
      </Card>
    </div>
  );
}
