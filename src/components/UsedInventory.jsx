import React, { useState } from "react";
import {
  CalendarDays,
  Package,
  Plus,
  Minus,
  Save,
  History,
  CheckCircle2,
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const UsedInventory = () => {
  const [selectedDate, setSelectedDate] = useState("2026-09-16");

  const [inventory, setInventory] = useState([
    {
      id: 1,
      clothName: "Cotton White Shirt",
      currentQty: 25,
      usedQty: 0,
    },
    {
      id: 2,
      clothName: "Blue Denim Jeans",
      currentQty: 18,
      usedQty: 0,
    },
    {
      id: 3,
      clothName: "Black Formal Pant",
      currentQty: 12,
      usedQty: 0,
    },
    {
      id: 4,
      clothName: "Linen Kurta",
      currentQty: 20,
      usedQty: 0,
    },
    {
      id: 5,
      clothName: "Premium T-Shirt",
      currentQty: 30,
      usedQty: 0,
    },
  ]);

  const [saved, setSaved] = useState(false);

  const updateUsedQty = (id, type) => {
    setSaved(false);

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (type === "plus") {
          if (item.usedQty >= item.currentQty) return item;

          return {
            ...item,
            usedQty: item.usedQty + 1,
          };
        }

        if (type === "minus") {
          if (item.usedQty <= 0) return item;

          return {
            ...item,
            usedQty: item.usedQty - 1,
          };
        }

        return item;
      }),
    );
  };

  const handleSave = () => {
    setSaved(true);

    console.log({
      date: selectedDate,
      usedInventory: inventory,
    });
  };

  const totalUsed = inventory.reduce((total, item) => total + item.usedQty, 0);

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
            MAIN CONTENT
        ====================================================== */}
        <main className="pt-20">
          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#172033]">
                  Used Inventory
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Record clothes used from inventory for each day.
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
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSaved(false);
                    }}
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
                      {totalUsed}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Total quantity marked as used
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-[#d9a441]">
                    <Package size={21} />
                  </div>
                </div>
              </div>

              {/* Inventory Items */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Inventory Items
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold text-[#172033]">
                      {inventory.length}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Available inventory items
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <CheckCircle2 size={21} />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                USAGE TABLE
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
                      Select how many clothes were used today
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#172033] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#222d42] sm:w-auto"
                >
                  <Save size={16} />
                  Save Usage
                </button>
              </div>

              {/* =================================================
                  DESKTOP TABLE
              ================================================== */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Cloth Name
                      </th>

                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Current Qty
                      </th>

                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Used Today
                      </th>

                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Remaining
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {inventory.map((item) => {
                      const remaining = item.currentQty - item.usedQty;

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-gray-50/70"
                        >
                          {/* CLOTH */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1e6c9] text-[#8f681d]">
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

                          {/* USED */}
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() => updateUsedQty(item.id, "minus")}
                                disabled={item.usedQty === 0}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Minus size={15} />
                              </button>

                              <span className="flex h-9 min-w-10 items-center justify-center rounded-lg bg-[#172033] px-3 text-sm font-semibold text-white">
                                {item.usedQty}
                              </span>

                              <button
                                type="button"
                                onClick={() => updateUsedQty(item.id, "plus")}
                                disabled={item.usedQty >= item.currentQty}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d9a441] text-[#172033] transition hover:bg-[#c99432] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Plus size={15} />
                              </button>
                            </div>
                          </td>

                          {/* REMAINING */}
                          <td className="px-6 py-5 text-center">
                            <span
                              className={`text-sm font-semibold ${
                                remaining === 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {remaining}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE CARDS
              ================================================== */}
              <div className="space-y-3 p-4 md:hidden">
                {inventory.map((item) => {
                  const remaining = item.currentQty - item.usedQty;

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
                    >
                      {/* NAME */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1e6c9] text-[#8f681d]">
                          <Package size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#172033]">
                            {item.clothName}
                          </p>

                          <p className="text-xs text-gray-400">
                            Current stock: {item.currentQty}
                          </p>
                        </div>
                      </div>

                      {/* INFO */}
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-[11px] text-gray-400">
                            Used Today
                          </p>

                          <p className="mt-1 text-lg font-semibold text-[#172033]">
                            {item.usedQty}
                          </p>
                        </div>

                        <div className="rounded-lg bg-white p-3">
                          <p className="text-[11px] text-gray-400">Remaining</p>

                          <p
                            className={`mt-1 text-lg font-semibold ${
                              remaining === 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {remaining}
                          </p>
                        </div>
                      </div>

                      {/* CONTROLS */}
                      <div className="mt-4 flex items-center justify-between rounded-lg bg-white p-2">
                        <button
                          type="button"
                          onClick={() => updateUsedQty(item.id, "minus")}
                          disabled={item.usedQty === 0}
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
                          disabled={item.usedQty >= item.currentQty}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d9a441] text-[#172033] transition hover:bg-[#c99432] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={17} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FOOTER */}
              <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-400">
                    Usage for{" "}
                    <span className="font-medium text-gray-600">
                      {selectedDate}
                    </span>
                  </p>

                  {saved && (
                    <div className="flex items-center gap-2 text-xs font-medium text-green-600">
                      <CheckCircle2 size={15} />
                      Usage saved successfully
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                HISTORY
            ================================================== */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <History size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-[#172033]">
                    Recent Usage History
                  </h2>

                  <p className="text-xs text-gray-400">
                    Previous daily inventory usage
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {[
                  { date: "15 Sep 2026", used: 8 },
                  { date: "14 Sep 2026", used: 11 },
                  { date: "13 Sep 2026", used: 6 },
                ].map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays
                        size={16}
                        className="shrink-0 text-gray-400"
                      />

                      <span className="text-sm font-medium text-gray-600">
                        {day.date}
                      </span>
                    </div>

                    <span className="shrink-0 rounded-full bg-[#f1e6c9] px-3 py-1 text-xs font-medium text-[#8f681d]">
                      {day.used} clothes used
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UsedInventory;
