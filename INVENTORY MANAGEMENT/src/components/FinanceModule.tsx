import React, { useEffect, useState } from 'react';
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
import axios from 'axios';


export function FinanceModule() {
  const [transactions, setTransactions] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [transactionFormData, setTransactionFormData] = useState({
    vendor_id: '',
    items: [],
    quantity: '',
    amount: '',
    status: 'Pending',
    notes: ''
  });
 

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://172.16.4.40:9000/api/billings'); // replace with your API URL
      if (res.data.success) {
        const formattedTransactions = res.data.data.map(txn => ({
          id: `TXN${txn.billing_id}`,
          date: txn.date,
          vendor_name: txn.vendor_name,
          items: [txn.item_name], // assuming one item per billing
          amount: txn.total,
          status: txn.status,
          notes: txn.notes
        }));
        setTransactions(formattedTransactions);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      toast.error('Failed to load transactions');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Calculate summary
  const calculateFinancialSummary = () => {
const totalPurchases = transactions.reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
const totalConsumption = totalPurchases * 0.85;
const outstandingPayments = transactions
  .filter(txn => txn.status === 'Pending')
  .reduce((sum, txn) => sum + Number(txn.amount || 0), 0);


    return {
      totalPurchases,
      totalConsumption,
      outstandingPayments,
      paidTransactions: transactions.filter(txn => txn.status === 'Paid').length,
      pendingTransactions: transactions.filter(txn => txn.status === 'Pending').length
    };
  };

  // Aggregate vendor expenses dynamically

const vendorExpenseData = transactions.reduce((acc: any[], txn: any) => {
  const vendorName = txn.vendor_name || "Unknown Vendor";
  const existing = acc.find((v) => v.vendor === vendorName);

  if (existing) {
    existing.amount += Number(txn.amount);
  } else {
    acc.push({
      vendor: vendorName,
      amount: Number(txn.amount),
      color: ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#00C49F", "#FFBB28"][acc.length % 6], // cycle colors
    });
  }
  return acc;
}, []);


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
        {/* Monthly Purchase vs Consumption */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Purchase vs Consumption</CardTitle>
            <CardDescription>Comparison of monthly purchase and consumption values</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#8884d8" name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vendor-wise Expense Distribution */}
        {/* Vendor-wise Expense Distribution */}
<Card>
  <CardHeader>
    <CardTitle>Vendor-wise Expense Distribution</CardTitle>
    <CardDescription>Distribution of expenses across different vendors</CardDescription>
  </CardHeader>
  <CardContent>
  {vendorExpenseData.length > 0 ? (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={vendorExpenseData}
        dataKey="amount"
        nameKey="vendor"
        cx="50%"
        cy="50%"
        outerRadius={80}
        label={({ vendor, percent }) =>
          `${vendor} ${(percent * 100).toFixed(0)}%`
        }
        isAnimationActive={true}
        animationBegin={0}
        animationDuration={1200}
        animationEasing="ease-out"
      >
        {vendorExpenseData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
    </PieChart>
  </ResponsiveContainer>
) : (
  <p className="text-center text-muted-foreground">No vendor data available</p>
)}

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
                <TableHead className="text-center">Transaction ID</TableHead>
<TableHead className="text-center">Date</TableHead>
<TableHead className="text-center">Vendor</TableHead>
<TableHead className="text-center">Item(s)</TableHead>
<TableHead className="text-center">Amount</TableHead>
<TableHead className="text-center">Status</TableHead>

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
                    <TableCell>{transaction.vendor_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {transaction.items.map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
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
