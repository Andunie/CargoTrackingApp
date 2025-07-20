import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Shipments from "./pages/Shipments";
import Map from './pages/Map';
import AdminLayout from "./layouts/admin/AdminLayout";
import UserLayout from "./layouts/user/UserLayout";
import Home from "./pages/Home";
import UserOrders from "./pages/UserOrders";
import UserProfile from "./pages/UserProfile";
import Users from "./pages/Users";
import MyShipments from "./pages/UserMyShipments";
import IncomingShipments from "./pages/IncomingShipments";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";

const App = () => {
  // Hatalı rotalara erişimde yönlendirme için token kontrolü
  const getRedirectPath = () => {
    const token = Cookies.get("auth_token");
    if (!token) return "/login";
    
    try {
      const decoded = jwt_decode(token);
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      return role === "Admin" ? "/admin/dashboard" : "/user/home";
    } catch {
      return "/login";
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="shipments" element={<Shipments />} />
        <Route path="map" element={<Map />} />
        <Route path="users" element={<Users />} />
      </Route>

      <Route path="/user" element={<UserLayout />}>
        <Route path="home" element={<Home />} />
        <Route path="orders" element={<UserOrders />} />
        <Route path="shipments" element={<MyShipments />} />
        <Route path="incoming" element={<IncomingShipments />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* Hatalı rotalar için yönlendirme */}
      <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
    </Routes>
  );
};

export default App;