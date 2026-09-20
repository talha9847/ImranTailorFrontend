import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";

import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Package,
  Search,
  ShoppingBag,
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import { useNavigate } from "react-router-dom";

// =========================================================
// DATE HELPERS
// =========================================================

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const getThirtyDaysAgo = () => {
  const date = new Date();

  date.setDate(date.getDate() - 30);

  return date.toISOString().split("T")[0];
};

// =========================================================
// FORMAT DATE
// =========================================================

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return "-";
  }

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =========================================================
// FORMAT CURRENCY
// =========================================================

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// =========================================================
// COMPONENT
// =========================================================

const History = () => {
  const navigate = useNavigate();

  // =======================================================
  // SIDEBAR
  // =======================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =======================================================
  // DATE RANGE
  // =======================================================

  const [startDate, setStartDate] = useState(getThirtyDaysAgo);

  const [endDate, setEndDate] = useState(getToday);

  // =======================================================
  // HISTORY
  // =======================================================

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [searchedRange, setSearchedRange] = useState({
    start: getThirtyDaysAgo(),
    end: getToday(),
  });

  // =======================================================
  // EXPANDED DAYS
  // =======================================================

  const [expandedDays, setExpandedDays] = useState({});

  // =======================================================
  // LOGOUT
  // =======================================================

  const handleLogout = async () => {
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

  // =======================================================
  // FETCH HISTORY
  // =======================================================

  const fetchHistory = async (
    requestedStart = startDate,
    requestedEnd = endDate,
  ) => {
    if (!requestedStart || !requestedEnd) {
      setError("Please select both dates.");

      return;
    }

    if (requestedStart > requestedEnd) {
      setError("Start date cannot be after end date.");

      return;
    }

    try {
      setLoading(true);

      setError("");

      const response = await axios.get(
        "/api/inventory-usage/getSellingHistoryByDateRange",
        {
          params: {
            start_date: requestedStart,

            end_date: requestedEnd,
          },

          withCredentials: true,
        },
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to load selling history",
        );
      }

      const days = Array.isArray(response.data?.data?.days)
        ? response.data.data.days
        : [];

      setHistory(days);

      setSearchedRange({
        start: requestedStart,
        end: requestedEnd,
      });

      // Expand first day
      setExpandedDays(
        days.length > 0
          ? {
              [days[0].usage_date]: true,
            }
          : {},
      );
    } catch (error) {
      console.error("Get selling history error:", error);

      setHistory([]);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load selling history",
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchHistory(getThirtyDaysAgo(), getToday());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =======================================================
  // TOTALS
  // =======================================================

  const totals = useMemo(() => {
    return history.reduce(
      (result, day) => {
        result.items += Number(day.total_items || 0);

        result.amount += Number(day.total_selling_amount || 0);

        return result;
      },
      {
        items: 0,
        amount: 0,
      },
    );
  }, [history]);

  // =======================================================
  // TOGGLE DAY
  // =======================================================

  const toggleDay = (date) => {
    setExpandedDays((current) => ({
      ...current,

      [date]: !current[date],
    }));
  };

  // =======================================================
  // EXPAND ALL
  // =======================================================

  const expandAll = () => {
    const next = {};

    history.forEach((day) => {
      next[day.usage_date] = true;
    });

    setExpandedDays(next);
  };

  // =======================================================
  // COLLAPSE ALL
  // =======================================================

  const collapseAll = () => {
    setExpandedDays({});
  };

  // =======================================================
  // JSX
  // =======================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb]">
      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="ml-0 min-h-screen lg:ml-64">
        {/* =================================================
            NAVBAR
        ================================================= */}

        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="pt-20">
          <div className="space-y-5 p-4 sm:p-6 lg:space-y-6 lg:p-8">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#172033] sm:text-3xl">
                  Selling History
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  View your product selling history between selected dates.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
                <CalendarDays size={16} />

                <span>
                  {formatDate(searchedRange.start)} -{" "}
                  {formatDate(searchedRange.end)}
                </span>
              </div>
            </div>

            {/* =================================================
                DATE FILTER
            ================================================= */}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                {/* START DATE */}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    max={endDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#172033] focus:ring-2 focus:ring-[#172033]/10"
                  />
                </div>

                {/* END DATE */}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={getToday()}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#172033] focus:ring-2 focus:ring-[#172033]/10"
                  />
                </div>

                {/* SEARCH */}

                <button
                  type="button"
                  onClick={() => fetchHistory()}
                  disabled={loading}
                  className="inline-flex h-[43px] items-center justify-center gap-2 rounded-xl bg-[#172033] px-5 text-sm font-medium text-white transition hover:bg-[#24304a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Search size={17} />

                  {loading ? "Loading..." : "Search"}
                </button>
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => fetchHistory()}
                  className="font-medium underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* DAYS */}

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Selling Days
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-[#172033]">
                      {history.length}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CalendarDays size={21} />
                  </div>
                </div>
              </div>

              {/* CLOTHES */}

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Clothes Sold
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-[#172033]">
                      {totals.items}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Package size={21} />
                  </div>
                </div>
              </div>

              {/* AMOUNT */}

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">
                      Total Selling Amount
                    </p>

                    <p className="mt-2 truncate text-2xl font-semibold text-green-600 sm:text-3xl">
                      {formatCurrency(totals.amount)}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <IndianRupee size={21} />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                EXPAND / COLLAPSE
            ================================================= */}

            {history.length > 0 && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={expandAll}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Expand All
                </button>

                <button
                  type="button"
                  onClick={collapseAll}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Collapse All
                </button>
              </div>
            )}

            {/* =================================================
                HISTORY
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Selling History
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {history.length > 0
                    ? `Showing ${history.length} selling day${
                        history.length === 1 ? "" : "s"
                      }`
                    : "No selling records found for this date range."}
                </p>
              </div>

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#172033]" />

                    <p className="mt-4 text-sm font-medium text-gray-600">
                      Loading selling history...
                    </p>
                  </div>
                </div>
              ) : history.length === 0 ? (
                /* =================================================
                    EMPTY
                ================================================= */

                <div className="flex min-h-[300px] items-center justify-center px-5">
                  <div className="text-center">
                    <ShoppingBag size={42} className="mx-auto text-gray-300" />

                    <p className="mt-4 text-sm font-medium text-gray-600">
                      No selling history found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try selecting a different date range.
                    </p>
                  </div>
                </div>
              ) : (
                /* =================================================
                    HISTORY DAYS
                ================================================= */

                <div className="divide-y divide-gray-100">
                  {history.map((day) => {
                    const expanded = !!expandedDays[day.usage_date];

                    const items = Array.isArray(day.items) ? day.items : [];

                    return (
                      <div key={day.id || day.usage_date}>
                        {/* DAY HEADER */}

                        <button
                          type="button"
                          onClick={() => toggleDay(day.usage_date)}
                          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-gray-50 sm:px-5"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={17}
                                className="shrink-0 text-[#172033]"
                              />

                              <h3 className="font-semibold text-[#172033]">
                                {formatDate(day.usage_date)}
                              </h3>
                            </div>

                            <p className="mt-1 text-xs text-gray-400">
                              {items.length} product
                              {items.length === 1 ? "" : "s"} ·{" "}
                              {Number(day.total_items || 0)} clothes
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600">
                                {formatCurrency(day.total_selling_amount)}
                              </p>

                              <p className="text-[11px] text-gray-400">
                                Selling amount
                              </p>
                            </div>

                            {expanded ? (
                              <ChevronUp size={19} className="text-gray-400" />
                            ) : (
                              <ChevronDown
                                size={19}
                                className="text-gray-400"
                              />
                            )}
                          </div>
                        </button>

                        {/* =================================================
                              PRODUCTS
                          ================================================= */}

                        {expanded && (
                          <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3 sm:px-5">
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                              {/* =================================================
                                    DESKTOP TABLE
                                ================================================= */}

                              <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[750px]">
                                  <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Product
                                      </th>

                                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Qty
                                      </th>

                                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Selling Price
                                      </th>

                                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Total
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody className="divide-y divide-gray-100">
                                    {items.map((item) => (
                                      <tr key={item.id}>
                                        <td className="px-4 py-4">
                                          <p className="font-medium text-gray-900">
                                            {item.inventory?.cloth_name ||
                                              "Unknown Product"}
                                          </p>

                                          <p className="mt-1 text-xs text-gray-400">
                                            Product ID: {item.inventory_id}
                                          </p>
                                        </td>

                                        <td className="px-4 py-4 text-right text-sm font-medium text-gray-700">
                                          {item.quantity}
                                        </td>

                                        <td className="px-4 py-4 text-right text-sm text-gray-600">
                                          {formatCurrency(item.selling_price)}
                                        </td>

                                        <td className="px-4 py-4 text-right text-sm font-semibold text-green-600">
                                          {formatCurrency(item.total_amount)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>

                                  <tfoot>
                                    <tr className="border-t border-gray-200 bg-gray-50">
                                      <td
                                        colSpan="3"
                                        className="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                                      >
                                        Day Total
                                      </td>

                                      <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                                        {formatCurrency(
                                          day.total_selling_amount,
                                        )}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>

                              {/* =================================================
                                    MOBILE
                                ================================================= */}

                              <div className="divide-y divide-gray-100 md:hidden">
                                {items.map((item) => (
                                  <div key={item.id} className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="font-semibold text-gray-900">
                                          {item.inventory?.cloth_name ||
                                            "Unknown Product"}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                          Product ID: {item.inventory_id}
                                        </p>
                                      </div>

                                      <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
                                        {formatCurrency(item.total_amount)}
                                      </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                      <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-[11px] text-gray-400">
                                          Quantity
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-700">
                                          {item.quantity}
                                        </p>
                                      </div>

                                      <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-[11px] text-gray-400">
                                          Selling Price
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-700">
                                          {formatCurrency(item.selling_price)}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                                      <span className="text-xs text-gray-400">
                                        {item.quantity} ×{" "}
                                        {formatCurrency(item.selling_price)}
                                      </span>

                                      <span className="text-sm font-bold text-green-600">
                                        {formatCurrency(item.total_amount)}
                                      </span>
                                    </div>
                                  </div>
                                ))}

                                <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
                                  <span className="text-sm font-semibold text-gray-700">
                                    Day Total
                                  </span>

                                  <span className="text-sm font-bold text-green-600">
                                    {formatCurrency(day.total_selling_amount)}
                                  </span>
                                </div>
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
    </div>
  );
};

export default History;
