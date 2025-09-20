import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { 
  LayoutDashboard, Package, Users, ShoppingCart, ClipboardList, 
  Warehouse, UserCheck, IndianRupee, User, LogOut, ChevronLeft, ChevronRight 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, key: "overview" },
  { name: "Items", icon: Package, key: "items" },
  { name: "Vendors", icon: Users, key: "vendors" },
  { name: "Orders", icon: ShoppingCart, key: "orders" },
  { name: "Inventory Request", icon: ClipboardList, key: "inventory-request" },
  { name: "Stock Availability", icon: Warehouse, key: "stock-availability" },
  { name: "Users", icon: UserCheck, key: "users" },
  { name: "Finance", icon: IndianRupee, key: "finance" },
];

export function Dashboard({ currentUser, onLogout, onUpdateUser, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const activeModule = pathSegments[1] || "overview";

  const handleMenuClick = (key) => navigate(`/dashboard/${key}`);
  const handleProfileClick = () => navigate(`/dashboard/profile`);
  const handleUpdateProfile = (updatedUser) => onUpdateUser(updatedUser);

    const activePageName =
    navigation.find((item) => item.key === activeModule)?.name || "Dashboard";

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground">
            {currentUser?.logo ? (
              <img src={currentUser.logo} alt="Logo" className="w-full h-full object-contain rounded" />
            ) : (
              <Package className="w-4 h-4" />
            )}
          </div>
          <span className="text-xl">InventoryMS</span>
        </div>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                {currentUser?.avatar ? (
                  <AvatarImage src={currentUser.avatar} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
            <div className="flex items-center gap-2 p-3">
              <Avatar className="h-8 w-8">
                {currentUser?.avatar ? (
                  <AvatarImage src={currentUser.avatar} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col space-y-1 leading-none">
                <p className="text-sm font-medium">{currentUser?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{currentUser?.mobile || "No mobile"}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Sidebar + Main */}
      <div className="flex pt-16 h-screen">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-16 bottom-0 z-40 border-r bg-sidebar transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"} flex flex-col`}>
          <div className="p-4 border-b flex items-center justify-between">
            {!sidebarCollapsed && <span className="text-sm text-muted-foreground">Navigation</span>}
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="h-6 w-6 p-0">
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex-1 p-2 overflow-y-auto">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Button
                  key={item.key}
                  variant={activeModule === item.key ? "secondary" : "ghost"}
                  className={`w-full justify-start h-10 ${sidebarCollapsed ? "px-2" : "px-3"}`}
                  onClick={() => handleMenuClick(item.key)}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-2">{item.name}</span>}
                </Button>
              ))}
            </nav>
          </div>
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className={`w-full justify-start h-10 text-red-600 hover:text-red-600 hover:bg-red-50 ${sidebarCollapsed ? "px-2" : "px-3"}`}
              onClick={onLogout}
              title={sidebarCollapsed ? "Logout" : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
           <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            sidebarCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          <div className="p-6">
            {/* Page Title */}
            <h1 className="text-2xl font-bold mb-4">{activePageName}</h1>

            {/* Rendered Page */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
