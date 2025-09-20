import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Eye, Calendar as CalendarIcon, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

const initialRequests = [
  {
    date: '2024-01-15',
    items: [
      { name: 'Basmati Rice', quantity: '10 kg', price: 800 },
      { name: 'Toor Dal', quantity: '5 kg', price: 400 },
      { name: 'Refined Oil', quantity: '2 liters', price: 300 }
    ],
    totalPrice: 1500,
    requestedBy: 'Kitchen Staff',
    status: 'Pending'
  },
  {
    date: '2024-01-14',
    items: [
      { name: 'Onions', quantity: '15 kg', price: 450 },
      { name: 'Turmeric Powder', quantity: '1 kg', price: 150 }
    ],
    totalPrice: 600,
    requestedBy: 'Kitchen Staff',
    status: 'Fulfilled'
  },
  {
    date: '2024-01-13',
    items: [
      { name: 'Wheat Flour', quantity: '20 kg', price: 600 },
      { name: 'Sugar', quantity: '5 kg', price: 250 },
      { name: 'Salt', quantity: '2 kg', price: 40 }
    ],
    totalPrice: 890,
    requestedBy: 'Kitchen Staff',
    status: 'Fulfilled'
  }
];

// static pricing remains unchanged
const itemPricing = {
  'Basmati Rice': 80,
  'Toor Dal': 80,
  'Refined Oil': 150,
  'Onions': 30,
  'Turmeric Powder': 150,
  'Wheat Flour': 30,
  'Sugar': 50,
  'Salt': 20,
  'Cumin Seeds': 400,
  'Coriander Seeds': 300
};

