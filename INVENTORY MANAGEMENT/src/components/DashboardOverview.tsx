import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {

  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Package, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { itemsApi, vendorsApi, ordersApi } from "../api/api"; // ✅ import your common APIs


export function DashboardOverview() {
  const [itemsCount, setItemsCount] = useState(0);
  const [vendorsCount, setVendorsCount] = useState(0);
  const [mostOrderedItems, setMostOrderedItems] = useState<any[]>([]);
  const [mostConsumedItems, setMostConsumedItems] = useState<any[]>([]);
  const [lostStockCount, setLostStockCount] = useState(0);

  // ✅ Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await itemsApi.getAll();
        console.log("Items API data:", data);

        if (Array.isArray(data.data)) {
           const lost = data.data.filter((item: any) => Number(item.quantity || 0) <= 0).length;
          setItemsCount(data.data.length);

          const consumption: Record<string, number> = {};
          data.data.forEach((item: any) => {
            const category = item.category || item.type || item.name || "Others";
            const qty = Number(item.quantity_consumed || item.quantity || 1);
            consumption[category] = (consumption[category] || 0) + qty;
          });

          const consumedArray = Object.entries(consumption).map(([name, value], index) => ({
            name,
            value,
            fill: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"][index % 5],
          }));

          consumedArray.sort((a, b) => b.value - a.value);
          setMostConsumedItems(consumedArray.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  // ✅ Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await vendorsApi.getAll();
        setVendorsCount(Array.isArray(data.data) ? data.data.length : 0);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    fetchVendors();
  }, []);

  // ✅ Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersApi.getAll();
        console.log("Orders API data:", data);

        const ordersArray = Array.isArray(data.data) ? data.data : [];
        const orderCounts: Record<string, number> = {};

        ordersArray.forEach((order: any) => {
          if (Array.isArray(order.items)) {
            order.items.forEach((itemObj: any) => {
              const itemName = itemObj.name || itemObj.item_name || itemObj.item;
              const quantity = Number(itemObj.quantity) || 1;
              if (itemName) {
                orderCounts[itemName] = (orderCounts[itemName] || 0) + quantity;
              }
            });
          }
        });

        const itemsArray = Object.entries(orderCounts).map(([name, orders]) => ({
          name,
          orders,
        }));

        itemsArray.sort((a, b) => b.orders - a.orders);
        setMostOrderedItems(itemsArray.slice(0, 5));
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // ✅ Stats Cards Data (moved inside component)
  const statsData = [
    {
      title: "Total Items",
      value: itemsCount,
      icon: Package,
      description: "Active inventory items",
      trend: "+12%",
    },
    {
      title: "Vendors",
      value: vendorsCount,
      icon: Users,
      description: "Registered vendors",
      trend: "+3%",
    },
      
    {
    title: "Lost Stock",
    value: lostStockCount, // ✅ dynamic
    icon: AlertTriangle,
    description: "Items out of stock",
    trend: "-8%",
  },
  // Inside your component, after fetching items




  
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="text-green-600">{stat.trend}</span>
                <span className="ml-1">from last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Ordered Items */}
        <Card>
          <CardHeader>
            <CardTitle>Most Ordered Items</CardTitle>
            <CardDescription>Items with highest order frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mostOrderedItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Most Consumed Items */}
        <Card>
          <CardHeader>
            <CardTitle>Most Consumed Items</CardTitle>
            <CardDescription>Consumption distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mostConsumedItems}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mostConsumedItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
