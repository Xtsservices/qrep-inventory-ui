import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from './ui/alert-dialog';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { usersApi} from '../api/api';

const roles = ['Admin', 'Manager', 'Staff'];
const statuses = ['Active', 'Inactive'];

export function UsersModule() {
  const [users, setUsers] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [errors, setErrors] = useState({ name: '', mobileNumber: '', email: '', role: '' });

  const [userFormData, setUserFormData] = useState({ name: '', mobileNumber: '', email: '', role: '', status: 'Active' });
  const [editFormData, setEditFormData] = useState({ name: '', mobileNumber: '', email: '', role: '', status: 'Active' });

// Fetch Users
  useEffect(() => {
    fetchUsers();
  }, []);

  /** Fetch all users */
  const fetchUsers = async () => {
    try {
      const res = await usersApi.getAll();
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    }
  };

  /** Validate form data */
  const validateForm = (data: any) => {
    const newErrors: any = {};
    let valid = true;

    if (!data.name.trim()) { newErrors.name = "Please enter user name"; valid = false; }
    else if (!/^[A-Za-z\s]{2,50}$/.test(data.name.trim())) { newErrors.name = "Name must contain only letters and spaces"; valid = false; }

    if (!data.mobileNumber.trim()) { newErrors.mobileNumber = "Please enter mobile number"; valid = false; }
    else if (!/^\d{10}$/.test(data.mobileNumber)) { newErrors.mobileNumber = "Mobile number must be 10 digits"; valid = false; }

    if (!data.email.trim()) { newErrors.email = "Please enter email"; valid = false; }
    else if (!/\S+@\S+\.\S+/.test(data.email)) { newErrors.email = "Invalid email address"; valid = false; }

    if (!data.role) { newErrors.role = "Please select a role"; valid = false; }

    // Frontend duplicates check
    const isDuplicateNumber = users.some(u => u.mobileNumber === data.mobileNumber && u.id !== data.id);
    const isDuplicateEmail = users.some(u => u.email === data.email && u.id !== data.id);
    if (isDuplicateNumber) { newErrors.mobileNumber = "Mobile number already exists"; valid = false; }
    if (isDuplicateEmail) { newErrors.email = "Email already exists"; valid = false; }

    setErrors(newErrors);
    return valid;
  };

  const resetForm = () => setUserFormData({ name: "", mobileNumber: "", email: "", role: "", status: "Active" });

  /** Add user */
  const handleAddUser = async () => {
    if (!validateForm(userFormData)) return;
    try {
      const res = await usersApi.add(userFormData);
      if (res.success) {
        toast.success("User added successfully");
        fetchUsers();
        resetForm();
        setShowAddDialog(false);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add user");
    }
  };

  /** Update user */
  const handleUpdateUser = async () => {
    if (!editingUser) { toast.error("No user selected"); return; }
    if (!validateForm(editFormData)) return;
    try {
      const res = await usersApi.update(editingUser.id, editFormData);
      if (res.success) {
        toast.success("User updated successfully");
        fetchUsers();
        setShowEditDialog(false);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update user");
    }
  };

  /** Mark user inactive */
  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await usersApi.delete(userId);
      if (res.success) {
        toast.success("User marked as inactive");
        fetchUsers();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to mark inactive");
    }
  };

  /** View user */
  const handleViewUser = async (userId: string) => {
    try {
      const res = await usersApi.getById(userId);
      if (res.success) {
        setViewingUser(res.data);
        setShowViewDialog(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user details");
    }
  };

  const getRoleBadgeVariant = (role: string) => role === "Admin" ? "destructive" : role === "Manager" ? "default" : "secondary";
  const getStatusBadgeVariant = (status: string) => status === "Active" ? "success" : "destructive";

  return (
    <div className="space-y-6">
      {/* Header + Add User */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage system users and their roles</p>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />Add User
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>All registered system users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">S. No.</TableHead>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead className="text-center">Mobile Number</TableHead>
                <TableHead className="text-center">Email</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                </TableRow>
              ) : users?.map((user,index) => (
                <TableRow key={user.id} className="text-center">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell><Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge></TableCell>
                  <TableCell>{user.mobileNumber}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button variant="ghost" size="sm" onClick={() => handleViewUser(user.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <p>Are you sure you want to mark <b>{user.name}</b> as inactive?</p>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>No</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Yes, Mark Inactive</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      {/* Add User Dialog */}
<Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add New User</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      {/* Name */}
      <div>
        <Label>Name</Label>
        <div className="relative">
          <Input
            value={userFormData.name}
            onChange={e => setUserFormData({ ...userFormData, name: e.target.value })}
            className={errors.name ? 'border-red-500 pr-8' : ''}
          />
          {errors.name && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500">&#9888;</span>
          )}
        </div>
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Mobile Number */}
      <div>
         <Label>Mobile Number</Label>
  <div className="relative">
    <Input
      type="tel" // ensures numeric keypad on mobile and restricts letters
      inputMode="numeric" // better numeric support
      pattern="[0-9]*" // allow only digits
      maxLength={10} // limit to 10 digits
      value={userFormData.mobileNumber}
      onChange={e => {
        // allow only numbers
        const onlyNumbers = e.target.value.replace(/\D/g, '');
        setUserFormData({ ...userFormData, mobileNumber: onlyNumbers });
      }}
      className={errors.mobileNumber ? 'border-red-500 pr-8' : ''}
    />
    {errors.mobileNumber && (
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-red-600">&#9888;</span>
    )}
  </div>
  {errors.mobileNumber && (
    <p className="text-red-600">
      Please enter a valid 10-digit mobile number
    </p>
  )}
      </div>

      {/* Email */}
      <div>
        <Label>Email</Label>
        <div className="relative">
          <Input
            value={userFormData.email}
            onChange={e => setUserFormData({ ...userFormData, email: e.target.value })}
            className={errors.email ? 'border-red-600 pr-8' : ''}
          />
          {errors.email && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-red-600">&#9888;</span>
          )}
        </div>
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Role */}
      <div>
        <Label>Role</Label>
        <div className="relative">
          <Select
            value={userFormData.role}
            onValueChange={value => setUserFormData({ ...userFormData, role: value })}
            className={errors.role ? 'border-red-600 pr-8' : ''}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-red-600">&#9888;</span>
          )}
        </div>
        {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role}</p>}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleAddUser}>Add User</Button>
        <Button variant="ghost" onClick={() => setShowAddDialog(false)}>Cancel</Button>
      </div>
    </div>
  </DialogContent>
</Dialog>


      {/* View User Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {viewingUser.name ? viewingUser.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{viewingUser.name}</p>
                  <Badge variant={getRoleBadgeVariant(viewingUser.role)} className="mt-1">{viewingUser.role}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground font-medium">User ID</p><p>{viewingUser.id}</p></div>
                <div><p className="text-muted-foreground font-medium">Role</p><p>{viewingUser.role}</p></div>
                <div><p className="text-muted-foreground font-medium">Mobile</p><p>{viewingUser.mobileNumber}</p></div>
                <div><p className="text-muted-foreground font-medium">Email</p><p>{viewingUser.email}</p></div>
                <div><p className="text-muted-foreground font-medium">Status</p><Badge variant={getStatusBadgeVariant(viewingUser.status)}>{viewingUser.status}</Badge></div>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
                <Button onClick={() => {
                  setEditingUser(viewingUser);
                  setEditFormData({
                    name: viewingUser.name,
                    mobileNumber: viewingUser.mobileNumber,
                    email: viewingUser.email,
                    role: viewingUser.role,
                    status: viewingUser.status
                  });
                  setShowEditDialog(true);
                  setShowViewDialog(false);
                }}>Edit User</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={editFormData.name}
                onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Mobile Number</Label>
              <Input
                value={editFormData.mobileNumber}
                onChange={e => setEditFormData({ ...editFormData, mobileNumber: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={editFormData.email}
                onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={editFormData.role} onValueChange={value => setEditFormData({ ...editFormData, role: value })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editFormData.status} onValueChange={value => setEditFormData({ ...editFormData, status: value })}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={handleUpdateUser}>Save</Button>
              <Button variant="ghost" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    

    </div>
  );
}
