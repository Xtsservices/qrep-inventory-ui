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
import { itemsApi, vendorsApi, ordersApi } from "../api/api";

export function DashboardOverview() {
  const [itemsCount, setItemsCount] = useState(0);
  const [vendorsCount, setVendorsCount] = useState(0);
  const [mostOrderedItems, setMostOrderedItems] = useState<any[]>([]);
  const [mostConsumedItems, setMostConsumedItems] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [lostStockCount, setLostStockCount] = useState(0);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF", "#FF0066", "#FF3366", "#33CCFF"];

  // Fetch Items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await itemsApi.getAll();
        if (!Array.isArray(data.data)) return;

        // Lost Stock
        const lost = data.data.filter((item: any) => Number(item.quantity || 0) <= 0).length;
        setLostStockCount(lost);
        setItemsCount(data.data.length);

        // Aggregate consumption
        const consumptionMap: Record<string, number> = {};
        data.data.forEach((item: any) => {
          const name = item.name || item.category || item.type || "Others";
          const qty = Number(item.quantity_consumed || item.quantity || 1);
          consumptionMap[name] = (consumptionMap[name] || 0) + qty;
        });

        const aggregatedArray = Object.entries(consumptionMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        const finalArray = aggregatedArray.map((item, index) => ({
          ...item,
          fill: COLORS[index % COLORS.length],
        }));

        setMostConsumedItems(finalArray);
        setPieData(finalArray); // initial pieData
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  // Fetch Vendors
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

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersApi.getAll();
        const ordersArray = Array.isArray(data.data) ? data.data : [];
        const orderCounts: Record<string, number> = {};

        ordersArray.forEach((order: any) => {
          if (Array.isArray(order.items)) {
            order.items.forEach((itemObj: any) => {
              let itemName =
                itemObj.name ||
                itemObj.item_name ||
                itemObj.item ||
                itemObj.ItemName ||
                itemObj.Item ||
                "Unknown";

              if (typeof itemName !== "string" || !itemName.trim()) itemName = "Unknown";
              itemName = itemName.trim();

              const quantity = Number(itemObj.quantity || itemObj.qty || 1);
              orderCounts[itemName] = (orderCounts[itemName] || 0) + quantity;
            });
          }
        });

        let itemsArray = Object.entries(orderCounts).map(([name, orders]) => ({
          name: name.split(" ")[0], // limit display
          orders,
        }));

        itemsArray.sort((a, b) => b.orders - a.orders);

        while (itemsArray.length < 5) itemsArray.push({ name: "Unknown", orders: 0 });

        setMostOrderedItems(itemsArray.slice(0, 5));
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  // Stats Cards
  const statsData = [
    { title: "Total Items", value: itemsCount, icon: Package, description: "Active inventory items", trend: "+12%" },
    { title: "Vendors", value: vendorsCount, icon: Users, description: "Registered vendors", trend: "+3%" },
    { title: "Lost Stock", value: lostStockCount, icon: AlertTriangle, description: "Items out of stock", trend: "-8%" },
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
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                  isAnimationActive
                  animationDuration={1500}
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
