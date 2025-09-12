import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Plus, Eye, Edit, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const initialOrders = [
  {
    id: 'ORD001',
    vendorName: 'Fresh Foods Suppliers',
    date: '2024-01-15',
    items: ['Basmati Rice', 'Toor Dal'],
    status: 'Pending',
    totalAmount: null
  },
  {
    id: 'ORD002',
    vendorName: 'Grain Masters',
    date: '2024-01-14',
    items: ['Refined Oil'],
    status: 'Completed',
    totalAmount: 2500
  }
];

const vendors = ['Fresh Foods Suppliers', 'Grain Masters', 'Spice World'];
const availableItems = [
  'Basmati Rice', 'Toor Dal', 'Refined Oil', 'Onions', 'Turmeric Powder',
  'Wheat Flour', 'Sugar', 'Salt', 'Cumin Seeds', 'Coriander Seeds'
];

export function OrdersModule() {
  const [orders, setOrders] = useState(initialOrders);
  const [showPlaceOrderDialog, setShowPlaceOrderDialog] = useState(false);
  const [showEditOrderDialog, setShowEditOrderDialog] = useState(false);
  const [showViewOrderDialog, setShowViewOrderDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [orderFormData, setOrderFormData] = useState({
    orderType: 'single',
    vendor: '',
    singleItem: '',
    multipleItems: [],
    bulkItems: [],
    quantity: '',
    notes: ''
  });
  const [editFormData, setEditFormData] = useState({
    itemPrices: []
  });

  const generateOrderId = () => {
    const lastId = orders.length > 0 ? 
      Math.max(...orders.map(order => parseInt(order.id.replace('ORD', '')))) : 0;
    return `ORD${String(lastId + 1).padStart(3, '0')}`;
  };

  const handlePlaceOrder = () => {
    if (!orderFormData.vendor) {
      toast.error('Please select a vendor');
      return;
    }

    let selectedItems = [];
    if (orderFormData.orderType === 'single') {
      if (!orderFormData.singleItem) {
        toast.error('Please select an item');
        return;
      }
      selectedItems = [orderFormData.singleItem];
    } else {
      const validBulkItems = orderFormData.bulkItems.filter(item => item.name && item.quantity);
      if (validBulkItems.length === 0) {
        toast.error('Please add at least one item with quantity');
        return;
      }
      selectedItems = validBulkItems.map(item => `${item.name} (${item.quantity})`);
    }

    const newOrder = {
      id: generateOrderId(),
      vendorName: orderFormData.vendor,
      date: new Date().toISOString().split('T')[0],
      items: selectedItems,
      status: 'Pending',
      totalAmount: null,
      quantity: orderFormData.quantity,
      notes: orderFormData.notes
    };

    setOrders([...orders, newOrder]);
    toast.success('Order placed successfully!');
    
    setOrderFormData({
      orderType: 'single',
      vendor: '',
      singleItem: '',
      multipleItems: [],
      bulkItems: [],
      quantity: '',
      notes: ''
    });
    setShowPlaceOrderDialog(false);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setEditFormData({
      itemPrices: order.items.map(item => ({ item, price: '' }))
    });
    setShowEditOrderDialog(true);
  };

  const handleViewOrder = (order) => {
    setViewingOrder(order);
    setShowViewOrderDialog(true);
  };

  const handleUpdateOrder = () => {
    const totalAmount = editFormData.itemPrices.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);

    setOrders(orders.map(order => 
      order.id === editingOrder.id 
        ? { ...order, status: 'Completed', totalAmount }
        : order
    ));
    toast.success('Order updated successfully!');
    setShowEditOrderDialog(false);
  };

  const handleMultipleItemChange = (item, checked) => {
    if (checked) {
      setOrderFormData({
        ...orderFormData,
        multipleItems: [...orderFormData.multipleItems, item]
      });
    } else {
      setOrderFormData({
        ...orderFormData,
        multipleItems: orderFormData.multipleItems.filter(i => i !== item)
      });
    }
  };

  const addBulkItem = () => {
    setOrderFormData({
      ...orderFormData,
      bulkItems: [...orderFormData.bulkItems, { name: '', quantity: '' }]
    });
  };

  const removeBulkItem = (index) => {
    if (orderFormData.bulkItems.length > 1) {
      const newBulkItems = orderFormData.bulkItems.filter((_, i) => i !== index);
      setOrderFormData({ ...orderFormData, bulkItems: newBulkItems });
    }
  };

  const updateBulkItem = (index, field, value) => {
    const newBulkItems = [...orderFormData.bulkItems];
    newBulkItems[index][field] = value;
    setOrderFormData({ ...orderFormData, bulkItems: newBulkItems });
  };

  // Initialize bulk items when switching to bulk mode
  React.useEffect(() => {
    if (orderFormData.orderType === 'bulk' && orderFormData.bulkItems.length === 0) {
      setOrderFormData({
        ...orderFormData,
        bulkItems: [{ name: '', quantity: '' }]
      });
    }
  }, [orderFormData.orderType]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">Manage vendor orders and purchases</p>
        </div>
        <Dialog open={showPlaceOrderDialog} onOpenChange={setShowPlaceOrderDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Place Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Place New Order</DialogTitle>
              <DialogDescription>Create a new order for vendor supplies</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Order Type</Label>
                <RadioGroup 
                  value={orderFormData.orderType} 
                  onValueChange={(value) => setOrderFormData({ ...orderFormData, orderType: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single Item</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bulk" id="bulk" />
                    <Label htmlFor="bulk">Bulk Items</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor Name *</Label>
                <Select
                  value={orderFormData.vendor}
                  onValueChange={(value) => setOrderFormData({ ...orderFormData, vendor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {orderFormData.orderType === 'single' ? (
                <div className="space-y-2">
                  <Label htmlFor="singleItem">Select Item *</Label>
                  <Select
                    value={orderFormData.singleItem}
                    onValueChange={(value) => setOrderFormData({ ...orderFormData, singleItem: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map(item => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Items with Quantities *</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addBulkItem}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {orderFormData.bulkItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground mb-1 block">Item Name</Label>
                          <Select
                            value={item.name}
                            onValueChange={(value) => updateBulkItem(index, 'name', value)}
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
                        
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground mb-1 block">Quantity</Label>
                          <Input
                            placeholder="e.g., 10 kg, 5 liters"
                            value={item.quantity}
                            onChange={(e) => updateBulkItem(index, 'quantity', e.target.value)}
                          />
                        </div>
                        
                        {orderFormData.bulkItems.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeBulkItem(index)}
                            className="text-red-600 hover:text-red-600 mt-5"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {orderFormData.bulkItems.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground border rounded-lg border-dashed">
                      Click "Add Item" to start adding items
                    </div>
                  )}
                </div>
              )}

              {orderFormData.orderType === 'single' && (
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={orderFormData.quantity}
                    onChange={(e) => setOrderFormData({ ...orderFormData, quantity: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes or instructions"
                  value={orderFormData.notes}
                  onChange={(e) => setOrderFormData({ ...orderFormData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowPlaceOrderDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePlaceOrder}>
                  Place Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
          <CardDescription>All orders placed with vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Item Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">{order.id}</TableCell>
                  <TableCell>{order.vendorName}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-medium">{order.items.length}</span>
                      <span className="text-muted-foreground ml-1">
                        {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.totalAmount ? `₹${order.totalAmount}` : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOrder(order)}
                        disabled={order.status === 'Completed'}
                        title="Edit Order"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={showViewOrderDialog} onOpenChange={setShowViewOrderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Complete information about the selected order</DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm text-muted-foreground">Order ID</Label>
                  <p className="font-mono">{viewingOrder.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p>{new Date(viewingOrder.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric'
                  })}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Vendor</Label>
                  <p>{viewingOrder.vendorName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge variant={viewingOrder.status === 'Completed' ? 'default' : 'secondary'}>
                    {viewingOrder.status}
                  </Badge>
                </div>
                {viewingOrder.totalAmount && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">Total Amount</Label>
                    <p className="text-lg">₹{viewingOrder.totalAmount.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <Label className="text-sm text-muted-foreground mb-3 block">Ordered Items</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item}</TableCell>
                          <TableCell>{viewingOrder.quantity || 'Not specified'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {viewingOrder.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Additional Information */}
              {viewingOrder.notes && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Notes</Label>
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-sm">{viewingOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Order Timeline */}
              <div>
                <Label className="text-sm text-muted-foreground mb-3 block">Order Timeline</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Order Placed</p>
                      <p className="text-xs text-muted-foreground">{new Date(viewingOrder.date).toLocaleString()}</p>
                    </div>
                  </div>
                  {viewingOrder.status === 'Completed' && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Order Completed</p>
                        <p className="text-xs text-muted-foreground">Updated with pricing information</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowViewOrderDialog(false)}>
                  Close
                </Button>
                {viewingOrder.status === 'Pending' && (
                  <Button onClick={() => {
                    setShowViewOrderDialog(false);
                    handleEditOrder(viewingOrder);
                  }}>
                    Edit Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={showEditOrderDialog} onOpenChange={setShowEditOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Update order details and add item prices</DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Order ID: {editingOrder.id} | Vendor: {editingOrder.vendorName}
              </div>
              
              <div className="space-y-3">
                <Label>Enter Item Prices</Label>
                {editFormData.itemPrices.map((itemPrice, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Label className="min-w-[120px]">{itemPrice.item}</Label>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      value={itemPrice.price}
                      onChange={(e) => {
                        const newPrices = [...editFormData.itemPrices];
                        newPrices[index].price = e.target.value;
                        setEditFormData({ ...editFormData, itemPrices: newPrices });
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditOrderDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateOrder}>
                  Update Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}