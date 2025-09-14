import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, TrendingUp, TrendingDown, DollarSign, CreditCard, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

const initialTransactions = [
  {
    id: 'TXN001',
    date: '2024-01-15',
    vendor: 'Fresh Foods Suppliers',
    items: ['Basmati Rice', 'Toor Dal'],
    amount: 1500,
    status: 'Paid',
    notes: 'Monthly stock purchase'
  },
  {
    id: 'TXN002',
    date: '2024-01-14',
    vendor: 'Grain Masters',
    items: ['Refined Oil'],
    amount: 2500,
    status: 'Pending',
    notes: 'Bulk oil purchase'
  },
  {
    id: 'TXN003',
    date: '2024-01-13',
    vendor: 'Spice World',
    items: ['Turmeric Powder', 'Cumin Seeds'],
    amount: 800,
    status: 'Paid',
    notes: 'Spice restocking'
  }
];

const vendors = ['Fresh Foods Suppliers', 'Grain Masters', 'Spice World'];
const availableItems = [
  'Basmati Rice', 'Toor Dal', 'Refined Oil', 'Onions', 'Turmeric Powder',
  'Wheat Flour', 'Sugar', 'Salt', 'Cumin Seeds', 'Coriander Seeds'
];

// Mock data for charts
const monthlyData = [
  { month: 'Jan', purchases: 15000, consumption: 12000 },
  { month: 'Feb', purchases: 18000, consumption: 14000 },
  { month: 'Mar', purchases: 22000, consumption: 16000 },
  { month: 'Apr', purchases: 19000, consumption: 15000 },
  { month: 'May', purchases: 25000, consumption: 18000 },
  { month: 'Jun', purchases: 21000, consumption: 17000 },
];

const vendorExpenseData = [
  { vendor: 'Fresh Foods', amount: 45000, color: '#8884d8' },
  { vendor: 'Grain Masters', amount: 35000, color: '#82ca9d' },
  { vendor: 'Spice World', amount: 25000, color: '#ffc658' },
  { vendor: 'Others', amount: 15000, color: '#ff7c7c' }
];

export function FinanceModule() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [transactionFormData, setTransactionFormData] = useState({
    vendor: '',
    items: [],
    quantity: '',
    amount: '',
    status: 'Pending',
    notes: ''
  });

  const generateTransactionId = () => {
    const lastId = transactions.length > 0 ? 
      Math.max(...transactions.map(txn => parseInt(txn.id.replace('TXN', '')))) : 0;
    return `TXN${String(lastId + 1).padStart(3, '0')}`;
  };

  const calculateFinancialSummary = () => {
    const totalPurchases = transactions.reduce((sum, txn) => sum + txn.amount, 0);
    const totalConsumption = totalPurchases * 0.85; // Mock consumption as 85% of purchases
    const outstandingPayments = transactions
      .filter(txn => txn.status === 'Pending')
      .reduce((sum, txn) => sum + txn.amount, 0);
    
    return {
      totalPurchases,
      totalConsumption,
      outstandingPayments,
      paidTransactions: transactions.filter(txn => txn.status === 'Paid').length,
      pendingTransactions: transactions.filter(txn => txn.status === 'Pending').length
    };
  };

  const handleAddTransaction = () => {
    if (!transactionFormData.vendor) {
      toast.error('Please select a vendor');
      return;
    }
    if (transactionFormData.items.length === 0) {
      toast.error('Please select at least one item');
      return;
    }
    if (!transactionFormData.amount || parseFloat(transactionFormData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const newTransaction = {
      id: generateTransactionId(),
      date: new Date().toISOString().split('T')[0],
      vendor: transactionFormData.vendor,
      items: transactionFormData.items,
      amount: parseFloat(transactionFormData.amount),
      status: transactionFormData.status,
      notes: transactionFormData.notes,
      quantity: transactionFormData.quantity
    };

    setTransactions([...transactions, newTransaction]);
    toast.success('Transaction added successfully!');
    
    setTransactionFormData({
      vendor: '',
      items: [],
      quantity: '',
      amount: '',
      status: 'Pending',
      notes: ''
    });
    setShowAddDialog(false);
  };

  const handleItemToggle = (item, checked) => {
    if (checked) {
      setTransactionFormData({
        ...transactionFormData,
        items: [...transactionFormData.items, item]
      });
    } else {
      setTransactionFormData({
        ...transactionFormData,
        items: transactionFormData.items.filter(i => i !== item)
      });
    }
  };

  const summary = calculateFinancialSummary();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">Financial overview and transaction management</p>
      </div>

      {/* Finance Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalPurchases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumption Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalConsumption.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              85% of total purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{summary.outstandingPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {summary.pendingTransactions} pending transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Badge variant="outline">{transactions.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.paidTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Completed payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Purchase vs Consumption</CardTitle>
            <CardDescription>Comparison of monthly purchase and consumption values</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="purchases" fill="#8884d8" name="Purchases" />
                <Bar dataKey="consumption" fill="#82ca9d" name="Consumption" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor-wise Expense Distribution</CardTitle>
            <CardDescription>Distribution of expenses across different vendors</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vendorExpenseData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  label={({ vendor, percent }) => `${vendor} ${(percent * 100).toFixed(0)}%`}
                >
                  {vendorExpenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Transactions List</CardTitle>
            <CardDescription>All financial transactions and payments</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Item(s)</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono">{transaction.id}</TableCell>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.vendor}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {transaction.items.slice(0, 2).map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {transaction.items.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{transaction.items.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.status === 'Paid' ? 'default' : 'destructive'}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* List Count Display */}
          <div className="flex justify-between items-center pt-4 border-t mt-4 text-sm text-muted-foreground">
            <div>
              Showing <span className="font-medium text-foreground">{transactions.length}</span> total transactions
            </div>
            <div className="flex gap-4">
              <span>Paid: <span className="font-medium text-green-600">{summary.paidTransactions}</span></span>
              <span>Pending: <span className="font-medium text-red-600">{summary.pendingTransactions}</span></span>
              <span>Total Value: <span className="font-medium text-foreground">₹{summary.totalPurchases.toLocaleString()}</span></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}