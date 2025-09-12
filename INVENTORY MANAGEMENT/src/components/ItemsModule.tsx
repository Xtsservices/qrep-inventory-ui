import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const initialItems = [
  { id: 'ITM001', name: 'Basmati Rice', type: 'Grains', status: 'Active' },
  { id: 'ITM002', name: 'Toor Dal', type: 'Pulses', status: 'Active' },
  { id: 'ITM003', name: 'Refined Oil', type: 'Oil', status: 'Inactive' },
  { id: 'ITM004', name: 'Onions', type: 'Vegetables', status: 'Active' },
  { id: 'ITM005', name: 'Turmeric Powder', type: 'Spices', status: 'Active' },
];

export function ItemsModule() {
  const [items, setItems] = useState(initialItems);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: ''
  });

  const itemTypes = ['Grains', 'Pulses', 'Oil', 'Vegetables', 'Spices', 'Dairy', 'Others'];

  const generateItemId = () => {
    const lastId = items.length > 0 ? 
      Math.max(...items.map(item => parseInt(item.id.replace('ITM', '')))) : 0;
    return `ITM${String(lastId + 1).padStart(3, '0')}`;
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.type) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, name: formData.name, type: formData.type }
          : item
      ));
      toast.success('Item updated successfully!');
    } else {
      const newItem = {
        id: generateItemId(),
        name: formData.name,
        type: formData.type,
        status: 'Active'
      };
      setItems([...items, newItem]);
      toast.success('Item added successfully!');
    }

    setFormData({ name: '', type: '' });
    setEditingItem(null);
    setShowAddDialog(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, type: item.type });
    setShowAddDialog(true);
  };

  const handleDelete = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
    toast.success('Item deleted successfully!');
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingItem(null);
    setFormData({ name: '', type: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">Manage your inventory items</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item (Provision)
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update item information' : 'Create a new inventory item'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Item Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item type" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
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

      <Card>
        <CardHeader>
          <CardTitle>Items List</CardTitle>
          <CardDescription>All inventory items in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
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
                        onClick={() => handleDelete(item.id)}
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