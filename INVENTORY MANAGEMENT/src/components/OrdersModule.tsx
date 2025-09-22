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

const API_VENDORS = 'http://172.16.4.22:9000/api/vendors';
const API_ITEMS = 'http://172.16.4.22:9000/api/items';
const API_ORDERS = 'http://172.16.4.22:9000/api/orders';

// Units for dropdown
const UNITS = ['KG', 'Liters', 'Pieces', 'Box'];

interface Vendor {
  id: string | number;
  name: string;
}

interface Item {
  id: string | number;
  name: string;
}

interface BulkItem {
  itemId: string;
  quantity: string;
  unit?: string;
}

interface OrderFormData {
  orderType: 'single' | 'bulk';
  vendorId: string;
  singleItemId: string;
  bulkItems: BulkItem[];
  quantity: string;
  unit: string;
  notes: string;
}

interface EditItemData {
  item: string;
  price: string;
}

export function OrdersModule() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showPlaceOrderDialog, setShowPlaceOrderDialog] = useState(false);
  const [showEditOrderDialog, setShowEditOrderDialog] = useState(false);
  const [showViewOrderDialog, setShowViewOrderDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);

  const [orderFormData, setOrderFormData] = useState<OrderFormData>({
    orderType: 'single',
    vendorId: '',
    singleItemId: '',
    bulkItems: [{ itemId: '', quantity: '', unit: '' }],
    quantity: '',
    unit: '',
    notes: ''
  });


  const [editFormData, setEditFormData] = useState<EditItemData[]>([]);

  // Fetch vendors
  useEffect(() => {
    fetch(API_VENDORS)
      .then(res => res.json())
      .then(data => {
        const arr = data.data || [];
        const vendorObjs = arr
          .filter((v: any) => v.vendor_id != null)
          .map((v: any) => ({
            id: String(v.vendor_id),
            name: v.vendor_name || 'Unnamed'
          }));
        setVendors(vendorObjs);
      })
      .catch(err => console.error('Vendor fetch error', err));
  }, []);

  // Fetch items
  useEffect(() => {
    fetch(API_ITEMS)
      .then(res => res.json())
      .then(data => {
        const arr = data.data || [];
        const itemObjs = arr
          .filter((i: any) => i.item_id || i.id)
          .map((i: any) => ({
            id: String(i.item_id || i.id),
            name: i.name || i.item_name || 'Unnamed'
          }));
        setAvailableItems(itemObjs);
      })
      .catch(err => console.error('Items fetch error', err));
  }, []);

  // Fetch orders
  const fetchOrders = () => {
    fetch(API_ORDERS)
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.data || [data]);
        const mapped = arr.map((o: any) => ({
          id: o.order_id,
          vendorName: o.vendor_name,
          date: o.date,
          // items: o.items,
          status: o.status,
          totalAmount: o.total,
          notes: o.notes || '',
          items: o.item_details ? JSON.parse(o.item_details) : [],
        }));
        setOrders(mapped);
      })
      .catch(err => console.error('Orders fetch error', err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Place order
  const handlePlaceOrder = async () => {
    if (!orderFormData.vendorId) return toast.error('Select vendor');

    let items: any[] = [];

    if (orderFormData.orderType === 'single') {
      const selectedItem = availableItems.find(i => i.id === orderFormData.singleItemId);
      if (!selectedItem) return toast.error('Select an item');

      items = [
        {
          item: selectedItem?.name || 'Unnamed',
          quantity: Number(orderFormData.quantity),
          unit: orderFormData.unit,
          price: 0
        }
      ];
    } else {
      const validBulkItems = orderFormData.bulkItems.filter(i => i.itemId && i.quantity);
      if (!validBulkItems.length) return toast.error('Add at least one bulk item');

      items = validBulkItems.map(i => {
        const selectedItem = availableItems.find(ai => ai.id === i.itemId);
        return {
          item: selectedItem?.name || 'Unnamed',
          quantity: Number(i.quantity),
          unit: i.unit,
          price: 0
        };
      });
    }

    const selectedVendor = vendors.find(v => v.id === orderFormData.vendorId);
    if (!selectedVendor) return toast.error('Vendor not found');

    const total = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

    const order_id = `ORD${Date.now()}`;

    try {
      const orderPayload = {
        order_id,
        vendor_name: selectedVendor.name,
        date: new Date(),
        items,
        status: 'Pending',
        total,
        notes: orderFormData.notes
      };

      const res = await fetch(API_ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      toast.success('Order placed successfully!');
      setShowPlaceOrderDialog(false);
      setOrderFormData({
        orderType: 'single',
        vendorId: '',
        singleItemId: '',
        bulkItems: [{ itemId: '', quantity: '', unit: '' }],
        quantity: '',
        unit: '',
        notes: ''
      });
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to place order');
    }
  };

  // Edit order
  const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    setEditFormData(order.items.map((item: any) => ({ item: item.item || item.name, price: item.price || '' })));

    setShowEditOrderDialog(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;


    const totalAmount = editFormData.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const updatedItems = editFormData.map(i => ({
      item: i.item,
      price: i.price,
      quantity: editingOrder.items.find((x: any) => (x.item || x.name) === i.item)?.quantity || 0,
      unit: editingOrder.items.find((x: any) => (x.item || x.name) === i.item)?.unit || ''
    }));

    const payload = {
      vendor_name: editingOrder.vendorName,
      items: updatedItems,
      status: 'Completed',
      total: totalAmount,
      date: new Date()
    };


    try {
      const res = await fetch(`${API_ORDERS}/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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


  const addBulkItem = () =>
    setOrderFormData({
      ...orderFormData,
      bulkItems: [...orderFormData.bulkItems, { itemId: '', quantity: '', unit: '' }]
    });

  const removeBulkItem = (index: number) =>
    setOrderFormData({ ...orderFormData, bulkItems: orderFormData.bulkItems.filter((_, i) => i !== index) });

  const updateBulkItem = (index: number, field: string, value: string) => {
    const newBulk = [...orderFormData.bulkItems];
    (newBulk[index] as any)[field] = value;
    setOrderFormData({ ...orderFormData, bulkItems: newBulk });
  };

  return (
    <div className="space-y-6">

      {/* Header & Place Order Dialog */}
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

                <RadioGroup value={orderFormData.orderType} onValueChange={val => setOrderFormData({ ...orderFormData, orderType: val as any })}>

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

              {/* Vendor */}
              <div className="space-y-2">
                <Label>Vendor *</Label>

                <Select value={orderFormData.vendorId} onValueChange={val => setOrderFormData({ ...orderFormData, vendorId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor">
                      {vendors.find(v => v.id === orderFormData.vendorId)?.name || 'Select vendor'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              </div>

              {/* Items */}
              {orderFormData.orderType === 'single' ? (
                <div className="space-y-2">
                  <Label>Select Item *</Label>

                  <Select value={orderFormData.singleItemId} onValueChange={val => setOrderFormData({ ...orderFormData, singleItemId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Quantity</Label>
                      <Input type="text" value={orderFormData.quantity} onChange={e => setOrderFormData({ ...orderFormData, quantity: e.target.value })} />
                    </div>

                    <div>
                      <Label>Unit</Label>
                      <Select value={orderFormData.unit} onValueChange={val => setOrderFormData({ ...orderFormData, unit: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map(u => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Items with Quantities *</Label>

                    <Button size="sm" variant="outline" onClick={addBulkItem}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  {orderFormData.bulkItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-3 p-3 border rounded-lg">
                      <Select value={item.itemId} onValueChange={val => updateBulkItem(idx, 'itemId', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableItems.map(i => (
                            <SelectItem key={i.id} value={i.id}>
                              {i.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input placeholder="Quantity" value={item.quantity} onChange={e => updateBulkItem(idx, 'quantity', e.target.value)} />

                      <Select value={item.unit || ''} onValueChange={val => updateBulkItem(idx, 'unit', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map(u => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {orderFormData.bulkItems.length > 1 && (
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => removeBulkItem(idx)}>
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>

                <Textarea value={orderFormData.notes} onChange={e => setOrderFormData({ ...orderFormData, notes: e.target.value })} />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowPlaceOrderDialog(false)}>
                  Cancel
                </Button>

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

                  <TableCell>
                    {(() => {
                      const d = new Date(order.date);
                      return d
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                        .replace(/ /g, '-');
                    })()}
                  </TableCell>

                  <TableCell>{order.items?.length}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.totalAmount ? '₹' + order.totalAmount : '-'}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleViewOrder(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEditOrder(order)} disabled={order.status === 'Completed'}>
                      <Edit className="w-4 h-4" />
                    </Button>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      {/* View Order Dialog */}
<Dialog
  open={showViewOrderDialog}
  onOpenChange={(open) => {
    setShowViewOrderDialog(open);
    if (!open) setViewingOrder(null); // reset when closing
  }}
>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>View Order</DialogTitle>
      <DialogDescription>All details of this order</DialogDescription>
    </DialogHeader>

    {viewingOrder ? (
      <div className="space-y-4">
        {/* Order Meta */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong>Vendor:</strong> {viewingOrder.vendorName || viewingOrder.vendor_name || '-'}
          </p>
          <p>
            <strong>Date:</strong>{' '}
            {viewingOrder.date
              ? new Date(viewingOrder.date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                }).replace(/ /g, '-')
              : '-'}
          </p>
          <p>
            <strong>Status:</strong> {viewingOrder.status || '-'}
          </p>
          <p>
            <strong>Notes:</strong> {viewingOrder.notes || '-'}
          </p>
        </div>

        {/* Items Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(viewingOrder.items) && viewingOrder.items.length > 0 ? (
            viewingOrder.items.map((item: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell>{item.name || '-'}</TableCell>
                <TableCell>{item.quantity ?? '-'}</TableCell>
                <TableCell>{item.unit ?? '-'}</TableCell>
                <TableCell>{item.price !== undefined ? '₹' + item.price : '-'}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No items found
              </TableCell>
            </TableRow>
          )}

          </TableBody>
        </Table>

        {/* Total */}
        <div className="flex justify-end font-semibold">
          Total: ₹{viewingOrder.totalAmount ?? viewingOrder.total ?? '-'}
        </div>
      </div>
    ) : (
      <div className="text-center text-muted-foreground py-4">No order selected</div>
    )}
  </DialogContent>
</Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={showEditOrderDialog} onOpenChange={setShowEditOrderDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Update item prices</DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-4">
              {editFormData.map((item, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Item</Label>
                    <Input value={item.item} disabled />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input value={item.price} onChange={e => {
                      const newData = [...editFormData];
                      newData[idx].price = e.target.value;
                      setEditFormData(newData);
                    }} />
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditOrderDialog(false)}>
                  Cancel
                </Button>

                <Button onClick={handleUpdateOrder}>Update Order</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
