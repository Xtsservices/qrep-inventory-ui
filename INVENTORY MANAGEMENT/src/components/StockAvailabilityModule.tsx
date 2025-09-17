import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

export function StockAvailabilityModule() {
  const [stock, setStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch stock data from API
  useEffect(() => {
    axios.get('http://172.16.4.40:9000/api/stocks')
      .then(res => {
        console.log("Raw stock from API:", res.data.data);
        if (res.data.success) {
          const transformed = res.data.data.map(item => ({
  id: item.stock_id,
  itemName: item.item_name,
  quantity: item.quantity !== null && item.quantity !== undefined
    ? parseFloat(item.quantity)
    : 0, // fallback to 0
  unit: item.unit || '-', 
  minThreshold: item.min_threshold !== null && item.min_threshold !== undefined
    ? parseFloat(item.min_threshold)
    : 0,
  status:
    (parseFloat(item.quantity) || 0) === 0 ? 'Unavailable' :
    (parseFloat(item.quantity) || 0) <= (parseFloat(item.min_threshold) || 0) ? 'Low Stock' :
    'Available'
}));

          setStock(transformed);
        }
      })
      .catch(err => console.error('Error fetching stock:', err));
  }, []);

  // Badge variant based on status
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Available': return 'default';
      case 'Low Stock': return 'destructive';
      case 'Unavailable': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'text-green-600';
      case 'Low Stock': return 'text-orange-600';
      case 'Unavailable': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Filter by search + tab
  const filteredStock = stock.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'available' && item.status === 'Available') ||
      (activeTab === 'unavailable' && item.status === 'Unavailable') ||
      (activeTab === 'low-stock' && item.status === 'Low Stock');
    return matchesSearch && matchesTab;
  });

  // Summary counts
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
          <div className="flex items-center gap-2 max-w-sm mt-2">
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
