import React, { useMemo, useState } from "react";
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
  const [selectedDate, setSelectedDate] = useState("2026-09-16");

  /* =========================================================
     INVENTORY PRODUCTS
  ========================================================= */

  const inventoryProducts = [
    {
      id: 1,
      clothName: "Cotton White Shirt",
      currentQty: 25,
    },
    {
      id: 2,
      clothName: "Blue Denim Jeans",
      currentQty: 18,
    },
    {
      id: 3,
      clothName: "Black Formal Pant",
      currentQty: 12,
    },
    {
      id: 4,
      clothName: "Linen Kurta",
      currentQty: 20,
    },
    {
      id: 5,
      clothName: "Premium T-Shirt",
      currentQty: 30,
    },
  ];

  /* =========================================================
     TODAY'S SELECTED PRODUCTS

     Products are added using the Add Product button.
     Every newly added product starts with usedQty = 0.
  ========================================================= */

  const [todayProducts, setTodayProducts] = useState([]);

  /* =========================================================
     HISTORY - LAST 10 DAYS
  ========================================================= */

  const [history] = useState([
    {
      id: 1,
      date: "16 Sep 2026",
      totalUsed: 8,
      products: [
        {
          id: 1,
          clothName: "Cotton White Shirt",
          quantity: 3,
        },
        {
          id: 2,
          clothName: "Blue Denim Jeans",
          quantity: 2,
        },
        {
          id: 4,
          clothName: "Linen Kurta",
          quantity: 3,
        },
      ],
    },
    {
      id: 2,
      date: "15 Sep 2026",
      totalUsed: 11,
      products: [
        {
          id: 1,
          clothName: "Cotton White Shirt",
          quantity: 5,
        },
        {
          id: 3,
          clothName: "Black Formal Pant",
          quantity: 2,
        },
        {
          id: 5,
          clothName: "Premium T-Shirt",
          quantity: 4,
        },
      ],
    },
    {
      id: 3,
      date: "14 Sep 2026",
      totalUsed: 6,
      products: [
        {
          id: 2,
          clothName: "Blue Denim Jeans",
          quantity: 2,
        },
        {
          id: 4,
          clothName: "Linen Kurta",
          quantity: 4,
        },
      ],
    },
    {
      id: 4,
      date: "13 Sep 2026",
      totalUsed: 9,
      products: [
        {
          id: 1,
          clothName: "Cotton White Shirt",
          quantity: 4,
        },
        {
          id: 5,
          clothName: "Premium T-Shirt",
          quantity: 5,
        },
      ],
    },
    {
      id: 5,
      date: "12 Sep 2026",
      totalUsed: 7,
      products: [
        {
          id: 3,
          clothName: "Black Formal Pant",
          quantity: 3,
        },
        {
          id: 4,
          clothName: "Linen Kurta",
          quantity: 4,
        },
      ],
    },
    {
      id: 6,
      date: "11 Sep 2026",
      totalUsed: 12,
      products: [
        {
          id: 1,
          clothName: "Cotton White Shirt",
          quantity: 6,
        },
        {
          id: 2,
          clothName: "Blue Denim Jeans",
          quantity: 3,
        },
        {
          id: 5,
          clothName: "Premium T-Shirt",
          quantity: 3,
        },
      ],
    },
    {
      id: 7,
      date: "10 Sep 2026",
      totalUsed: 5,
      products: [
        {
          id: 4,
          clothName: "Linen Kurta",
          quantity: 2,
        },
        {
          id: 5,
          clothName: "Premium T-Shirt",
          quantity: 3,
        },
      ],
    },
    {
      id: 8,
      date: "09 Sep 2026",
      totalUsed: 10,
      products: [
        {
          id: 1,
          clothName: "Cotton White Shirt",
          quantity: 4,
        },
        {
          id: 3,
          clothName: "Black Formal Pant",
          quantity: 3,
        },
        {
          id: 4,
          clothName: "Linen Kurta",
          quantity: 3,
        },
      ],
    },
    {
      id: 9,
      date: "08 Sep 2026",
      totalUsed: 8,
      products: [
        {
          id: 2,
          clothName: "Blue Denim Jeans",
          quantity: 4,
        },
        {
          id: 5,
          clothName: "Premium T-Shirt",
          quantity: 4,
        },
      ],
    },
    {
      id: 10,
      date: "07 Sep 2026",
      totalUsed: 6,
      products: [
        {
          id: 1,
          clothName: "Cotton White Shirt",
          quantity: 2,
        },
        {
          id: 4,
          clothName: "Linen Kurta",
          quantity: 4,
        },
      ],
    },
  ]);

  /* =========================================================
     STATE
  ========================================================= */

  const [expandedHistory, setExpandedHistory] = useState(null);

  const [showProductModal, setShowProductModal] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState("");

  const [savedProducts, setSavedProducts] = useState([]);

  /* =========================================================
     AVAILABLE PRODUCTS

     Don't show products that have already been added today.
  ========================================================= */

  const availableProducts = useMemo(() => {
    return inventoryProducts.filter(
      (product) => !todayProducts.some((item) => item.id === product.id),
    );
  }, [todayProducts]);

  /* =========================================================
     ADD PRODUCT
  ========================================================= */

  const handleAddProduct = () => {
    if (!selectedProductId) return;

    const product = inventoryProducts.find(
      (item) => item.id === Number(selectedProductId),
    );

    if (!product) return;

    setTodayProducts((prev) => [
      ...prev,
      {
        ...product,
        usedQty: 0,
      },
    ]);

    setSelectedProductId("");
    setShowProductModal(false);
  };

  /* =========================================================
     REMOVE PRODUCT BEFORE SAVING
  ========================================================= */

  const removeProduct = (id) => {
    setTodayProducts((prev) => prev.filter((item) => item.id !== id));
  };

  /* =========================================================
     UPDATE QUANTITY
  ========================================================= */

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

  /* =========================================================
     SAVE INDIVIDUAL PRODUCT
  ========================================================= */

  const saveProduct = (id) => {
    const product = todayProducts.find((item) => item.id === id);

    if (!product || product.usedQty === 0) {
      return;
    }

    setSavedProducts((prev) => {
      const alreadySaved = prev.some((item) => item.id === id);

      if (alreadySaved) {
        return prev.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: product.usedQty,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          clothName: product.clothName,
          quantity: product.usedQty,
        },
      ];
    });
  };

  /* =========================================================
     TOTAL TODAY
  ========================================================= */

  const totalUsedToday = savedProducts.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  /* =========================================================
     TOGGLE HISTORY
  ========================================================= */

  const toggleHistory = (id) => {
    setExpandedHistory((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb]">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />

      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <div className="min-h-screen md:ml-64">
        {/* =====================================================
            NAVBAR
        ====================================================== */}

        <Navbar
          onLogout={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        />

        {/* =====================================================
            MAIN
        ====================================================== */}

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

              {/* DATE */}

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
              {/* Total Used */}

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Clothes Used Today
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold text-[#172033]">
                      {totalUsedToday}
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

              {/* Products */}

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
              {/* HEADER */}

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

                {/* ADD PRODUCT */}

                <button
                  type="button"
                  onClick={() => setShowProductModal(true)}
                  disabled={availableProducts.length === 0}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#172033] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#222d42] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  <Plus size={16} />
                  Add Product
                </button>
              </div>

              {/* =================================================
                  PRODUCTS
              ================================================== */}

              {todayProducts.length === 0 ? (
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
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#d9a441] px-4 py-2.5 text-sm font-medium text-[#172033] transition hover:bg-[#c99432]"
                  >
                    <Plus size={16} />
                    Add Product
                  </button>
                </div>
              ) : (
                <>
                  {/* DESKTOP */}

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

                          return (
                            <tr
                              key={item.id}
                              className="transition hover:bg-gray-50/70"
                            >
                              {/* PRODUCT */}

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

                              {/* CURRENT */}

                              <td className="px-6 py-5 text-center">
                                <span className="text-sm font-semibold text-[#172033]">
                                  {item.currentQty}
                                </span>
                              </td>

                              {/* QUANTITY */}

                              <td className="px-6 py-5">
                                <div className="flex items-center justify-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateUsedQty(item.id, "minus")
                                    }
                                    disabled={item.usedQty === 0 || isSaved}
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
                                      item.usedQty >= item.currentQty || isSaved
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d9a441] text-[#172033] transition hover:bg-[#c99432] disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <Plus size={15} />
                                  </button>
                                </div>
                              </td>

                              {/* SAVE */}

                              <td className="px-6 py-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => removeProduct(item.id)}
                                    disabled={isSaved}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <X size={14} />
                                    Remove
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => saveProduct(item.id)}
                                    disabled={item.usedQty === 0}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#172033] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#222d42] disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    <Save size={14} />

                                    {isSaved ? "Saved" : "Save"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE */}

                  <div className="space-y-3 p-4 md:hidden">
                    {todayProducts.map((item) => {
                      const isSaved = savedProducts.some(
                        (saved) => saved.id === item.id,
                      );

                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
                        >
                          {/* PRODUCT */}

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

                          {/* QUANTITY */}

                          <div className="mt-4 flex items-center justify-between rounded-lg bg-white p-2">
                            <button
                              type="button"
                              onClick={() => updateUsedQty(item.id, "minus")}
                              disabled={item.usedQty === 0 || isSaved}
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
                                item.usedQty >= item.currentQty || isSaved
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d9a441] text-[#172033] transition hover:bg-[#c99432] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus size={17} />
                            </button>
                          </div>

                          {/* ACTIONS */}

                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => removeProduct(item.id)}
                              disabled={isSaved}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <X size={14} />
                              Remove
                            </button>

                            <button
                              type="button"
                              onClick={() => saveProduct(item.id)}
                              disabled={item.usedQty === 0}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#172033] px-3 py-2.5 text-xs font-medium text-white transition hover:bg-[#222d42] disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Save size={14} />

                              {isSaved ? "Saved" : "Save"}
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
              {/* HEADER */}

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

              {/* HISTORY */}

              <div className="divide-y divide-gray-100">
                {history.slice(0, 10).map((day) => {
                  const isExpanded = expandedHistory === day.id;

                  return (
                    <div key={day.id}>
                      {/* DAY ROW */}

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
                              {day.date}
                            </p>

                            <p className="text-xs text-gray-400">
                              {day.products.length} products used
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <span className="rounded-full bg-[#f1e6c9] px-3 py-1 text-xs font-medium text-[#8f681d]">
                            {day.totalUsed} used
                          </span>

                          {isExpanded ? (
                            <ChevronUp size={18} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={18} className="text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* EXPANDED DETAILS */}

                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:px-6">
                          <div className="mb-3 flex items-center gap-2">
                            <ShoppingBag size={15} className="text-[#8f681d]" />

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Selling Details
                            </p>
                          </div>

                          <div className="space-y-2">
                            {day.products.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f1e6c9] text-[#8f681d]">
                                    <Package size={15} />
                                  </div>

                                  <span className="truncate text-sm font-medium text-gray-600">
                                    {product.clothName}
                                  </span>
                                </div>

                                <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                                  {product.quantity} sold
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* TOTAL */}

                          <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                            <span className="text-xs font-medium text-gray-500">
                              Total clothes used
                            </span>

                            <span className="text-sm font-semibold text-[#172033]">
                              {day.totalUsed}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-[#172033]">Add Product</h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  Select a product from inventory
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="p-5">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Product
              </label>

              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-[#172033] outline-none transition focus:border-[#d9a441]"
              >
                <option value="">Select product</option>

                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.clothName} — Stock: {product.currentQty}
                  </option>
                ))}
              </select>

              {/* MODAL ACTIONS */}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={!selectedProductId}
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
