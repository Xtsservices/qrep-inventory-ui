import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, Users, AlertTriangle, TrendingUp } from 'lucide-react';

const statsData = [
  {
    title: 'Total Items',
    value: '248',
    icon: Package,
    description: 'Active inventory items',
    trend: '+12%'
  },
  {
    title: 'Vendors',
    value: '32',
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

const mostOrderedItems = [
  { name: 'Rice', orders: 45, value: 45 },
  { name: 'Dal', orders: 38, value: 38 },
  { name: 'Oil', orders: 32, value: 32 },
  { name: 'Vegetables', orders: 28, value: 28 },
  { name: 'Spices', orders: 22, value: 22 },
];

const mostConsumedItems = [
  { name: 'Rice', value: 35, fill: '#0088FE' },
  { name: 'Dal', value: 25, fill: '#00C49F' },
  { name: 'Vegetables', value: 20, fill: '#FFBB28' },
  { name: 'Oil', value: 12, fill: '#FF8042' },
  { name: 'Others', value: 8, fill: '#8884d8' },
];

export function DashboardOverview() {
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