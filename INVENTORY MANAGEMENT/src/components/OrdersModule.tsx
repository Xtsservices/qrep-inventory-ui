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

const API_VENDORS = 'http://172.16.4.56:9000/api/vendors';
const API_ITEMS = 'http://172.16.4.56:9000/api/items';
const API_ORDERS = 'http://172.16.4.56:9000/api/orders';



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
}

interface OrderFormData {
  orderType: 'single' | 'bulk';
  vendorId: string;
  singleItemId: string;
  bulkItems: BulkItem[];
  quantity: string;
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
    bulkItems: [{ itemId: '', quantity: '' }],
    quantity: '',
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
          id: v.vendor_id.toString(),  // make it string for Select
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
            id: i.item_id || i.id,
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
      .then(data => setOrders(data.data || []))
      .catch(err => console.error('Orders fetch error', err));
  };
  useEffect(() => { fetchOrders(); }, []);
  // Place order
const handlePlaceOrder = async () => {
  if (!orderFormData.vendorId) return toast.error("Select vendor");

  let items: any[] = [];

if (orderFormData.orderType === "single") {
  const selectedItem = availableItems.find(i => i.id.toString() === orderFormData.singleItemId);
  items = [
    {
      id: Number(orderFormData.singleItemId),
      name: selectedItem?.name || "Unnamed",
      quantity: Number(orderFormData.quantity),
      price: 0 // will be updated later
    }
  ];
} else {
  const validBulkItems = orderFormData.bulkItems.filter(
    (i) => i.itemId && i.quantity
  );
  items = validBulkItems.map((i) => {
    const selectedItem = availableItems.find(ai => ai.id.toString() === i.itemId);
    return {
      id: Number(i.itemId),
      name: selectedItem?.name || "Unnamed",
      quantity: Number(i.quantity),
      price: 0
    };
  });
}


 
  const selectedVendor = vendors.find(
    (v) => v.id === orderFormData.vendorId
  );

  if (!selectedVendor) return toast.error("Vendor not found");

  try {
    const res = await fetch(API_ORDERS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorName: selectedVendor.name, // Correct property
        vendorId: Number(selectedVendor.id), // Use numeric ID for stock FK
        items,
        notes: orderFormData.notes
      })
    });

    const data = await res.json();
    console.log("Server response:", data, "Status:", res.status);

    if (!res.ok) throw new Error(data.error || "Failed to place order");

    toast.success("Order placed successfully!");
    setShowPlaceOrderDialog(false);
    setOrderFormData({
      orderType: "single",
      vendorId: "",
      singleItemId: "",
      bulkItems: [{ itemId: "", quantity: "" }],
      quantity: "",
      notes: ""
    });
    fetchOrders();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to place order");
  }
};

  // Edit order
 const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    setEditFormData(order.items.map((item: any) => ({ item: item.name || item.item, price: item.price || '' })));
    setShowEditOrderDialog(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;
    const totalAmount = editFormData.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const updatedOrder = { ...editingOrder, items: editFormData, totalAmount, status: 'Completed' };

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




  const addBulkItem = () => setOrderFormData({
    ...orderFormData,
    bulkItems: [...orderFormData.bulkItems, { itemId: '', quantity: '' }]
  });

  const removeBulkItem = (index: number) =>
    setOrderFormData({ ...orderFormData, bulkItems: orderFormData.bulkItems.filter((_, i) => i !== index) });

  const updateBulkItem = (index: number, field: string, value: string) => {
    const newBulk = [...orderFormData.bulkItems];
    newBulk[index][field as keyof BulkItem] = value;
    setOrderFormData({ ...orderFormData, bulkItems: newBulk });
  };
  console.log("vendors",vendors)
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
                <RadioGroup value={orderFormData.orderType} onValueChange={(val) => setOrderFormData({ ...orderFormData, orderType: val })}>
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
<Select
  value={orderFormData.vendorId}
  onValueChange={(val) => setOrderFormData({ ...orderFormData, vendorId: val })}
>
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
               <Select
  value={orderFormData.singleItemId}
  onValueChange={(val) => setOrderFormData({ ...orderFormData, singleItemId: val })}
>
  <SelectTrigger>
    <SelectValue placeholder="Select item" />
  </SelectTrigger>
  <SelectContent>
    {availableItems
      .filter(item => item && item.id != null) // safety check
      .map(item => (
        <SelectItem key={item.id} value={item.id.toString()}>
          {item.name}
        </SelectItem>
      ))
    }
  </SelectContent>
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
    <Select
      value={item.itemId}
      onValueChange={(val) => updateBulkItem(idx, 'itemId', val)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select item" />
      </SelectTrigger>
      <SelectContent>
        {availableItems
          .filter(i => i && i.id != null)
          .map(i => (
            <SelectItem key={i.id} value={i.id.toString()}>
              {i.name}
            </SelectItem>
          ))
        }
      </SelectContent>
    </Select>

    <Input
      placeholder="Quantity"
      value={item.quantity}
      onChange={(e) => updateBulkItem(idx, 'quantity', e.target.value)}
    />
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
                 {viewingOrder.items?.map((item, idx) => (
  <TableRow key={idx}>
    <TableCell>{item.name || item.item || '-'}</TableCell>
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
        <DialogContent className="max-w-2xl">
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
                {editFormData.map((itemPrice, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Label className="min-w-[120px]">{itemPrice.item}</Label>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      value={itemPrice.price}
                      onChange={(e) => {
                        const newPrices = [...editFormData];
                        newPrices[index].price = e.target.value;
                        setEditFormData(newPrices);
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
