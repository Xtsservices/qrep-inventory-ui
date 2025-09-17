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

const roles = ['Admin', 'Manager', 'Staff'];
const statuses = ['Active', 'Inactive'];

export function UsersModule() {
  const [users, setUsers] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [userFormData, setUserFormData] = useState({
    name: '', mobileNumber: '', email: '', role: '', status: 'Active'
  });

  const [editFormData, setEditFormData] = useState({
    name: '', mobileNumber: '', email: '', role: '', status: 'Active'
  });

  const API_BASE = 'http://172.16.4.40:9000/api/users';

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_BASE);
      if (response.data.success) setUsers(response.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch users');
    }
  };

  const validateForm = (data: any) => {
    const { name, mobileNumber, email, role } = data;

    if (!name.trim()) { toast.error('Please enter user name'); return false; }
    if (!/^[A-Za-z\s]{2,50}$/.test(name.trim())) { toast.error('Name should contain only letters and spaces'); return false; }
    if (!mobileNumber.trim()) { toast.error('Please enter mobile number'); return false; }
    if (!/^\d{10}$/.test(mobileNumber)) { toast.error('Please enter a valid 10-digit mobile number'); return false; }
    if (!email.trim()) { toast.error('Please enter email address'); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { toast.error('Please enter a valid email address'); return false; }
    if (!role) { toast.error('Please select a role'); return false; }

    // Duplicate check
    const isDuplicateNumber = users.some(u => u.mobileNumber === mobileNumber && u.id !== data.id);
    const isDuplicateEmail = users.some(u => u.email === email && u.id !== data.id);

    if (isDuplicateNumber) { toast.error('Mobile number already exists'); return false; }
    if (isDuplicateEmail) { toast.error('Email address already exists'); return false; }

    return true;
  };

  const resetForm = () => setUserFormData({ name: '', mobileNumber: '', email: '', role: '', status: 'Active' });

  // Add User
  const handleAddUser = async () => {
    if (!validateForm(userFormData)) return;
    try {
      const res = await axios.post(API_BASE, userFormData);
      if (res.data.success) {
        toast.success('User added successfully!');
        fetchUsers();
        resetForm();
        setShowAddDialog(false);
      } else {
        toast.error(res.data.error || 'Failed to add user');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to add user');
    }
  };

  // View User
  const handleViewUser = async (userId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/${userId}`);
      if (res.data.success && res.data.data) {
        setViewingUser(res.data.data);
        setShowViewDialog(true);
      } else {
        toast.error('User not found');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch user details');
    }
  };

  // Edit User
  const handleUpdateUser = async () => {
    if (!editingUser) { toast.error("No user selected to edit"); return; }
    if (!validateForm(editFormData)) return;

    try {
      const res = await axios.put(`${API_BASE}/${editingUser.id}`, editFormData);
      if (res.data.success) {
        toast.success('User updated successfully!');
        fetchUsers();
        setShowEditDialog(false);
      } else {
        toast.error(res.data.error || 'Failed to update user');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update user');
    }
  };

  // Delete = mark Inactive
  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await axios.put(`${API_BASE}/${userId}`, { status: 'Inactive' });
      if (res.data.success) {
        toast.success('User marked as inactive');
        fetchUsers();
      } else {
        toast.error(res.data.error || 'Failed to mark inactive');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to mark inactive');
    }
  };

  const getRoleBadgeVariant = (role: string) =>
    role === 'Admin' ? 'destructive' : role === 'Manager' ? 'default' : 'secondary';

  const getStatusBadgeVariant = (status: string) =>
    status === 'Active' ? 'success' : 'destructive';

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
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell><Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge></TableCell>
                    <TableCell>{user.mobileNumber}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
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
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Yes, Mark Inactive
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={userFormData.name}
                onChange={e => setUserFormData({ ...userFormData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Mobile Number</Label>
              <Input
                value={userFormData.mobileNumber}
                onChange={e => setUserFormData({ ...userFormData, mobileNumber: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={userFormData.email}
                onChange={e => setUserFormData({ ...userFormData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={userFormData.role} onValueChange={value => setUserFormData({ ...userFormData, role: value })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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

              <div className="flex justify-end gap-2 mt-4">
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
