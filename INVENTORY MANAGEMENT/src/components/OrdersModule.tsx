import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Plus, Edit, Eye, X } from "lucide-react";
import { toast } from "sonner";

import { vendorsApi, itemsApi, ordersApi } from "../api/api";

interface Vendor { id: string; name: string; }
interface Item { id: string; name: string; unit: string; }
interface OrderItem { item_id: number; item_name: string; quantity: number; unit: string; price: number; }
interface Order { id: number; vendorId: number; vendorName: string; date: string; status: string; totalAmount: number; notes: string; items: OrderItem[]; }
interface BulkItem { itemId: string; quantity: string; unit: string; price?: string; }

interface OrderFormData {
  orderType: "single" | "bulk";
  vendorId: string;
  singleItemId: string;
  unit: string; // <-- add this for single item
  bulkItems: BulkItem[];
  quantity: string;
  notes: string;
  price?: string;
}


export function OrdersModule() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showPlaceOrderDialog, setShowPlaceOrderDialog] = useState(false);
  const [showEditOrderDialog, setShowEditOrderDialog] = useState(false);
  const [showViewOrderDialog, setShowViewOrderDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const [orderFormData, setOrderFormData] = useState<OrderFormData>({
    orderType: "single",
    vendorId: "",
    singleItemId: "",
    bulkItems: [{ itemId: "", quantity: "", unit: "" }],
    quantity: "",
    unit: "",
    notes: "",
    price: "",
  });

  const [editFormData, setEditFormData] = useState<OrderItem[]>([]);
  const validUnits = ["kg", "g","litre", "ml", "pcs"];
  const validBackendUnits = ["kg", "g","litre", "ml", "pcs"];


  // Fetch vendors
  useEffect(() => {
    vendorsApi.getAll().then((data: any) => {
      const arr = data.data || [];
      setVendors(arr.map((v: any) => ({
        id: String(v.vendor_id),
        name: v.vendor_name || "Unnamed",
      })));
    }).catch(console.error);
  }, []);

  // Fetch items
useEffect(() => {
  itemsApi.getAll().then((data: any) => {
    const arr = data.data || [];
    setAvailableItems(
      arr.map((i: any) => {
        const unit = (i.unit || "pcs").toLowerCase();
return {
  id: String(i.item_id || i.id),
  name: i.name || i.item_name || "Unnamed",
  unit: validUnits.includes(unit) ? unit : "pcs",
};

      })
    );
  }).catch(console.error);
}, []);


  // Fetch orders
  const fetchOrders = () => {
    ordersApi.getAll().then((res: any) => {
      const arr = res.data || [];
      setOrders(arr.map((o: any) => ({
        id: o.order_id,
        vendorId: o.vendor_id,
        vendorName: o.vendor_name,
        date: o.date,
        status: o.order_status || o.status,
        totalAmount: o.total,
        notes: o.notes || "",
        items: (o.items || []).map((it: any) => {
            const matchedItem = availableItems.find(ai => ai.id === String(it.item_id));
          const backendUnit = (it.unit || matchedItem?.unit || "pcs").toLowerCase();
              const unit = matchedItem?.unit || "pcs";

          return {
            item_id: it.item_id,
            item_name: it.item_name,
            quantity: Number(it.quantity) || 0,
            price: Number(it.price) || 0,
           unit: validBackendUnits.includes(backendUnit) ? backendUnit : "pcs",
          };
        }),
      })));
    }).catch(console.error);
  };
  useEffect(() => { fetchOrders(); }, [availableItems]);

  // Place order
const handlePlaceOrder = async () => {
  let items: OrderItem[] = [];

  try {
    if (orderFormData.orderType === "single") {
      const selectedItem = availableItems.find(i => i.id === orderFormData.singleItemId);
      if (!selectedItem) { toast.error("Please select an item"); return; }

      const quantity = Number(orderFormData.quantity) > 0 ? Number(orderFormData.quantity) : 1;
      const price = Number(orderFormData.price) > 0 ? Number(orderFormData.price) : 1;
  const unit = selectedItem.unit;
items = [{
  item_id: Number(selectedItem.id),
  item_name: selectedItem.name,
  quantity,
  unit: orderFormData.unit, // always comes from state now
  price
}];


    } else {
      items = orderFormData.bulkItems
        .filter(i => i.itemId)
        .map(i => {
          const selectedItem = availableItems.find(ai => ai.id === i.itemId);
          if (!selectedItem) return null;

          const quantity = Number(i.quantity) > 0 ? Number(i.quantity) : 1;
          const price = Number(i.price) > 0 ? Number(i.price) : 0;
          const unit = validUnits.includes((selectedItem.unit || "").toLowerCase())
            ? (selectedItem.unit || "").toLowerCase()
            : "pcs";

          return {
            item_id: Number(selectedItem.id),
            item_name: selectedItem.name,
            quantity,
            price,
            unit,
          };
        })
        .filter(Boolean) as OrderItem[];
    }

    if (!orderFormData.vendorId) { toast.error("Please select a vendor"); return; }
    if (items.length === 0) { toast.error("Please add at least one item"); return; }
    if (items.some(i => !i.unit || i.price <= 0 || i.quantity <= 0)) {
      toast.error("Each item must have a quantity, unit, and positive price"); return;
    }

    const selectedVendor = vendors.find(v => v.id === orderFormData.vendorId);
    if (!selectedVendor) { toast.error("Invalid vendor selected"); return; }

    const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    await ordersApi.create({
      vendor_id: String(selectedVendor.id),
      vendor_name: selectedVendor.name,
      date: new Date(),
      status: "Pending",
      total,
      notes: orderFormData.notes || "-",
      items,
    });

    toast.success("Order placed successfully!");
    setShowPlaceOrderDialog(false);

    setOrderFormData({
      orderType: "single",
      vendorId: "",
      singleItemId: "",
      bulkItems: [{ itemId: "", quantity: "", unit: "" }],
      quantity: "",
      unit: "",
      notes: "",
      price: "",
    });

    fetchOrders();

  } catch (err) {
    console.error("Error creating order:", err);
    toast.error("Failed to place order");
  }
};


  // Edit order
  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditFormData(order.items.map(item => ({ ...item })));
    setShowEditOrderDialog(true);
  };

