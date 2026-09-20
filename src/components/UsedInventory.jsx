import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  Package,
  Plus,
  Minus,
  Save,
  History,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  ShoppingBag,
  RotateCcw,
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const UsedInventory = () => {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [todayProducts, setTodayProducts] = useState([]);
  const [savedProducts, setSavedProducts] = useState([]);
  const [history, setHistory] = useState([]);

  const [expandedHistory, setExpandedHistory] = useState(null);

  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [savingProductId, setSavingProductId] = useState(null);
  const [revertingProductId, setRevertingProductId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchInventoryProducts = async () => {
    try {
      setLoadingInventory(true);

      const response = await axios.get(
        "/api/inventory-usage/getInventoryProducts",
        {
          withCredentials: true,
        },
      );

      const products = response.data?.data || response.data || [];

      setInventoryProducts(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error("Failed to fetch inventory products:", error);

      alert(
        error.response?.data?.message || "Failed to load inventory products",
      );
    } finally {
      setLoadingInventory(false);
    }
  };

  const fetchUsageByDate = async (date) => {
    try {
      setLoadingUsage(true);

      const response = await axios.get("/api/inventory-usage/getUsageByDate", {
        params: {
          date,
        },
        withCredentials: true,
      });

      const usage = response.data?.data || response.data;

      if (!usage || !Array.isArray(usage.items)) {
        setTodayProducts([]);
        setSavedProducts([]);
        return;
      }

      const products = usage.items.map((item) => {
        const inventory = item.inventory || {};

        return {
          id: Number(item.inventory_id),
          clothName: inventory.cloth_name || "",
          currentQty: Number(inventory.quantity || 0),
          usedQty: Number(item.quantity || 0),
          buyingPrice: Number(item.buying_price || 0),
          sellingPrice: Number(item.selling_price || 0),
          usageItemId: Number(item.id),
          createdAt: item.created_at || null,
        };
      });

      setTodayProducts(products);

      setSavedProducts(
        products.map((item) => ({
          id: item.id,
          usageItemId: item.usageItemId,
          clothName: item.clothName,
          quantity: item.usedQty,
          buyingPrice: item.buyingPrice,
          sellingPrice: item.sellingPrice,
          totalAmount: item.usedQty * item.sellingPrice,
          createdAt: item.createdAt,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch usage:", error);

      if (error.response?.status === 404) {
        setTodayProducts([]);
        setSavedProducts([]);
        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to load usage for selected date",
      );
    } finally {
      setLoadingUsage(false);
    }
  };

  const fetchUsageHistory = async () => {
    try {
      setLoadingHistory(true);

      const response = await axios.get("/api/inventory-usage/getUsageHistory", {
        withCredentials: true,
      });

      const data = response.data?.data || response.data || [];

      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch usage history:", error);

      alert(error.response?.data?.message || "Failed to load usage history");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchInventoryProducts();
    fetchUsageHistory();
  }, []);

  useEffect(() => {
    fetchUsageByDate(selectedDate);
  }, [selectedDate]);

  const availableProducts = useMemo(() => {
    if (!Array.isArray(inventoryProducts)) {
      return [];
    }

    return inventoryProducts.filter(
      (product) =>
        !todayProducts.some((item) => Number(item.id) === Number(product.id)),
    );
  }, [inventoryProducts, todayProducts]);

  const normalizeInventoryProduct = (product) => ({
    id: Number(product.id),
    clothName: product.cloth_name || "",
    currentQty: Number(product.quantity || 0),
    buyingPrice: Number(product.buying_price || 0),
    sellingPrice: Number(product.selling_price || 0),
  });

  const handleAddProduct = () => {
    if (!selectedProductId) {
      return;
    }

    const product = inventoryProducts.find(
      (item) => Number(item.id) === Number(selectedProductId),
    );

    if (!product) {
      return;
    }

    const normalizedProduct = normalizeInventoryProduct(product);

    setTodayProducts((prev) => [
      ...prev,
      {
        ...normalizedProduct,
        usedQty: 0,
        usageItemId: null,
        createdAt: null,
      },
    ]);

    setSelectedProductId("");
    setShowProductModal(false);
  };

  const removeProduct = (id) => {
    setTodayProducts((prev) =>
      prev.filter((item) => Number(item.id) !== Number(id)),
    );
  };

  const updateUsedQty = (id, type) => {
    setTodayProducts((prev) =>
      prev.map((item) => {
        if (Number(item.id) !== Number(id)) {
          return item;
        }

        if (item.usageItemId) {
          return item;
        }

        if (type === "plus") {
          if (item.usedQty >= item.currentQty) {
            return item;
          }

          return {
            ...item,
            usedQty: item.usedQty + 1,
          };
        }

        if (type === "minus") {
          if (item.usedQty <= 0) {
            return item;
          }

          return {
            ...item,
            usedQty: item.usedQty - 1,
          };
        }

        return item;
      }),
    );
  };

  const saveProduct = async (id) => {
    const product = todayProducts.find(
      (item) => Number(item.id) === Number(id),
    );

    if (!product || product.usedQty <= 0 || product.usageItemId) {
      return;
    }

    try {
      setSavingProductId(id);

      await axios.post(
        "/api/inventory-usage/saveUsageItem",
        {
          usage_date: selectedDate,
          inventory_id: product.id,
          quantity: product.usedQty,
        },
        {
          withCredentials: true,
        },
      );

      await Promise.all([
        fetchInventoryProducts(),
        fetchUsageByDate(selectedDate),
        fetchUsageHistory(),
      ]);
    } catch (error) {
      console.error("Failed to save usage:", error);

      alert(error.response?.data?.message || "Failed to save inventory usage");
    } finally {
      setSavingProductId(null);
    }
  };

  const revertHistoryProduct = async (product) => {
    const usageItemId = Number(product?.id || product?.usage_item_id);

    if (!usageItemId) {
      return;
    }

    const productName = getHistoryProductName(product);
    const quantity = Number(product.quantity || 0);

    const confirmed = window.confirm(
      `Revert "${productName}"?\n\n${quantity} item(s) will be returned to inventory.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setRevertingProductId(usageItemId);

      await axios.post(
        "/api/inventory-usage/revertUsageItem",
        {
          usage_item_id: usageItemId,
        },
        {
          withCredentials: true,
        },
      );

      await Promise.all([
        fetchInventoryProducts(),
        fetchUsageByDate(selectedDate),
        fetchUsageHistory(),
      ]);
    } catch (error) {
      console.error("Failed to revert history product:", error);

      alert(error.response?.data?.message || "Failed to revert product");
    } finally {
      setRevertingProductId(null);
    }
  };

  const totalUsedToday = savedProducts.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  const toggleHistory = (id) => {
    setExpandedHistory((prev) => (prev === id ? null : id));
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  const getHistoryProducts = (day) => {
    if (Array.isArray(day.items)) {
      return day.items;
    }

    if (Array.isArray(day.products)) {
      return day.products;
    }

    return [];
  };

  const getHistoryProductName = (product) => {
    return (
      product.inventory?.cloth_name ||
      product.cloth_name ||
      product.clothName ||
      "Unknown Product"
    );
  };

  const logout = async () => {
    try {
      await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen md:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} onLogout={logout} />
        <main className="pt-20">
          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#172033]">
                  Used Inventory
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Record the clothes used or sold.
                </p>
              </div>

              <div className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:w-auto">
                <CalendarDays size={18} className="shrink-0 text-[#8f681d]" />

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    Usage Date
                  </p>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-0.5 w-full bg-transparent text-sm font-medium text-[#172033] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Clothes Used
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold text-[#172033]">
                      {loadingUsage ? "..." : totalUsedToday}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Successfully saved usage
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-[#d9a441]">
                    <ShoppingBag size={21} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Products Added
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold text-[#172033]">
                      {todayProducts.length}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Products selected
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <Package size={21} />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1e6c9] text-[#8f681d]">
                    <Package size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#172033]">
                      Today's Usage
                    </h2>

                    <p className="text-xs text-gray-400">
                      Add products and enter the quantity used
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowProductModal(true)}
                  disabled={loadingInventory || availableProducts.length === 0}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#172033] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#222d42] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  <Plus size={16} />

                  {loadingInventory ? "Loading..." : "Add Product"}
                </button>
              </div>

              {loadingUsage ? (
                <div className="px-5 py-14 text-center sm:px-6">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#d9a441]" />

                  <p className="mt-4 text-sm text-gray-400">Loading usage...</p>
                </div>
              ) : todayProducts.length === 0 ? (
                <div className="px-5 py-14 text-center sm:px-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <Package size={22} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[#172033]">
                    No products added
                  </h3>

                  <p className="mx-auto mt-1 max-w-sm text-xs text-gray-400">
                    Click Add Product to select clothes from your inventory.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowProductModal(true)}
                    disabled={
                      loadingInventory || availableProducts.length === 0
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#d9a441] px-4 py-2.5 text-sm font-medium text-[#172033] transition hover:bg-[#c99432] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus size={16} />
                    Add Product
                  </button>
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[850px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/70">
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Product
                          </th>

                          <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Current Qty
                          </th>

                          <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Used Qty
                          </th>

                          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {todayProducts.map((item) => {
                          const isSaved = Boolean(item.usageItemId);
                          const isSaving = savingProductId === item.id;
                          return (
                            <tr
                              key={`${item.id}-${item.usageItemId || "new"}`}
                              className="transition hover:bg-gray-50/70"
                            >
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1e6c9] text-[#8f681d]">
                                    <Package size={18} />
                                  </div>

                                  <div>
                                    <p className="text-sm font-medium text-[#172033]">
                                      {item.clothName}
                                    </p>

                                    <p className="text-xs text-gray-400">
                                      Item #{String(item.id).padStart(3, "0")}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-5 text-center">
                                <span className="text-sm font-semibold text-[#172033]">
                                  {item.currentQty}
                                </span>
                              </td>

                              <td className="px-6 py-5">
                                <div className="flex items-center justify-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateUsedQty(item.id, "minus")
                                    }
                                    disabled={
                                      item.usedQty === 0 || isSaved || isSaving
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <Minus size={15} />
                                  </button>

                                  <span className="flex h-9 min-w-10 items-center justify-center rounded-lg bg-[#172033] px-3 text-sm font-semibold text-white">
                                    {item.usedQty}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateUsedQty(item.id, "plus")
                                    }
                                    disabled={
                                      item.usedQty >= item.currentQty ||
                                      isSaved ||
                                      isSaving
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d9a441] text-[#172033] transition hover:bg-[#c99432] disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <Plus size={15} />
                                  </button>
                                </div>
                              </td>

                              <td className="px-6 py-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {!isSaved ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => removeProduct(item.id)}
                                        disabled={isSaving}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        <X size={14} />
                                        Remove
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => saveProduct(item.id)}
                                        disabled={
                                          item.usedQty === 0 || isSaving
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#172033] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#222d42] disabled:cursor-not-allowed disabled:opacity-30"
                                      >
                                        <Save size={14} />

                                        {isSaving ? "Saving..." : "Save"}
                                      </button>
                                    </>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-2 text-xs font-medium text-green-600">
                                      <CheckCircle2 size={14} />
                                      Saved
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-3 p-4 md:hidden">
                    {todayProducts.map((item) => {
                      const isSaved = Boolean(item.usageItemId);
                      const isSaving = savingProductId === item.id;
                      return (
                        <div
                          key={`${item.id}-${item.usageItemId || "new"}`}
                          className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1e6c9] text-[#8f681d]">
                                <Package size={18} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#172033]">
                                  {item.clothName}
                                </p>

                                <p className="text-xs text-gray-400">
                                  Stock: {item.currentQty}
                                </p>
                              </div>
                            </div>

                            {isSaved && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-600">
                                <CheckCircle2 size={12} />
                                Saved
                              </span>
                            )}
                          </div>

                          <div className="mt-4 flex items-center justify-between rounded-lg bg-white p-2">
                            <button
                              type="button"
                              onClick={() => updateUsedQty(item.id, "minus")}
                              disabled={
                                item.usedQty === 0 || isSaved || isSaving
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus size={17} />
                            </button>

                            <div className="text-center">
                              <p className="text-[10px] uppercase tracking-wide text-gray-400">
                                Used
                              </p>

                              <p className="text-lg font-semibold text-[#172033]">
                                {item.usedQty}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => updateUsedQty(item.id, "plus")}
                              disabled={
                                item.usedQty >= item.currentQty ||
                                isSaved ||
                                isSaving
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d9a441] text-[#172033] transition hover:bg-[#c99432] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus size={17} />
                            </button>
                          </div>

                          <div className="mt-3 flex gap-2">
                            {!isSaved ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => removeProduct(item.id)}
                                  disabled={isSaving}
                                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <X size={14} />
                                  Remove
                                </button>

                                <button
                                  type="button"
                                  onClick={() => saveProduct(item.id)}
                                  disabled={item.usedQty === 0 || isSaving}
                                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#172033] px-3 py-2.5 text-xs font-medium text-white transition hover:bg-[#222d42] disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  <Save size={14} />

                                  {isSaving ? "Saving..." : "Save"}
                                </button>
                              </>
                            ) : (
                              <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-50 px-3 py-2.5 text-xs font-medium text-green-600">
                                <CheckCircle2 size={14} />
                                Saved
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Total Saved
                      </span>

                      <span className="text-lg font-semibold text-[#172033]">
                        {totalUsedToday}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <History size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-[#172033]">
                    Recent Usage History
                  </h2>

                  <p className="text-xs text-gray-400">
                    Last 10 days of inventory usage
                  </p>
                </div>
              </div>

              {loadingHistory ? (
                <div className="px-5 py-10 text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-[#d9a441]" />

                  <p className="mt-3 text-sm text-gray-400">
                    Loading history...
                  </p>
                </div>
              ) : history.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-gray-400">
                    No usage history found.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {history.slice(0, 10).map((day) => {
                    const isExpanded = expandedHistory === day.id;

                    const products = getHistoryProducts(day);

                    const totalUsed = Number(
                      day.total_items ??
                        products.reduce(
                          (sum, product) => sum + Number(product.quantity || 0),
                          0,
                        ),
                    );

                    const totalSellingAmount = products.reduce(
                      (sum, product) =>
                        sum +
                        Number(product.quantity || 0) *
                          Number(
                            product.selling_price ?? product.sellingPrice ?? 0,
                          ),
                      0,
                    );

                    return (
                      <div key={day.id}>
                        {/* History Header */}
                        <button
                          type="button"
                          onClick={() => toggleHistory(day.id)}
                          className="
            group
            w-full
            px-5 py-4
            sm:px-6 sm:py-5
            text-left
            transition
            hover:bg-[#faf9f6]
          "
                        >
                          <div className="flex items-center justify-between gap-4">
                            {/* Left */}
                            <div className="flex min-w-0 items-center gap-3.5">
                              <div
                                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-xl
                  bg-[#f6f4ef]
                  text-[#8f681d]
                  ring-1 ring-[#e8dfc9]
                "
                              >
                                <CalendarDays size={17} strokeWidth={1.8} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#172033]">
                                  {formatDate(day.usage_date || day.date)}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {products.length}{" "}
                                  {products.length === 1
                                    ? "product"
                                    : "products"}{" "}
                                  used
                                </p>
                              </div>
                            </div>

                            {/* Right summary */}
                            <div className="flex shrink-0 items-center gap-4 sm:gap-6">
                              {/* Quantity */}
                              <div className="hidden text-right sm:block">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                  Quantity
                                </p>

                                <p className="mt-1 text-sm font-semibold text-[#172033]">
                                  {totalUsed}
                                </p>
                              </div>

                              {/* Amount */}
                              <div className="text-right">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                  Total
                                </p>

                                <p className="mt-1 text-sm font-semibold text-[#8f681d]">
                                  {formatCurrency(totalSellingAmount)}
                                </p>
                              </div>

                              {/* Expand icon */}
                              <div
                                className="
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-lg
                  text-gray-400
                  transition
                  group-hover:bg-gray-100
                "
                              >
                                {isExpanded ? (
                                  <ChevronUp size={17} strokeWidth={1.8} />
                                ) : (
                                  <ChevronDown size={17} strokeWidth={1.8} />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Mobile quantity */}
                          <div className="mt-3 flex items-center gap-2 sm:hidden">
                            <span className="rounded-full bg-[#f1e6c9] px-2.5 py-1 text-[11px] font-medium text-[#8f681d]">
                              {totalUsed} used
                            </span>

                            <span className="text-xs text-gray-400">·</span>

                            <span className="text-xs text-gray-400">
                              {formatCurrency(totalSellingAmount)}
                            </span>
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-[#faf9f6] px-5 py-5 sm:px-6">
                            {/* Section Header */}
                            <div className="mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f1e6c9] text-[#8f681d]">
                                  <ShoppingBag size={14} strokeWidth={1.8} />
                                </div>

                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                                  Selling Details
                                </p>
                              </div>

                              <span className="text-xs text-gray-400">
                                {products.length}{" "}
                                {products.length === 1 ? "item" : "items"}
                              </span>
                            </div>

                            {/* Products */}
                            <div className="space-y-2.5">
                              {products.map((product) => {
                                const usageItemId = Number(
                                  product.id || product.usage_item_id,
                                );

                                const quantity = Number(product.quantity || 0);

                                const sellingPrice = Number(
                                  product.selling_price ??
                                    product.sellingPrice ??
                                    0,
                                );

                                const totalAmount = quantity * sellingPrice;

                                const createdAt =
                                  product.created_at ||
                                  product.createdAt ||
                                  null;

                                const createdDate = createdAt
                                  ? new Date(createdAt)
                                  : null;

                                const age = createdDate
                                  ? Date.now() - createdDate.getTime()
                                  : NaN;

                                const tenDays = 10 * 24 * 60 * 60 * 1000;

                                const canRevert =
                                  createdDate &&
                                  !Number.isNaN(createdDate.getTime()) &&
                                  age >= 0 &&
                                  age <= tenDays;

                                const isReverting =
                                  revertingProductId === usageItemId;

                                return (
                                  <div
                                    key={usageItemId || product.inventory_id}
                                    className="
                      rounded-xl
                      border border-gray-100
                      bg-white
                      px-4 py-3.5
                      shadow-[0_2px_8px_rgba(23,32,51,0.03)]
                    "
                                  >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                      {/* Product */}
                                      <div className="flex min-w-0 items-center gap-3">
                                        <div
                                          className="
                            flex h-9 w-9 shrink-0
                            items-center justify-center
                            rounded-lg
                            bg-[#f6f4ef]
                            text-[#8f681d]
                          "
                                        >
                                          <Package
                                            size={15}
                                            strokeWidth={1.8}
                                          />
                                        </div>

                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-medium text-[#172033]">
                                            {getHistoryProductName(product)}
                                          </p>

                                          <p className="mt-0.5 text-xs text-gray-400">
                                            {formatCurrency(sellingPrice)} per
                                            item
                                          </p>
                                        </div>
                                      </div>

                                      {/* Metrics + Action */}
                                      <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-5">
                                        {/* Quantity */}
                                        <div className="text-right">
                                          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                            Qty
                                          </p>

                                          <p className="mt-0.5 text-sm font-semibold text-[#172033]">
                                            {quantity}
                                          </p>
                                        </div>

                                        {/* Divider */}
                                        <div className="h-8 w-px bg-gray-200" />

                                        {/* Amount */}
                                        <div className="text-right">
                                          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                            Amount
                                          </p>

                                          <p className="mt-0.5 text-sm font-semibold text-[#8f681d]">
                                            {formatCurrency(totalAmount)}
                                          </p>
                                        </div>

                                        {/* Revert */}
                                        {canRevert && (
                                          <>
                                            <div className="hidden h-8 w-px bg-gray-200 sm:block" />

                                            <button
                                              type="button"
                                              onClick={() =>
                                                revertHistoryProduct(product)
                                              }
                                              disabled={isReverting}
                                              title="Revert this usage"
                                              className="
                                flex h-9 w-9 shrink-0
                                items-center justify-center
                                rounded-lg
                                border border-orange-200
                                bg-orange-50
                                text-orange-600
                                transition
                                hover:border-orange-300
                                hover:bg-orange-100
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                              "
                                            >
                                              <RotateCcw
                                                size={14}
                                                strokeWidth={1.8}
                                                className={
                                                  isReverting
                                                    ? "animate-spin"
                                                    : ""
                                                }
                                              />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Footer Summary */}
                            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                              <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                  Daily Summary
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  Total clothes used
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-base font-semibold text-[#172033]">
                                  {totalUsed}
                                </p>

                                <p className="mt-0.5 text-xs font-medium text-[#8f681d]">
                                  {formatCurrency(totalSellingAmount)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showProductModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-[#172033]">Add Product</h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  Select a product from inventory
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowProductModal(false);
                  setSelectedProductId("");
                }}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Product
              </label>

              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={loadingInventory}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-[#172033] outline-none transition focus:border-[#d9a441] disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                <option value="">
                  {loadingInventory ? "Loading products..." : "Select product"}
                </option>

                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.cloth_name} — Stock: {product.quantity}
                  </option>
                ))}
              </select>

              {availableProducts.length === 0 && !loadingInventory && (
                <p className="mt-2 text-xs text-red-500">
                  All inventory products have already been added.
                </p>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setSelectedProductId("");
                  }}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={!selectedProductId || loadingInventory}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#172033] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#222d42] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={16} />
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsedInventory;
