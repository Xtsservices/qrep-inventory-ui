import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const initialUsers = [
  { id: 'USR001', name: 'John Smith', role: 'Admin', mobileNumber: '9876543210', email: 'john.smith@company.com' },
  { id: 'USR002', name: 'Sarah Johnson', role: 'Manager', mobileNumber: '9876543211', email: 'sarah.johnson@company.com' },
  { id: 'USR003', name: 'Mike Wilson', role: 'Staff', mobileNumber: '9876543212', email: 'mike.wilson@company.com' }
];

const roles = ['Admin', 'Manager', 'Staff'];

export function UsersModule() {
  const [users, setUsers] = useState(initialUsers);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({ name: '', mobileNumber: '', email: '', role: '' });

  const generateUserId = () => {
    const lastId = users.length > 0 ? Math.max(...users.map(user => parseInt(user.id.replace('USR', '')))) : 0;
    return `USR${String(lastId + 1).padStart(3, '0')}`;
  };

  const validateForm = () => {
    if (!userFormData.name.trim()) { toast.error('Please enter user name'); return false; }
    if (!/^[A-Za-z\s]{2,50}$/.test(userFormData.name.trim())) { toast.error('Name should contain only letters and spaces'); return false; }
    if (!userFormData.mobileNumber.trim()) { toast.error('Please enter mobile number'); return false; }
    if (!/^\d{10}$/.test(userFormData.mobileNumber)) { toast.error('Please enter a valid 10-digit mobile number'); return false; }
    if (!userFormData.email.trim()) { toast.error('Please enter email address'); return false; }
    if (!/\S+@\S+\.\S+/.test(userFormData.email)) { toast.error('Please enter a valid email address'); return false; }
    if (!userFormData.role) { toast.error('Please select a role'); return false; }

    const isDuplicateNumber = users.some(u => u.mobileNumber === userFormData.mobileNumber && (!editingUser || u.id !== editingUser.id));
    const isDuplicateEmail = users.some(u => u.email === userFormData.email && (!editingUser || u.id !== editingUser.id));

    if (isDuplicateNumber) { toast.error('Mobile number already exists'); return false; }
    if (isDuplicateEmail) { toast.error('Email address already exists'); return false; }

    return true;
  };

  const handleAddUser = () => {
    if (!validateForm()) return;
    const newUser = { id: generateUserId(), ...userFormData, name: userFormData.name.trim(), mobileNumber: userFormData.mobileNumber.trim(), email: userFormData.email.trim() };
    setUsers([...users, newUser]);
    toast.success('User added successfully!');
    setUserFormData({ name: '', mobileNumber: '', email: '', role: '' });
    setShowAddDialog(false);
  };

  const handleViewUser = (user) => { setViewingUser(user); setShowViewDialog(true); };
  const handleEditUser = (user) => { setEditingUser(user); setUserFormData({ name: user.name, mobileNumber: user.mobileNumber, email: user.email, role: user.role }); setShowEditDialog(true); };

  const handleUpdateUser = () => {
    if (!validateForm()) return;
    setUsers(users.map(user =>
      user.id === editingUser?.id ? { ...user, ...userFormData, name: userFormData.name.trim(), mobileNumber: userFormData.mobileNumber.trim(), email: userFormData.email.trim() } : user
    ));
    toast.success('User updated successfully!');
    setShowEditDialog(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => { setUsers(users.filter(user => user.id !== userId)); toast.success('User deleted successfully!'); };
  const getRoleBadgeVariant = (role) => role === 'Admin' ? 'destructive' : role === 'Manager' ? 'default' : 'secondary';
  const resetForm = () => setUserFormData({ name: '', mobileNumber: '', email: '', role: '' });

  return (
    <div className="space-y-6">
      {/* Header + Add User */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage system users and their roles</p>
        <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add User</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New User</DialogTitle><DialogDescription>Create a new user account</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" placeholder="Enter full name" value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value.replace(/[^A-Za-z\s]/g, '') })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input id="mobile" type="tel" maxLength={10} placeholder="Enter 10-digit mobile number" value={userFormData.mobileNumber} onChange={(e) => setUserFormData({ ...userFormData, mobileNumber: e.target.value.replace(/\D/g, '') })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="Enter email" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={userFormData.role} onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}>
                  <SelectTrigger><SelectValue placeholder="Select user role" /></SelectTrigger>
                  <SelectContent>{roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader><CardTitle>Users List</CardTitle><CardDescription>All registered system users</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow> :
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell><Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge></TableCell>
                    <TableCell>{user.mobileNumber}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to delete {user.name}? This cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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

      {/* View User Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>User Details</DialogTitle><DialogDescription>Complete information</DialogDescription></DialogHeader>
          {viewingUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl">{viewingUser.name.charAt(0).toUpperCase()}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{viewingUser.name}</h3>
                  <Badge variant={getRoleBadgeVariant(viewingUser.role)}>{viewingUser.role}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm text-muted-foreground">User ID</Label><p className="font-mono">{viewingUser.id}</p></div>
                <div><Label className="text-sm text-muted-foreground">Role</Label><p>{viewingUser.role}</p></div>
                <div><Label className="text-sm text-muted-foreground">Mobile</Label><p>{viewingUser.mobileNumber}</p></div>
                <div><Label className="text-sm text-muted-foreground">Email</Label><p className="break-all">{viewingUser.email}</p></div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
                <Button onClick={() => { setShowViewDialog(false); handleEditUser(viewingUser); }}><Edit className="w-4 h-4 mr-2" />Edit User</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) { setEditingUser(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle><DialogDescription>Update user information</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">User ID: {editingUser?.id}</div>
            <div className="space-y-2">
              <Label htmlFor="editName">Name *</Label>
              <Input id="editName" placeholder="Enter full name" value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value.replace(/[^A-Za-z\s]/g, '') })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMobile">Mobile Number *</Label>
              <Input id="editMobile" type="tel" maxLength={10} placeholder="Enter 10-digit mobile number" value={userFormData.mobileNumber} onChange={(e) => setUserFormData({ ...userFormData, mobileNumber: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email *</Label>
              <Input id="editEmail" type="email" placeholder="Enter email" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRole">Role *</Label>
              <Select value={userFormData.role} onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>{roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdateUser}>Update User</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