const handleUpdateOrder = async () => {
  if (!editingOrder?.id) return;

  // Map items properly
  const payloadItems = editFormData.map(item => {
    const matchedItem = availableItems.find(ai => ai.id === String(item.item_id));

    return {
      item_id: item.item_id,
      item_name: item.item_name,
      unit: matchedItem?.unit || "pcs", // always valid unit
      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1, // ensure positive
      price: Number(item.price) > 0 ? Number(item.price) : 0, // ensure positive
    };
  });

  const total = payloadItems.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const payload = {
    vendor_id: editingOrder.vendorId,
    vendor_name: editingOrder.vendorName,
    status: "Completed",
    total,
    items: payloadItems,
  };

  try {
    await ordersApi.update(editingOrder.id, payload);
    toast.success("Order updated successfully!");
    setShowEditOrderDialog(false);

    setOrders(prevOrders =>
      prevOrders.map(o =>
        o.id === editingOrder.id
          ? { ...o, status: "Completed", totalAmount: total, items: payloadItems }
          : o
      )
    );
  } catch (err) {
    console.error("Update order error:", err);
    toast.error("Failed to update order");
  }
};


  const handleViewOrder = (order: Order) => { setViewingOrder(order); setShowViewOrderDialog(true); };

  const addBulkItem = () => setOrderFormData({ ...orderFormData, bulkItems: [...orderFormData.bulkItems, { itemId: "", quantity: "", unit: "" }] });
  const removeBulkItem = (index: number) => setOrderFormData({ ...orderFormData, bulkItems: orderFormData.bulkItems.filter((_, i) => i !== index) });
  const updateBulkItem = (index: number, field: keyof BulkItem, value: string) => { const newBulk = [...orderFormData.bulkItems]; (newBulk[index] as any)[field] = value; setOrderFormData({ ...orderFormData, bulkItems: newBulk }); };

  return (
    <div className="space-y-6">
      {/* Header & Place Order Dialog */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage vendor orders</p>
        <Dialog open={showPlaceOrderDialog} onOpenChange={setShowPlaceOrderDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2"/>Place Order</Button>
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
                <RadioGroup value={orderFormData.orderType} onValueChange={(val: "single" | "bulk") => setOrderFormData({ ...orderFormData, orderType: val })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" /><Label htmlFor="single">Single Item</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bulk" id="bulk" /><Label htmlFor="bulk">Bulk Items</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Vendor */}
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Select value={orderFormData.vendorId} onValueChange={(val: string) => setOrderFormData({ ...orderFormData, vendorId: val })}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Items */}
              {orderFormData.orderType === "single" ? (
                <div className="space-y-2">
                  <Label>Select Item</Label>
<Select
  value={orderFormData.singleItemId}
  onValueChange={(val: string) => {
    const selectedItem = availableItems.find(i => i.id === val);
    setOrderFormData({
      ...orderFormData,
      singleItemId: val,
      unit: selectedItem?.unit || "pcs" // store unit in state
    });
  }}
>
                    <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                    <SelectContent>{availableItems.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid grid-cols-3 gap-3">
  <div>
    <Label>Quantity</Label>
    <Input
      value={orderFormData.quantity}
      onChange={(e) => setOrderFormData({ ...orderFormData, quantity: e.target.value })}
    />
  </div>
  {/* <div>
    <Label>Unit</Label>
    <Select
      value={orderFormData.unit}
      onValueChange={(val: string) => setOrderFormData({ ...orderFormData, unit: val })}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select unit" />
      </SelectTrigger>
      <SelectContent>
        {validBackendUnits.map((u) => (
          <SelectItem key={u} value={u}>{u}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  <div>
    <Label>Price</Label>
    <Input
      value={orderFormData.price}
      onChange={(e) => setOrderFormData({ ...orderFormData, price: e.target.value })}
    />
  </div> */}
</div>

                    <div>
                      <Label>Unit</Label>
                      <Input value={availableItems.find(i => i.id === orderFormData.singleItemId)?.unit || ""} disabled/>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Items with Quantities</Label>
                    <Button size="sm" variant="outline" onClick={addBulkItem}><Plus className="w-3 h-3 mr-1"/>Add Item</Button>
                  </div>
               {orderFormData.bulkItems.map((item, idx) => (
  <div key={idx} className="grid grid-cols-5 gap-3 p-3 border rounded-lg">
    <Select
      value={item.itemId}
onValueChange={(val: string) => {
  updateBulkItem(idx, "itemId", val);
  const selectedItem = availableItems.find(ai => ai.id === val);
  updateBulkItem(idx, "unit", selectedItem?.unit || "pcs"); 
}}

    >
      <SelectTrigger>
        <SelectValue placeholder="Select item" />
      </SelectTrigger>
      <SelectContent>
        {availableItems.map(ai => (
          <SelectItem key={ai.id} value={ai.id}>{ai.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Input
      placeholder="Quantity"
      value={item.quantity}
      onChange={(e) => updateBulkItem(idx, "quantity", e.target.value)}
    />
    <Input
      placeholder="Price"
      value={item.price}
      onChange={(e) => updateBulkItem(idx, "price", e.target.value)}
    />
    <Input
      placeholder="Unit"
      value={
        item.unit ||
        availableItems.find(ai => ai.id === item.itemId)?.unit ||
        ""
      }
      disabled
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
                <Textarea value={orderFormData.notes} onChange={(e) => setOrderFormData({ ...orderFormData, notes: e.target.value })}/>
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
                <TableHead>S NO</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((order, index) => (
                <TableRow key={order.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{order.vendorName}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>{order.items?.length}</TableCell>
                  <TableCell><Badge variant={order.status === "Completed" ? "default" : "secondary"}>{order.status}</Badge></TableCell>
                  <TableCell>
                    {order.status === "Completed" ? 
                    `₹${order.items?.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0)}`
                    
                    :
                    0
                     }
                    </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleViewOrder(order)}><Eye className="w-4 h-4" /></Button>
                    <span title={order.items?.length === 0 ? 'No items to edit' : ''}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditOrder(order)}
                        disabled={order.status === "Completed" || order.items?.length === 0}
                      >
                        <Edit className="w-4 h-4"/>
                      </Button>
                    </span>
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
              <div className="text-sm text-muted-foreground">
                <p><strong>Vendor:</strong> {viewingOrder.vendorName}</p>
                <p><strong>Date:</strong> {new Date(viewingOrder.date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {viewingOrder.status}</p>
                <p><strong>Notes:</strong> {viewingOrder.notes || "-"}</p>
              </div>

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
                  {viewingOrder.items?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.item_name || "-"}</TableCell>
                      <TableCell>{item.quantity || "-"}</TableCell>
                      <TableCell>{item.unit || "-"}</TableCell>
                      <TableCell>{item.price ? "₹" + item.price : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

             <div className="flex justify-end">
  <strong>
    Total: ₹
    {viewingOrder.items?.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
      0
    )}
  </strong>
</div>

            </div>
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
              {editFormData.length === 0 ? (
                <div className="text-red-500 text-sm">No items to edit. Debug: editFormData is empty.<br/>Check if the order has items.</div>
              ) : (
                editFormData.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Item</Label>
                      <Input value={item.item_name} disabled />
                    </div>
                    {/* <div>
                      <Label>Quantity</Label>
                      <Input
                        type="text"
                        value={item.quantity.toString() || ""}
                        onChange={(e) => {
                          const newData = [...editFormData];
                          let val = Number(e.target.value.replace(/\D/g, "")); // keep only digits
                          if (isNaN(val) || val < 0) val = 1;
                          newData[idx].quantity = val;
                          setEditFormData(newData);

                          const newTotal = newData.reduce(
                            (sum, i) => sum + (i.quantity || 0) * (i.price || 0),
                            0
                          );
                          setEditingOrder({ ...editingOrder!, totalAmount: newTotal });
                        }}
                      />
                    </div> */}
                    <div>
                      <Label>Price</Label>
                      <Input
                        type="text"
                        value={item.price ?? ""}
                        onChange={(e) => {
                          const newData = [...editFormData];
                          let val = Number(e.target.value.replace(/\D/g, "")); // keep only digits
                          if (isNaN(val) || val < 0) val = 0;
                          newData[idx].price = val;
                          setEditFormData(newData);

                          const newTotal = newData.reduce(
                            (sum, i) => sum + (i.quantity || 0) * (i.price || 0),
                            0
                          );
                          setEditingOrder({ ...editingOrder!, totalAmount: newTotal });
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
              <div className="flex justify-end gap-2">
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