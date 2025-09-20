// src/App.tsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { DashboardOverview } from "./components/DashboardOverview";
import { ItemsModule } from "./components/ItemsModule";
import { VendorsModule } from "./components/VendorsModule";
import { OrdersModule } from "./components/OrdersModule";
import { InventoryRequestModule } from "./components/InventoryRequestModule";
import { StockAvailabilityModule } from "./components/StockAvailabilityModule";
import { UsersModule } from "./components/UsersModule";
import { FinanceModule } from "./components/FinanceModule";
import { ProfileScreen } from "./components/ProfileScreen";
import { LoginPage } from "./components/LoginPage";
import { Toaster } from "./components/ui/sonner";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load user from localStorage if available
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData: any) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("currentUser", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("currentUser");
  };

  const handleUpdateUser = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  };

  return (
    <div className="min-h-screen bg-background">
      <Router>
        {!isAuthenticated ? (
          // Login route
          <Routes>
            <Route path="/*" element={<LoginPage onLogin={handleLogin} />} />
          </Routes>
        ) : (
          // Dashboard route
          <Routes>
            <Route
              path="/dashboard/*"
              element={
                <Dashboard
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  onUpdateUser={handleUpdateUser}
                >
                  <Routes>
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<DashboardOverview />} />
                    <Route path="items/*" element={<ItemsModule />} />
                    <Route path="vendors/*" element={<VendorsModule />} />
                    <Route path="orders/*" element={<OrdersModule />} />
                    <Route path="inventory-request/*" element={<InventoryRequestModule />} />
                    <Route path="stock-availability/*" element={<StockAvailabilityModule />} />
                    <Route path="users/*" element={<UsersModule />} />
                    <Route path="finance/*" element={<FinanceModule />} />
                    <Route
                      path="profile"
                      element={
                        <ProfileScreen
                          currentUser={currentUser}
                          onUpdateProfile={handleUpdateUser}
                        />
                      }
                    />
                    <Route path="*" element={<Navigate to="overview" replace />} />
                  </Routes>
                </Dashboard>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        )}
      </Router>
      <Toaster />
    </div>
  );
}

export default App;
