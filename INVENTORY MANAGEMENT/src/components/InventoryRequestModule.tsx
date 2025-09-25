import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Eye, Calendar as CalendarIcon, X, Plus } from "lucide-react";
import { toast } from "sonner";

import { inventoryRequestsApi, itemsApi } from "../api/api"; 

export function InventoryRequestModule() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<any>(null);
  const [filterMode, setFilterMode] = useState<"all" | "single" | "range">("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });

  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [itemPricing, setItemPricing] = useState<Record<string, number>>({});

  const [addFormData, setAddFormData] = useState({
    requestedBy: "Kitchen Staff",
    items: [{ name: "", quantity: "", price: 0 }]
  });

  const normalizeArrayResponse = (res: any) => {
    if (Array.isArray(res)) return res;
    if (res == null) return [];
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (typeof res === "object") {
      for (const k of Object.keys(res)) {
        if (Array.isArray(res[k])) return res[k];
      }
    }
    return [];
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await itemsApi.getAll();
        const arr = normalizeArrayResponse(res);
        const normalized = arr.map((i: any) => ({
          id: i.item_id ?? i.id ?? i._id ?? String(i.name ?? Math.random()),
          name: i.name ?? i.item_name ?? i.title ?? String(i.id ?? i.item_id ?? ""),
          price: Number(i.price ?? i.default_price ?? i.unit_price ?? i.defaultPrice ?? 0),
        }));
        setAvailableItems(normalized);
        const pricingMap: Record<string, number> = {};
        normalized.forEach((it: any) => { pricingMap[it.name] = Number(it.price) || 0; });
        setItemPricing(pricingMap);
      } catch (err) {
        console.error("Failed to fetch items list:", err);
        toast.error("Failed to load items list");
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setLoading(true);
      try {
        const res = await inventoryRequestsApi.getAll();
        const arr = normalizeArrayResponse(res);
        const formatted = arr.map((r: any) => ({
          id: r.id ?? r.request_id ?? r._id,
          date: r.request_date ?? r.date ?? r.created_at,
          requestedBy: r.requested_by || r.requestedBy || "Kitchen Staff",
          items: (r.items || []).map((i: any) => ({
            name: i.item_name ?? i.name,
        const res = await inventoryRequestsApi.getAll();
        const arr = normalizeArrayResponse(res);
        const formatted = arr.map((r: any) => ({
          id: r.id ?? r.request_id ?? r._id,
          date: r.request_date ?? r.date ?? r.created_at,
          requestedBy: r.requested_by || r.requestedBy || "Kitchen Staff",
          items: (r.items || []).map((i: any) => ({
            name: i.item_name ?? i.name,
            quantity: i.quantity,
            price: Number(i.price) || 0
            price: Number(i.price) || 0
          })),
          totalPrice: Number(r.total_price) || (r.items ? r.items.reduce((sum: number, i: any) => sum + Number(i.price || 0), 0) : 0),
          totalPrice: Number(r.total_price) || (r.items ? r.items.reduce((sum: number, i: any) => sum + Number(i.price || 0), 0) : 0),
        }));
        setRequests(formatted);
      } catch (err) {
        console.error("Failed to load inventory requests:", err);
        console.error("Failed to load inventory requests:", err);
        toast.error("Failed to load inventory requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleViewRequest = (request: any) => {
    setViewingRequest(request);
    setShowViewDialog(true);
  };

  const addItemRow = () => {
    setAddFormData({ ...addFormData, items: [...addFormData.items, { name: "", quantity: "", price: 0 }] });
  };

  const removeItemRow = (index: number) => {
    if (addFormData.items.length > 1) {
      setAddFormData({ ...addFormData, items: addFormData.items.filter((_, i) => i !== index) });
    }
  };

  // ✅ Updated: removed auto price calculation
  const updateItemRow = (index: number, field: string, value: any) => {
    const newItems = [...addFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setAddFormData({ ...addFormData, items: newItems });
  };

  const handleAddInventoryRequest = async () => {
    const validItems = addFormData.items.filter(i => i.name && i.quantity && Number(i.price) > 0);
    const validItems = addFormData.items.filter(i => i.name && i.quantity && Number(i.price) > 0);
    if (!validItems.length) {
      toast.error("Please add at least one valid item");
      return;
    }

    const payload = {
      requested_by: addFormData.requestedBy,
      items: validItems.map(i => ({ item_name: i.name, quantity: i.quantity, price: i.price }))
    };

    try {
      await inventoryRequestsApi.add(payload);
      toast.success("Inventory request added successfully!");

      const res = await inventoryRequestsApi.getAll();
      const arr = normalizeArrayResponse(res);
      const formatted = arr.map((r: any) => ({
        id: r.id ?? r.request_id ?? r._id,
        date: r.request_date ?? r.date ?? r.created_at,
        requestedBy: r.requested_by || r.requestedBy || "Kitchen Staff",
        items: (r.items || []).map((i: any) => ({
          name: i.item_name ?? i.name,
          quantity: i.quantity,
          price: Number(i.price) || 0
          price: Number(i.price) || 0
        })),
        totalPrice: Number(r.total_price) || (r.items ? r.items.reduce((sum: number, i: any) => sum + Number(i.price || 0), 0) : 0),
        totalPrice: Number(r.total_price) || (r.items ? r.items.reduce((sum: number, i: any) => sum + Number(i.price || 0), 0) : 0),
      }));
      setRequests(formatted);


      setShowAddDialog(false);
      setAddFormData({ requestedBy: "Kitchen Staff", items: [{ name: "", quantity: "", price: 0 }] });
    } catch (err) {
      console.error("Failed to add inventory request:", err);
      console.error("Failed to add inventory request:", err);
      toast.error("Failed to add inventory request");
    }
  };

  const filteredRequests = useMemo(() => {
    if (filterMode === "all") return requests;
    if (filterMode === "single" && selectedDate) {
      return requests.filter(r => new Date(r.date).toDateString() === selectedDate.toDateString());
    }
    if (filterMode === "range" && dateRange.from) {
      const from = new Date(dateRange.from);
      const to = dateRange.to ? new Date(dateRange.to) : from;
      return requests.filter(r => {
        const d = new Date(r.date);
        return d >= from && d <= to;
      });
    }
    return requests;
  }, [requests, filterMode, selectedDate, dateRange]);

  const clearFilters = () => {
    setFilterMode("all");
    setSelectedDate(null);
    setDateRange({ from: null, to: null });
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric"
  });

  const totalValue = filteredRequests.reduce((sum, r) => sum + Number(r.totalPrice || 0), 0);
  const totalValue = filteredRequests.reduce((sum, r) => sum + Number(r.totalPrice || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted-foreground">Kitchen inventory requests by date</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Add Inventory</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Inventory Request</DialogTitle>
                <DialogDescription>Create a new inventory request</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Requested By</Label>
                  <Input value={addFormData.requestedBy} onChange={e => setAddFormData({ ...addFormData, requestedBy: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItemRow}><Plus className="w-3 h-3 mr-1" /> Add Item</Button>
                  </div>
                  {addFormData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-3 items-end">
                      <div className="space-y-1">
                        <Label className="text-xs">Item Name</Label>
                        <Select value={item.name} onValueChange={v => updateItemRow(index, "name", v)}>
                          <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                          <SelectContent>
                            {availableItems.map(i => <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>)}
                            {availableItems.map(i => <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input value={item.quantity} onChange={e => updateItemRow(index, "quantity", e.target.value)} placeholder="e.g., 10 kg" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Price</Label>
                        {/* ✅ Editable input instead of auto-calc */}
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItemRow(index, "price", e.target.value)}
                          placeholder="Enter amount"
                        />
                      </div>
                      <div>
                        {addFormData.items.length > 1 && (
                          <Button type="button" variant="outline" size="sm" className="text-red-600 hover:text-red-600" onClick={() => removeItemRow(index)}>
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

          <Popover>
            <PopoverTrigger asChild><Button variant="outline" size="sm"><CalendarIcon className="w-4 h-4 mr-2" /> Filter by Date</Button></PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-4 space-y-4">
                <div className="flex gap-2">
                  <Button variant={filterMode === "all" ? "default" : "outline"} size="sm" onClick={clearFilters}>All</Button>
                  <Button variant={filterMode === "single" ? "default" : "outline"} size="sm" onClick={() => setFilterMode("single")}>Single Date</Button>
                  <Button variant={filterMode === "range" ? "default" : "outline"} size="sm" onClick={() => setFilterMode("range")}>Date Range</Button>
                </div>
                {filterMode === "single" && <Calendar mode="single" selected={selectedDate} onSelect={d => { setSelectedDate(d); setFilterMode("single"); }} />}
                {filterMode === "range" && <Calendar mode="range" selected={dateRange} onSelect={r => setDateRange(r || { from: null, to: null })} />}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date-wise Requests</CardTitle>
          <CardDescription>
            {filterMode === "all" ? "All requests" : `Showing ${filteredRequests.length} filtered requests`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            <>
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
                  {filteredRequests.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{formatDate(r.date)}</TableCell>
                      <TableCell>{r.items.length} items</TableCell>
                      <TableCell>₹{r.totalPrice}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewRequest(r)}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center pt-4 border-t mt-4 text-sm text-muted-foreground">
                <div>
                  Showing <span className="font-medium text-foreground">{filteredRequests.length}</span> of <span className="font-medium text-foreground">{requests.length}</span> total requests
                  {filterMode !== "all" && <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">Filtered</span>}
                </div>
                <div>Total Value: <span className="font-medium text-foreground">₹{totalValue.toLocaleString()}</span></div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inventory Request Details</DialogTitle>
            <DialogDescription>Request for {viewingRequest ? formatDate(viewingRequest.date) : ""}</DialogDescription>
          </DialogHeader>
          {viewingRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Request Date</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(viewingRequest.date)}</p>
                </div>
                <div>
                  <h4 className="font-medium">Requested By</h4>
                  <p className="text-sm text-muted-foreground">{viewingRequest.requestedBy}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Requested Items</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingRequest.items.map((item: any, idx: number) => (
                      {viewingRequest.items.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="flex justify-end items-center pt-4 border-t">
                <div className="text-right">
                  <h4 className="font-medium">Total Amount</h4>
                  <p className="text-lg font-semibold">₹{viewingRequest.totalPrice}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
