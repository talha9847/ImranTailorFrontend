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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/used-inventory" element={<UsedInventory />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/clothes" element={<Clothes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
