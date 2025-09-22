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

  // ✅ import centralized API
  import { vendorsApi, itemsApi, ordersApi } from '../api/api';

  // Units for dropdown
  const UNITS = ["KG", "Liters", "Pieces", "Box"];

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
    orderType: "single" | "bulk";
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
      orderType: "single",
      vendorId: "",
      singleItemId: "",
      bulkItems: [{ itemId: "", quantity: "", unit: "" }],
      quantity: "",
      unit: "",
      notes: "",
    });

    const [editFormData, setEditFormData] = useState<EditItemData[]>([]);

    // Fetch vendors
    useEffect(() => {
      vendorsApi
        .getAll()
        .then((data) => {
          const arr = data.data || [];
          setVendors(
            arr
              .filter((v: any) => v.vendor_id != null)
              .map((v: any) => ({
                id: String(v.vendor_id),
                name: v.vendor_name || "Unnamed",
              }))
          );
        })
        .catch((err) => console.error("Vendor fetch error", err));
    }, []);

    // Fetch items
    useEffect(() => {
      itemsApi
        .getAll()
        .then((data) => {
          const arr = data.data || [];
          setAvailableItems(
            arr
              .filter((i: any) => i.item_id || i.id)
              .map((i: any) => ({
                id: String(i.item_id || i.id),
                name: i.name || i.item_name || "Unnamed",
              }))
          );
        })
        .catch((err) => console.error("Items fetch error", err));
    }, []);

    // Fetch orders
    const fetchOrders = () => {
      ordersApi
        .getAll()
        .then((data) => {
          const arr = Array.isArray(data) ? data : data.data || [data];
          setOrders(
            arr.map((o: any) => ({
              id: o.order_id,
              vendorName: o.vendor_name,
              date: o.date,
              items: o.items,
              status: o.status,
              totalAmount: o.total,
              notes: o.notes || "",
            }))
          );
        })
        .catch((err) => console.error("Orders fetch error", err));
    };

    useEffect(() => {
      fetchOrders();
    }, []);

    // 🔹 Place order
    const handlePlaceOrder = async () => {
      if (!orderFormData.vendorId) return toast.error("Select vendor");

      let items: any[] = [];

      if (orderFormData.orderType === "single") {
        const selectedItem = availableItems.find(
          (i) => i.id === orderFormData.singleItemId
        );
        if (!selectedItem) return toast.error("Select an item");

        items = [
          {
            item: selectedItem.name || "Unnamed",
            quantity: Number(orderFormData.quantity) || 0,
            unit: orderFormData.unit,
            price: Number(orderFormData.price) || 0,
          },
        ];
      } else {
        const validBulkItems = orderFormData.bulkItems.filter(
          (i) => i.itemId && i.quantity
        );
        if (!validBulkItems.length)
          return toast.error("Add at least one bulk item");

        items = validBulkItems.map((i) => {
          const selectedItem = availableItems.find((ai) => ai.id === i.itemId);
          return {
            item: selectedItem?.name || "Unnamed",
            quantity: Number(i.quantity) || 0,
            unit: i.unit,
            price: Number(i.price) || 0,
          };
        });
      }

      const selectedVendor = vendors.find(
        (v) => v.id === orderFormData.vendorId
      );
      if (!selectedVendor) return toast.error("Vendor not found");

      const total = items.reduce((sum, i) => sum + (i.quantity * i.price || 0), 0);

      const itemsForBackend = items.map((i) => ({
        item_name: i.item,
        quantity: i.quantity,
        unit: i.unit,
        price: i.price,
      }));

      try {
    const res = await ordersApi.create({
    vendor_name: selectedVendor.name,
    date: new Date(),
    status: "Pending",
    total,
    items: itemsForBackend,
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
        });

        fetchOrders();
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
      }
    }; // ✅ handlePlaceOrder properly closed

    // 🔹 Edit order
  const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    setEditFormData(
      order.items.map((item: any) => ({
        item: item.item || item.item_name || item.name,
        unit: item.unit || "",
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
      }))
    );
    
    setShowEditOrderDialog(true);
  };



    // 🔹 Update order

  const handleUpdateOrder = async () => {
    if (!editingOrder?.id) {
      alert("Cannot update: no order selected");
      return;
    }

    const payload = {
      vendor_name: editingOrder.vendorName || "Unknown Vendor",
      status: "Completed",
      total: editFormData.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
      ),
      items: editFormData.map((item) => ({
        item_name: item.item,
        unit: item.unit || "",
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
      })),
    };

    try {
      await ordersApi.update(editingOrder.id, payload); // use id, not order_id
      setShowEditOrderDialog(false);
      fetchOrders();
    } catch (err: any) {
      console.error("Failed to update order:", err.response?.data || err.message);
      alert("Failed to update order. Check console for details.");
    }
  };






    // 🔹 View order
    const handleViewOrder = (order: any) => {
      setViewingOrder(order);
      setShowViewOrderDialog(true);
    };

    // 🔹 Bulk item helpers
    const addBulkItem = () =>
      setOrderFormData({
        ...orderFormData,
        bulkItems: [...orderFormData.bulkItems, { itemId: "", quantity: "", unit: "" }],
      });

    const removeBulkItem = (index: number) =>
      setOrderFormData({
        ...orderFormData,
        bulkItems: orderFormData.bulkItems.filter((_, i) => i !== index),
      });

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
  {orders
    .sort((a, b) => a.id - b.id) // ensure frontend sorts by actual order_id
    .map((order, index) => (
      <TableRow key={order.id}>
        {/* Sequential number for display */}
        <TableCell>{index + 1}</TableCell>

        <TableCell>{order.vendorName}</TableCell>

        <TableCell>
          {(() => {
            const d = new Date(order.date);
            return d
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              .replace(/ /g, "-");
          })()}
        </TableCell>

        <TableCell>{order.items?.length}</TableCell>

        <TableCell>
          <Badge
            variant={order.status === "Completed" ? "default" : "secondary"}
          >
            {order.status}
          </Badge>
        </TableCell>

        <TableCell>
          {order.totalAmount ? "₹" + order.totalAmount : "-"}
        </TableCell>

        <TableCell className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewOrder(order)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditOrder(order)}
            disabled={order.status === "Completed"}
          >
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
        <Dialog open={showViewOrderDialog} onOpenChange={setShowViewOrderDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>View Order</DialogTitle>
              <DialogDescription>All details of this order</DialogDescription>
            </DialogHeader>
            {viewingOrder && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Vendor:</strong> {viewingOrder.vendorName}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(viewingOrder.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Status:</strong> {viewingOrder.status}
                  </p>
                  <p>
                    <strong>Notes:</strong> {viewingOrder.notes || '-'}
                  </p>
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
                    {viewingOrder.items?.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{item.item || item.name || '-'}</TableCell>
                        <TableCell>{item.quantity || '-'}</TableCell>
                        <TableCell>{item.unit || '-'}</TableCell>
                        <TableCell>{item.price ? '₹' + item.price : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end">
                  <strong>Total: ₹{viewingOrder.totalAmount}</strong>
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
      {editFormData.map((item, idx) => (
        <div key={idx} className="grid grid-cols-2 gap-3">
          <div>
            <Label>Item</Label>
            <Input value={item.item} disabled />
          </div>
          <div>
            <Label>Price</Label>
            <Input
              value={item.price}
              onChange={(e) => {
                const newData = [...editFormData];
                newData[idx].price = e.target.value;
                setEditFormData(newData);
              }}
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setShowEditOrderDialog(false)}>
          Cancel
        </Button>

      <Button
    onClick={() => handleUpdateOrder(editingOrder)}
  >
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
