import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Plus, Edit, Eye, X } from 'lucide-react';
import { toast } from 'sonner';

const API_VENDORS = 'http://172.16.4.220:9000/api/vendors';
const API_ORDERS = 'http://172.16.4.220:9000/api/orders';

export function OrdersModule() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showPlaceOrderDialog, setShowPlaceOrderDialog] = useState(false);
  const [showEditOrderDialog, setShowEditOrderDialog] = useState(false);
  const [showViewOrderDialog, setShowViewOrderDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);

  const [orderFormData, setOrderFormData] = useState({
    orderType: 'single',
    vendor: '',
    singleItem: '',
    bulkItems: [{ name: '', quantity: '' }],
    quantity: '',
    notes: ''
  });

  const [editFormData, setEditFormData] = useState({
    itemPrices: []
  });

  const [availableItems, setAvailableItems] = useState<string[]>([]);

  // Fetch vendors
  useEffect(() => {
    fetch(API_VENDORS)
      .then(res => res.json())
      .then(data => setVendors(data.data || []))
      .catch(err => console.error('Vendor fetch error', err));
  }, []);

  // Fetch orders
  const fetchOrders = () => {
    fetch(API_ORDERS)
      .then(res => res.json())
      .then(data => setOrders(data.data || []))
      .catch(err => console.error('Orders fetch error', err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Place order
  const handlePlaceOrder = async () => {
    if (!orderFormData.vendor) return toast.error('Select vendor');

    let items: any[] = [];
    if (orderFormData.orderType === 'single') {
      if (!orderFormData.singleItem) return toast.error('Select item');
      items = [{ name: orderFormData.singleItem, quantity: orderFormData.quantity }];
    } else {
      const validBulkItems = orderFormData.bulkItems.filter(i => i.name && i.quantity);
      if (validBulkItems.length === 0) return toast.error('Add at least one item with quantity');
      items = validBulkItems;
    }

    try {
      const res = await fetch(API_ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor: orderFormData.vendor, items, notes: orderFormData.notes })
      });
      if (!res.ok) throw new Error('Failed to place order');
      toast.success('Order placed successfully!');
      setShowPlaceOrderDialog(false);
      setOrderFormData({ orderType: 'single', vendor: '', singleItem: '', bulkItems: [{ name: '', quantity: '' }], quantity: '', notes: '' });
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order');
    }
  };

  // Edit order
  const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    setEditFormData({ itemPrices: order.items.map((item: any) => ({ item, price: item.price || '' })) });
    setShowEditOrderDialog(true);
  };

  const handleUpdateOrder = async () => {
    const totalAmount = editFormData.itemPrices.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const updatedOrder = { ...editingOrder, items: editFormData.itemPrices, totalAmount, status: 'Completed' };

    try {
      const res = await fetch(`${API_ORDERS}/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder)
      });
      if (!res.ok) throw new Error('Failed to update order');
      toast.success('Order updated!');
      setShowEditOrderDialog(false);
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order');
    }
  };

  // View order
  const handleViewOrder = (order: any) => {
    setViewingOrder(order);
    setShowViewOrderDialog(true);
  };

  // Bulk item handlers
  const addBulkItem = () => setOrderFormData({ ...orderFormData, bulkItems: [...orderFormData.bulkItems, { name: '', quantity: '' }] });
  const removeBulkItem = (index: number) => setOrderFormData({ ...orderFormData, bulkItems: orderFormData.bulkItems.filter((_, i) => i !== index) });
  const updateBulkItem = (index: number, field: string, value: string) => {
    const newBulk = [...orderFormData.bulkItems];
    newBulk[index][field] = value;
    setOrderFormData({ ...orderFormData, bulkItems: newBulk });
  };

  return (
    <div className="space-y-6">
      {/* Header & Place Order */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage vendor orders</p>
        <Dialog open={showPlaceOrderDialog} onOpenChange={setShowPlaceOrderDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Place Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Place New Order</DialogTitle>
              <DialogDescription>Create a new order for vendor supplies</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Order Type */}
              <div className="space-y-3">
                <Label>Order Type</Label>
                <RadioGroup value={orderFormData.orderType} onValueChange={(val) => setOrderFormData({ ...orderFormData, orderType: val })}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="single" id="single" /><Label htmlFor="single">Single Item</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="bulk" id="bulk" /><Label htmlFor="bulk">Bulk Items</Label></div>
                </RadioGroup>
              </div>

              {/* Vendor */}
              <div className="space-y-2">
                <Label>Vendor *</Label>
                <Select value={orderFormData.vendor} onValueChange={(val) => setOrderFormData({ ...orderFormData, vendor: val })}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.vendorName || v.name}>{v.vendorName || v.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Items */}
              {orderFormData.orderType === 'single' ? (
                <div className="space-y-2">
                  <Label>Select Item *</Label>
                  <Select value={orderFormData.singleItem} onValueChange={(val) => setOrderFormData({ ...orderFormData, singleItem: val })}>
                    <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                    <SelectContent>{availableItems.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                  </Select>
                  <Label>Quantity</Label>
                  <Input type="number" value={orderFormData.quantity} onChange={(e) => setOrderFormData({ ...orderFormData, quantity: e.target.value })} />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Items with Quantities *</Label>
                    <Button size="sm" variant="outline" onClick={addBulkItem}><Plus className="w-3 h-3 mr-1" />Add Item</Button>
                  </div>
                  {orderFormData.bulkItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 border rounded-lg">
                      <Select value={item.name} onValueChange={(val) => updateBulkItem(idx, 'name', val)}>
                        <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                        <SelectContent>{availableItems.map(it => <SelectItem key={it} value={it}>{it}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input placeholder="Quantity" value={item.quantity} onChange={(e) => updateBulkItem(idx, 'quantity', e.target.value)} />
                      {orderFormData.bulkItems.length > 1 && <Button size="sm" variant="outline" className="text-red-600" onClick={() => removeBulkItem(idx)}><X className="w-3 h-3" /></Button>}
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={orderFormData.notes} onChange={(e) => setOrderFormData({ ...orderFormData, notes: e.target.value })} />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowPlaceOrderDialog(false)}>Cancel</Button>
                <Button onClick={handlePlaceOrder}>Place Order</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Orders List */}
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
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.vendorName}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>{order.items?.length}</TableCell>
                  <TableCell><Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>{order.status}</Badge></TableCell>
                  <TableCell>{order.totalAmount ? `₹${order.totalAmount}` : '-'}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleViewOrder(order)}><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEditOrder(order)} disabled={order.status === 'Completed'}><Edit className="w-4 h-4" /></Button>
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
            <DialogTitle>View Order</DialogTitle>
            <DialogDescription>All details of this order</DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Order ID: {viewingOrder.id} | Vendor: {viewingOrder.vendorName} | Status: {viewingOrder.status}</div>
              <div><p className="font-semibold">Date:</p><p>{new Date(viewingOrder.date).toLocaleString()}</p></div>
              <div><p className="font-semibold">Notes:</p><p>{viewingOrder.notes || '-'}</p></div>
              <div>
                <p className="font-semibold">Items:</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingOrder.items.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{item.name || item.item}</TableCell>
                        <TableCell>{item.quantity || '-'}</TableCell>
                        <TableCell>{item.price ? `₹${item.price}` : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="pt-2 font-semibold">Total Amount: {viewingOrder.totalAmount ? `₹${viewingOrder.totalAmount}` : '-'}</div>
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setShowViewOrderDialog(false)}>Close</Button>
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
                <Button variant="outline" onClick={() => setShowEditOrderDialog(false)}>Cancel</Button>
                <Button onClick={handleUpdateOrder}>Update Order</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
