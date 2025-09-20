import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Package, Users, AlertTriangle, TrendingUp } from 'lucide-react';

const ITEMS_API_URL = 'http://172.16.4.56:9000/api/items';
const VENDORS_API_URL = 'http://172.16.4.56:9000/api/vendors';
const ORDERS_API_URL = 'http://172.16.4.56:9000/api/orders';

export function DashboardOverview() {
  const [itemsCount, setItemsCount] = useState(0);
  const [vendorsCount, setVendorsCount] = useState(0);
  const [mostOrderedItems, setMostOrderedItems] = useState([]);
  const [mostConsumedItems, setMostConsumedItems] = useState([]);

  // Fetch items count & consumption distribution
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(ITEMS_API_URL);
        if (!res.ok) throw new Error('Failed to fetch items');
        const data = await res.json();
        console.log('Items API data:', data);

        if (Array.isArray(data.data)) {
          setItemsCount(data.data.length);

          // Group items by category or type for consumption (adjust as needed)
          const consumption = {};
          data.data.forEach(item => {
            const category = item.category || item.type || item.name || 'Others';
            const qty = Number(item.quantity_consumed || item.quantity || 1);
            consumption[category] = (consumption[category] || 0) + qty;
          });

          // Convert to array for recharts
          const consumedArray = Object.entries(consumption).map(([name, value], index) => ({
            name,
            value,
            // generate a color for each slice
            fill: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]
          }));

          consumedArray.sort((a, b) => b.value - a.value);
          setMostConsumedItems(consumedArray.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

  // Fetch vendors count
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch(VENDORS_API_URL);
        if (!res.ok) throw new Error('Failed to fetch vendors');
        const data = await res.json();
        setVendorsCount(Array.isArray(data.data) ? data.data.length : 0);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };
    fetchVendors();
  }, []);

  // Fetch most ordered items dynamically from orders API
useEffect(() => {
  const fetchOrders = async () => {
    try {
      const res = await fetch(ORDERS_API_URL);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      console.log('Orders API data:', data);

      // ✅ Make sure we always have an array
      const ordersArray = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [data];

      const orderCounts: Record<string, number> = {};

      ordersArray.forEach(order => {
        if (Array.isArray(order.items)) {
          order.items.forEach(itemObj => {
            const itemName = itemObj.name || itemObj.item;
            const quantity = Number(itemObj.quantity) || 1;
            if (itemName) {
              orderCounts[itemName] =
                (orderCounts[itemName] || 0) + quantity;
            }
          });
        }
      });

      // Convert to array for recharts
      const itemsArray = Object.entries(orderCounts).map(([name, orders]) => ({
        name,
        orders,
      }));

      // Sort descending & take top 5
      itemsArray.sort((a, b) => b.orders - a.orders);
      setMostOrderedItems(itemsArray.slice(0, 5));
      console.log('Most ordered items array:', itemsArray.slice(0, 5));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  fetchOrders();
}, []);


  // Stats Cards Data
  const statsData = [
    {
      title: 'Total Items',
      value: itemsCount,
      icon: Package,
      description: 'Active inventory items',
      trend: '+12%'
    },
    {
      title: 'Vendors',
      value: vendorsCount,
      icon: Users,
      description: 'Registered vendors',
      trend: '+3%'
    },
    {
      title: 'Lost Stock',
      value: '15',
      icon: AlertTriangle,
      description: 'Items out of stock',
      trend: '-8%'
    }
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
