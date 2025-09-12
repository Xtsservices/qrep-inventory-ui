import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Search } from 'lucide-react';

const initialStock = [
  { id: 1, itemName: 'Basmati Rice', quantity: 45, unit: 'kg', minThreshold: 10, status: 'Available' },
  { id: 2, itemName: 'Toor Dal', quantity: 25, unit: 'kg', minThreshold: 5, status: 'Available' },
  { id: 3, itemName: 'Refined Oil', quantity: 8, unit: 'liters', minThreshold: 10, status: 'Low Stock' },
  { id: 4, itemName: 'Onions', quantity: 0, unit: 'kg', minThreshold: 5, status: 'Unavailable' },
  { id: 5, itemName: 'Turmeric Powder', quantity: 3, unit: 'kg', minThreshold: 2, status: 'Available' },
  { id: 6, itemName: 'Wheat Flour', quantity: 50, unit: 'kg', minThreshold: 15, status: 'Available' },
  { id: 7, itemName: 'Sugar', quantity: 12, unit: 'kg', minThreshold: 8, status: 'Available' },
  { id: 8, itemName: 'Salt', quantity: 0, unit: 'kg', minThreshold: 3, status: 'Unavailable' },
  { id: 9, itemName: 'Cumin Seeds', quantity: 1, unit: 'kg', minThreshold: 2, status: 'Low Stock' },
  { id: 10, itemName: 'Coriander Seeds', quantity: 15, unit: 'kg', minThreshold: 3, status: 'Available' }
];

export function StockAvailabilityModule() {
  const [stock] = useState(initialStock);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Available':
        return 'default';
      case 'Low Stock':
        return 'destructive';
      case 'Unavailable':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'text-green-600';
      case 'Low Stock':
        return 'text-orange-600';
      case 'Unavailable':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredStock = stock.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'available' && item.status === 'Available') ||
                      (activeTab === 'unavailable' && item.status === 'Unavailable') ||
                      (activeTab === 'low-stock' && item.status === 'Low Stock');
    return matchesSearch && matchesTab;
  });

  const stockSummary = {
    available: stock.filter(item => item.status === 'Available').length,
    unavailable: stock.filter(item => item.status === 'Unavailable').length,
    lowStock: stock.filter(item => item.status === 'Low Stock').length,
    total: stock.length
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">Monitor current inventory stock levels</p>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockSummary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stockSummary.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stockSummary.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stockSummary.unavailable}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Inventory</CardTitle>
          <CardDescription>Current stock levels for all items</CardDescription>
          
          {/* Search Bar */}
          <div className="flex items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({stockSummary.total})</TabsTrigger>
              <TabsTrigger value="available">Available ({stockSummary.available})</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock ({stockSummary.lowStock})</TabsTrigger>
              <TabsTrigger value="unavailable">Out of Stock ({stockSummary.unavailable})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Min Threshold</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell>
                        <span className={item.quantity <= item.minThreshold ? getStatusColor(item.status) : ''}>
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.minThreshold}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredStock.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No items found matching your criteria.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}