export function InventoryRequestModule() {
  const [requests, setRequests] = useState(initialRequests);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [filterMode, setFilterMode] = useState('all');

  // fetch items from API
  const [availableItems, setAvailableItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('http://172.16.4.139:9000/api/items');
        if (!response.ok) throw new Error('Failed to fetch items');
        const json = await response.json();
        console.log('Items API response:', json);

        // get array from json.data (your API returns { success: true, data: [...] })
        const itemsArray = Array.isArray(json?.data) ? json.data : [];

        // map to names, filter falsy and dedupe
        const itemsList = itemsArray.map(item => item?.name).filter(Boolean);
        const uniqueItems = [...new Set(itemsList)];

        setAvailableItems(uniqueItems);
      } catch (error) {
        console.error('Error fetching items:', error);
        // fallback to default items if API fails
        setAvailableItems([
          'Basmati Rice', 'Toor Dal', 'Refined Oil', 'Onions', 'Turmeric Powder',
          'Wheat Flour', 'Sugar', 'Salt', 'Cumin Seeds', 'Coriander Seeds'
        ]);
      }
    };
    fetchItems();
  }, []);

  const [addFormData, setAddFormData] = useState({
    items: [{ name: '', quantity: '', price: 0 }],
    requestedBy: 'Kitchen Staff'
  });

  const handleViewRequest = (request) => {
    setViewingRequest(request);
    setShowViewDialog(true);
  };

  const handleAddInventoryRequest = () => {
    const validItems = addFormData.items.filter(item => item.name && item.quantity && item.price > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one valid item with name and quantity');
      return;
    }
    const totalPrice = validItems.reduce((sum, item) => sum + item.price, 0);
    const newRequest = {
      date: new Date().toISOString().split('T')[0],
      items: validItems,
      totalPrice,
      requestedBy: addFormData.requestedBy,
      status: 'Pending'
    };
    setRequests([newRequest, ...requests]);
    toast.success('Inventory request added successfully!');
    setAddFormData({
      items: [{ name: '', quantity: '', price: 0 }],
      requestedBy: 'Kitchen Staff'
    });
    setShowAddDialog(false);
  };

  const addItemRow = () => {
    setAddFormData({
      ...addFormData,
      items: [...addFormData.items, { name: '', quantity: '', price: 0 }]
    });
  };

  const removeItemRow = (index) => {
    if (addFormData.items.length > 1) {
      const newItems = addFormData.items.filter((_, i) => i !== index);
      setAddFormData({ ...addFormData, items: newItems });
    }
  };

  const updateItemRow = (index, field, value) => {
    const newItems = [...addFormData.items];
    newItems[index][field] = value;

    // Auto-calculate price when item name or quantity changes
    if (field === 'name' || field === 'quantity') {
      const itemName = field === 'name' ? value : newItems[index].name;
      const quantity = field === 'quantity' ? value : newItems[index].quantity;

      if (itemName && quantity && itemPricing[itemName]) {
        const numericQuantity = parseFloat(quantity.toString().replace(/[^\d.]/g, '')) || 0;
        newItems[index].price = Math.round(itemPricing[itemName] * numericQuantity);
      } else {
        newItems[index].price = 0;
      }
    }

    setAddFormData({ ...addFormData, items: newItems });
  };

  const filteredRequests = useMemo(() => {
    if (filterMode === 'all') return requests;
    if (filterMode === 'single' && selectedDate) {
      return requests.filter(request => {
        const requestDate = new Date(request.date);
        const filterDate = new Date(selectedDate);
        return requestDate.toDateString() === filterDate.toDateString();
      });
    }
    if (filterMode === 'range' && dateRange.from) {
      return requests.filter(request => {
        const requestDate = new Date(request.date);
        const fromDate = new Date(dateRange.from);
        const toDate = dateRange.to ? new Date(dateRange.to) : fromDate;
        return requestDate >= fromDate && requestDate <= toDate;
      });
    }
    return requests;
  }, [requests, filterMode, selectedDate, dateRange]);

  const clearFilters = () => {
    setFilterMode('all');
    setSelectedDate(null);
    setDateRange({ from: null, to: null });
  };

  const handleSingleDateSelect = (date) => {
    setSelectedDate(date);
    setFilterMode('single');
  };

  const handleRangeSelect = (range) => {
    setDateRange(range || { from: null, to: null });
    setFilterMode('range');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted-foreground">Kitchen inventory requests by date</p>
        </div>

        {/* Add Inventory Button and Date Filter Controls */}
        <div className="flex items-center gap-3">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Inventory
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Inventory Request</DialogTitle>
                <DialogDescription>Create a new inventory request for kitchen supplies</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requestedBy">Requested By</Label>
                  <Input
                    id="requestedBy"
                    value={addFormData.requestedBy}
                    onChange={(e) => setAddFormData({ ...addFormData, requestedBy: e.target.value })}
                    placeholder="Enter requester name"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  {addFormData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-3 items-end">
                      <div className="space-y-1">
                        <Label className="text-xs">Item Name</Label>
                        <Select
                          value={item.name}
                          onValueChange={(value) => updateItemRow(index, 'name', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableItems.map(itemName => (
                              <SelectItem key={itemName} value={itemName}>{itemName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          placeholder="e.g., 10 kg"
                          value={item.quantity}
                          onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Price (₹)</Label>
                        <div className="h-10 px-3 py-2 bg-muted/30 border rounded-md flex items-center text-sm">
                          {item.price > 0 ? `₹${item.price}` : 'Auto-calculated'}
                        </div>
                      </div>

                      <div>
                        {addFormData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItemRow(index)}
                            className="text-red-600 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddInventoryRequest}>Add Request</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            {(filterMode !== 'all') && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">
                {filterMode === 'single' && selectedDate && (
                  <span>Date: {new Date(selectedDate).toLocaleDateString()}</span>
                )}
                {filterMode === 'range' && dateRange.from && (
                  <span>
                    {new Date(dateRange.from).toLocaleDateString()}
                    {dateRange.to && ` - ${new Date(dateRange.to).toLocaleDateString()}`}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Filter by Date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant={filterMode === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setFilterMode('all');
                          setSelectedDate(null);
                          setDateRange({ from: null, to: null });
                        }}
                      >
                        All
                      </Button>
                      <Button
                        variant={filterMode === 'single' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterMode('single')}
                      >
                        Single Date
                      </Button>
                      <Button
                        variant={filterMode === 'range' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterMode('range')}
                      >
                        Date Range
                      </Button>
                    </div>
                  </div>

                  {filterMode === 'single' && (
                    <div>
                      <p className="text-sm font-medium mb-2">Select Date:</p>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSingleDateSelect}
                        className="rounded-md border"
                        disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
                      />
                    </div>
                  )}

                  {filterMode === 'range' && (
                    <div>
                      <p className="text-sm font-medium mb-2">Select Date Range:</p>
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={handleRangeSelect}
                        numberOfMonths={2}
                        className="rounded-md border"
                        disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
                      />
                    </div>
                  )}

                  {filterMode !== 'all' && (
                    <div className="flex justify-end pt-2 border-t">
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear Filter
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date-wise Requests</CardTitle>
          <CardDescription>
            {filterMode === 'all'
              ? 'All inventory requests from kitchen staff'
              : `Showing ${filteredRequests.length} filtered request${filteredRequests.length !== 1 ? 's' : ''}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Date</TableHead>
                <TableHead>Items Count</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No requests found for the selected date{filterMode === 'range' ? ' range' : ''}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{formatDate(request.date)}</TableCell>
                    <TableCell>{request.items.length} items</TableCell>
                    <TableCell>₹{request.totalPrice}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* List Count Display */}
          <div className="flex justify-between items-center pt-4 border-t mt-4 text-sm text-muted-foreground">
            <div>
              Showing <span className="font-medium text-foreground">{filteredRequests.length}</span> of{' '}
              <span className="font-medium text-foreground">{requests.length}</span> total requests
              {filterMode !== 'all' && (
                <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                  Filtered
                </span>
              )}
            </div>
            {filteredRequests.length > 0 && (
              <div>
                Total Value: <span className="font-medium text-foreground">
                  ₹{filteredRequests.reduce((sum, request) => sum + request.totalPrice, 0).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>View full details of the inventory request</DialogDescription>
          </DialogHeader>
          {viewingRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p className="font-medium">{formatDate(viewingRequest.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested By</p>
                  <p className="font-medium">{viewingRequest.requestedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge>{viewingRequest.status}</Badge>
                </div>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingRequest.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end pt-2">
                <p className="text-sm font-medium">
                  Total Price: ₹{viewingRequest.totalPrice}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InventoryRequestModule;
