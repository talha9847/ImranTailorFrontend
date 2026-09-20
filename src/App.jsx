import { useState } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import UsedInventory from "./components/UsedInventory";
import Clothes from "./components/Clothes";
import NotFound from "./components/NotFound";
import { AuthProvider } from "./context/authContext";
import ProtectedRoute from "./context/protectedRoute";
import History from "./components/History";
import Customer from "./components/Customer";
import ViewOrder from "./components/ViewOrder";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/used-inventory" element={<UsedInventory />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/clothes" element={<Clothes />} />
            <Route path="/history" element={<History />} />
            <Route path="/customers" element={<Customer />} />
            <Route path="/view-order/:id" element={<ViewOrder />} />
          </Route>
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
