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
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const UsedInventory = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // =========================================================
  // STATE
  // =========================================================

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

  // =========================================================
  // GET INVENTORY PRODUCTS
  // =========================================================

  const fetchInventoryProducts = async () => {
    try {
      setLoadingInventory(true);

      const response = await axios.get(
        "/api/inventory-usage/getInventoryProducts",
      );

      const products = response.data?.data || response.data || [];

      setInventoryProducts(products);
    } catch (error) {
      console.error("Failed to fetch inventory products:", error);

      alert(
        error.response?.data?.message || "Failed to load inventory products",
      );
    } finally {
      setLoadingInventory(false);
    }
  };

  // =========================================================
  // GET USAGE BY SELECTED DATE
  // =========================================================

  const fetchUsageByDate = async (date) => {
    try {
      setLoadingUsage(true);

      const response = await axios.get("/api/inventory-usage/getUsageByDate", {
        params: {
          date: date,
        },
      });

      const usage = response.data?.data || response.data;

      /*
        Expected backend response:

        {
          id: 1,
          usage_date: "2026-09-16",
          total_items: 8,
          items: [
            {
              id: 1,
              inventory_id: 1,
              quantity: 3,
              buying_price: "100.00",
              selling_price: "200.00",
              total_amount: "600.00",
              inventory: {
                id: 1,
                cloth_name: "Cotton White Shirt",
                quantity: 25
              }
            }
          ]
        }
      */

      if (!usage || !usage.items) {
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

          usageItemId: item.id,
        };
      });

      setTodayProducts(products);

      setSavedProducts(
        products
          .filter((item) => item.usedQty > 0)
          .map((item) => ({
            id: item.id,
            clothName: item.clothName,
            quantity: item.usedQty,
            buyingPrice: item.buyingPrice,
            sellingPrice: item.sellingPrice,
            totalAmount: item.usedQty * item.sellingPrice,
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

  // =========================================================
  // GET LAST 10 DAYS HISTORY
  // =========================================================

  const fetchUsageHistory = async () => {
    try {
      setLoadingHistory(true);

      const response = await axios.get("/api/inventory-usage/getUsageHistory");

      const data = response.data?.data || response.data || [];

      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch usage history:", error);

      alert(error.response?.data?.message || "Failed to load usage history");
    } finally {
      setLoadingHistory(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchInventoryProducts();
    fetchUsageHistory();
  }, []);

  // =========================================================
  // LOAD USAGE WHEN DATE CHANGES
  // =========================================================

  useEffect(() => {
    fetchUsageByDate(selectedDate);
  }, [selectedDate]);

  // =========================================================
  // AVAILABLE PRODUCTS
  // =========================================================

  const availableProducts = useMemo(() => {
    if (!Array.isArray(inventoryProducts)) {
      return [];
    }

    return inventoryProducts.filter(
      (product) =>
        !todayProducts.some((item) => Number(item.id) === Number(product.id)),
    );
  }, [inventoryProducts, todayProducts]);

  // =========================================================
  // NORMALIZE INVENTORY
  // =========================================================

  const normalizeInventoryProduct = (product) => ({
    id: Number(product.id),
    clothName: product.cloth_name,
    currentQty: Number(product.quantity || 0),
    buyingPrice: Number(product.buying_price || 0),
    sellingPrice: Number(product.selling_price || 0),
  });

  // =========================================================
  // ADD PRODUCT
  // =========================================================

  const handleAddProduct = () => {
    if (!selectedProductId) return;

    const product = inventoryProducts.find(
      (item) => Number(item.id) === Number(selectedProductId),
    );

    if (!product) return;

    const normalizedProduct = normalizeInventoryProduct(product);

    setTodayProducts((prev) => [
      ...prev,
      {
        ...normalizedProduct,
        usedQty: 0,
      },
    ]);

    setSelectedProductId("");
    setShowProductModal(false);
  };

  // =========================================================
  // REMOVE PRODUCT BEFORE SAVING
  // =========================================================

  const removeProduct = (id) => {
    setTodayProducts((prev) => prev.filter((item) => item.id !== id));
  };

  // =========================================================
  // UPDATE QUANTITY
  // =========================================================

  const updateUsedQty = (id, type) => {
    setTodayProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

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

  // =========================================================
  // SAVE PRODUCT TO DATABASE
  // =========================================================

  const saveProduct = async (id) => {
    const product = todayProducts.find((item) => item.id === id);

    if (!product || product.usedQty === 0) {
      return;
    }

    try {
      setSavingProductId(id);

      const response = await axios.post("/api/inventory-usage/saveUsageItem", {
        usage_date: selectedDate,
        inventory_id: product.id,
        quantity: product.usedQty,
      });

      console.log("Usage saved:", response.data);

      // Update saved products immediately
      setSavedProducts((prev) => {
        const alreadySaved = prev.some((item) => item.id === id);

        const savedItem = {
          id: product.id,
          clothName: product.clothName,
          quantity: product.usedQty,
          buyingPrice: product.buyingPrice,
          sellingPrice: product.sellingPrice,
          totalAmount: product.usedQty * product.sellingPrice,
        };

        if (alreadySaved) {
          return prev.map((item) => (item.id === id ? savedItem : item));
        }

        return [...prev, savedItem];
      });

      /*
        Refresh inventory because the backend should decrease
        inventory.quantity after saving usage.
      */
      await fetchInventoryProducts();

      // Refresh selected day's usage
      await fetchUsageByDate(selectedDate);

      // Refresh history
      await fetchUsageHistory();
    } catch (error) {
      console.error("Failed to save usage:", error);

      alert(error.response?.data?.message || "Failed to save inventory usage");
    } finally {
      setSavingProductId(null);
    }
  };

  // =========================================================
  // TOTAL TODAY
  // =========================================================

  const totalUsedToday = savedProducts.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  // =========================================================
  // TOGGLE HISTORY
  // =========================================================

  const toggleHistory = (id) => {
    setExpandedHistory((prev) => (prev === id ? null : id));
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "";

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

  // =========================================================
  // GET HISTORY PRODUCTS
  // =========================================================

  const getHistoryProducts = (day) => {
    return day.items || day.products || [];
  };

  // =========================================================
  // GET HISTORY PRODUCT NAME
  // =========================================================

  const getHistoryProductName = (product) => {
    return (
      product.inventory?.cloth_name ||
      product.cloth_name ||
      product.clothName ||
      "Unknown Product"
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb]">
      <Sidebar />

      <div className="min-h-screen md:ml-64">
        <Navbar
          onLogout={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        />

        <main className="pt-20">
          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* =================================================
                PAGE HEADER
            ================================================== */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#172033]">
                  Used Inventory
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Record the clothes used or sold today.
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

            {/* =================================================
                SUMMARY
            ================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Clothes Used Today
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
                      Products selected for today
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <Package size={21} />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                TODAY'S USAGE
            ================================================== */}

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

              {/* =================================================
                  LOADING
              ================================================== */}

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
                    Click "Add Product" to select clothes from your inventory.
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
                  {/* =================================================
                      DESKTOP
                  ================================================== */}

                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[750px]">
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
                          const isSaved = savedProducts.some(
                            (saved) => saved.id === item.id,
                          );

                          const isSaving = savingProductId === item.id;

                          return (
                            <tr
                              key={item.id}
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
                                  <button
                                    type="button"
                                    onClick={() => removeProduct(item.id)}
                                    disabled={isSaved || isSaving}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <X size={14} />
                                    Remove
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => saveProduct(item.id)}
                                    disabled={
                                      item.usedQty === 0 || isSaved || isSaving
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#172033] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#222d42] disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    <Save size={14} />

                                    {isSaving
                                      ? "Saving..."
                                      : isSaved
                                        ? "Saved"
                                        : "Save"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* =================================================
                      MOBILE
                  ================================================== */}

                  <div className="space-y-3 p-4 md:hidden">
                    {todayProducts.map((item) => {
                      const isSaved = savedProducts.some(
                        (saved) => saved.id === item.id,
                      );

                      const isSaving = savingProductId === item.id;

                      return (
                        <div
                          key={item.id}
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
                            <button
                              type="button"
                              onClick={() => removeProduct(item.id)}
                              disabled={isSaved || isSaving}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <X size={14} />
                              Remove
                            </button>

                            <button
                              type="button"
                              onClick={() => saveProduct(item.id)}
                              disabled={
                                item.usedQty === 0 || isSaved || isSaving
                              }
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#172033] px-3 py-2.5 text-xs font-medium text-white transition hover:bg-[#222d42] disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Save size={14} />

                              {isSaving
                                ? "Saving..."
                                : isSaved
                                  ? "Saved"
                                  : "Save"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* TOTAL */}

                  <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Total Saved Today
                      </span>

                      <span className="text-lg font-semibold text-[#172033]">
                        {totalUsedToday}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* =================================================
                LAST 10 DAYS HISTORY
            ================================================== */}

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
                  {Array.isArray(history) &&
                    history.slice(0, 10).map((day) => {
                      const isExpanded = expandedHistory === day.id;

                      const products = Array.isArray(day.items)
                        ? day.items
                        : [];

                      const totalUsed = Number(
                        day.total_items ??
                          products.reduce(
                            (sum, product) =>
                              sum + Number(product.quantity || 0),
                            0,
                          ),
                      );

                      return (
                        <div key={day.id}>
                          <button
                            type="button"
                            onClick={() => toggleHistory(day.id)}
                            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-gray-50 sm:px-6"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                <CalendarDays size={16} />
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#172033]">
                                  {formatDate(day.usage_date || day.date)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {products.length} products used
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <span className="rounded-full bg-[#f1e6c9] px-3 py-1 text-xs font-medium text-[#8f681d]">
                                {totalUsed} used
                              </span>

                              {isExpanded ? (
                                <ChevronUp
                                  size={18}
                                  className="text-gray-400"
                                />
                              ) : (
                                <ChevronDown
                                  size={18}
                                  className="text-gray-400"
                                />
                              )}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:px-6">
                              <div className="mb-3 flex items-center gap-2">
                                <ShoppingBag
                                  size={15}
                                  className="text-[#8f681d]"
                                />

                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Selling Details
                                </p>
                              </div>

                              <div className="space-y-2">
                                {products.map((product) => (
                                  <div
                                    key={product.id || product.inventory_id}
                                    className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3"
                                  >
                                    <div className="flex min-w-0 items-center gap-3">
                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f1e6c9] text-[#8f681d]">
                                        <Package size={15} />
                                      </div>

                                      <span className="truncate text-sm font-medium text-gray-600">
                                        {getHistoryProductName(product)}
                                      </span>
                                    </div>

                                    <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                                      {Number(product.quantity || 0)} sold
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                                <span className="text-xs font-medium text-gray-500">
                                  Total clothes used
                                </span>

                                <span className="text-sm font-semibold text-[#172033]">
                                  {totalUsed}
                                </span>
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

      {/* =====================================================
          ADD PRODUCT MODAL
      ====================================================== */}

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
