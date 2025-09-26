import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Plus, TrendingUp, TrendingDown, CreditCard, IndianRupee } from "lucide-react";
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
  Legend,
} from "recharts";
import { toast } from "sonner";
import { financeApi } from "../api/api";

// Transaction and Vendor types
interface Transaction {
  id: string;
  order_date: string | null;
  vendor_name: string;
  items: string[];
  amount: number;
  status: string;
  notes: string;
}

interface VendorExpense {
  vendor: string;
  amount: number;
  color: string;
}

export function FinanceModule() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [transactionFormData, setTransactionFormData] = useState({
    vendor_id: "",
    items: [] as string[],
    quantity: "",
    amount: "",
    status: "Pending",
    notes: "",
  });

  // Fetch transactions from API
// Fetch transactions from API
const fetchTransactions = async () => {
  try {
    const res = await financeApi.getAll();
    if (res.success) {
      const formattedTransactions: Transaction[] = res.data.map((txn: any, index: number) => {
        // Unique Transaction ID
        const idNumber = txn.billing_id || txn.order_id || Math.floor(Math.random() * 1000000) + index;

        // Handle items array and calculate total amount
        let items: string[] = [];
        let totalAmount = 0;

        if (txn.items && Array.isArray(txn.items) && txn.items.length > 0) {
          items = txn.items.map((item: any) => item.name || "Unknown Item");
          totalAmount = txn.items.reduce(
            (sum: number, item: any) => sum + (parseFloat(item.price) || 0),
            0
          );
        } else if (txn.item_name) {
          items = [txn.item_name];
          totalAmount = parseFloat(txn.cost || "0");
        }
if (txn.status !== "Paid" && txn.order_status !== "Completed") {
    totalAmount = 0;
  }

        return {
          id: `TXN${idNumber}`,
          order_date: txn.order_date ? new Date(txn.order_date).toISOString() : null,
          vendor_name: txn.vendor_name || "N/A",
          items,
          amount: totalAmount,
          status:
            txn.status === "Paid"
              ? "Completed"
              : txn.order_status
              ? txn.order_status
              : txn.status || "Pending",
          notes: txn.notes || "",
        };
      });
      

      setTransactions(formattedTransactions);
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to load transactions");
  }
};



  useEffect(() => {
    fetchTransactions();
  }, []);

  // Calculate summary
  const calculateFinancialSummary = () => {
    const totalPurchases = transactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
    const totalConsumption = totalPurchases * 0.85;
    const outstandingPayments = transactions
      .filter((txn) => txn.status === "Pending")
      .reduce((sum, txn) => sum + (txn.amount || 0), 0);

    return {
      totalPurchases,
      totalConsumption,
      outstandingPayments,
      completedTransactions: transactions.filter((txn) => txn.status === "Completed").length,
      pendingTransactions: transactions.filter((txn) => txn.status === "Pending").length,
    };
  };

  // Aggregate vendor expenses dynamically
  const vendorExpenseData: VendorExpense[] = transactions.reduce((acc: VendorExpense[], txn) => {
    const vendorName = txn.vendor_name || "Unknown Vendor";
    const existing = acc.find((v) => v.vendor === vendorName);

    if (existing) {
      existing.amount += txn.amount;
    } else {
      acc.push({
        vendor: vendorName,
        amount: txn.amount,
        color: ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#00C49F", "#FFBB28"][acc.length % 6],
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
            <p className="text-xs text-muted-foreground">85% of total purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ₹{summary.outstandingPayments.toLocaleString()}
            </div>
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
            <div className="text-2xl font-bold">{summary.completedTransactions}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
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
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#8884d8" name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    label={false}
                    labelLine={false}
                  >
                    {vendorExpenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    formatter={(value: string, entry: any) => {
                      const vendor = entry.payload as VendorExpense;
                      const total = vendorExpenseData.reduce((sum, v) => sum + v.amount, 0);
                      const percent = ((vendor.amount / total) * 100).toFixed(0);
                      return `${vendor.vendor} (${percent}%)`;
                    }}
                  />
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
                <TableHead>Item(s)</TableHead>
                <TableHead className="text-center">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-center">
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
                    <TableCell>
                      {transaction.order_date
                        ? (() => {
                            const d = new Date(transaction.order_date);
                            return isNaN(d.getTime())
                              ? "Invalid Date"
                              : d
                                  .toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                  .replace(/ /g, "-"); // Example: 19-Sep-2025
                          })()
                        : "N/A"}
                    </TableCell>
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
                      <Badge variant={transaction.status === "Completed" ? "default" : "destructive"}>
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
              <span>
                Completed: <span className="font-medium text-green-600">{summary.completedTransactions}</span>
              </span>
              <span>
                Pending: <span className="font-medium text-red-600">{summary.pendingTransactions}</span>
              </span>
              <span>
                Total Value:{" "}
                <span className="font-medium text-foreground">₹{summary.totalPurchases.toLocaleString()}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
