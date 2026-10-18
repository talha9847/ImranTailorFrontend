import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Package,
  Clock3,
  CheckCircle2,
  Bell,
  CalendarDays,
  AlertCircle,
  Loader2,
  ImagePlus,
  RefreshCw,
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const emptyDashboard = {
  summary: {
    totalClothes: 0,
    pending: 0,
    ready: 0,
    passedReminders: 0,
    todayReminders: 0,
    upcomingReminders: 0,
  },
  reminders: {
    passed: [],
    today: [],
    upcoming: [],
  },
};

const DASHBOARD_CACHE_KEY = "dashboard_cache";
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

function getCachedDashboard() {
  try {
    const cached = localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const isExpired =
      !parsed.timestamp || Date.now() - parsed.timestamp >= CACHE_DURATION;

    if (isExpired || !parsed.data) {
      localStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error("Unable to read dashboard cache:", error);
    localStorage.removeItem(DASHBOARD_CACHE_KEY);
    return null;
  }
}

function saveDashboardCache(data) {
  try {
    localStorage.setItem(
      DASHBOARD_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      }),
    );
  } catch (error) {
    // The dashboard still works if localStorage is unavailable or full.
    console.error("Unable to save dashboard cache:", error);
  }
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialCachedDashboard] = useState(() => getCachedDashboard());
  const [dashboard, setDashboard] = useState(
    () => initialCachedDashboard || emptyDashboard,
  );
  const [loading, setLoading] = useState(!initialCachedDashboard);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only call the API on mount if there is no valid cached response.
    if (!initialCachedDashboard) {
      getDashboard();
    }
    // This runs once on mount; getDashboard is a local function declaration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getDashboard(showLoader = true) {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await axios.get("/api/dashboard/getDashboard", {
        withCredentials: true,
      });

      const result = response.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to load dashboard");
      }

      const data = result.data || {};
      const normalizedDashboard = {
        ...emptyDashboard,
        ...data,
        summary: {
          ...emptyDashboard.summary,
          ...(data.summary || {}),
        },
        reminders: {
          ...emptyDashboard.reminders,
          ...(data.reminders || {}),
        },
      };

      // Update the screen and replace the cached JSON with the newest response.
      setDashboard(normalizedDashboard);
      saveDashboardCache(normalizedDashboard);
    } catch (err) {
      console.error("Get dashboard error:", err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard",
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );

      // Avoid showing one user's cached dashboard after logout.
      localStorage.removeItem(DASHBOARD_CACHE_KEY);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  function normalizeDateValue(value) {
    if (!value) return "";

    const stringValue = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
      return stringValue;
    }

    const match = stringValue.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : "";
  }

  function formatDate(value) {
    const dateValue = normalizeDateValue(value);
    if (!dateValue) return "-";

    const [year, month, day] = dateValue.split("-").map(Number);
    if (!year || !month || !day) return "-";

    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getDriveUrl(photo) {
    if (!photo) return "";
    if (typeof photo === "string") return photo;
    if (photo.url) return photo.url;

    if (photo.id) {
      return `https://drive.google.com/file/d/${photo.id}/view?usp=sharing`;
    }

    return "";
  }

  function openPhoto(photo) {
    const url = getDriveUrl(photo);
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function renderPhoto(photo, alt, size = "80px") {
    if (!photo) {
      return (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-gray-300"
          style={{ width: size, height: size }}
        >
          <ImagePlus size={20} />
        </div>
      );
    }

    const imageUrl = photo.thumbnail || photo.url || getDriveUrl(photo);

    if (!imageUrl) {
      return (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-gray-300"
          style={{ width: size, height: size }}
        >
          <ImagePlus size={20} />
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={alt}
        loading="lazy"
        decoding="async"
        onClick={() => openPhoto(photo)}
        onError={(event) => {
          console.error("Image load failed:", {
            url: imageUrl,
            error: event.currentTarget.src,
          });

          event.currentTarget.onerror = null;
          event.currentTarget.style.display = "none";
        }}
        className="cursor-pointer rounded-lg border border-gray-200 object-cover transition hover:opacity-80"
        style={{ width: size, height: size }}
      />
    );
  }

  function renderClothPhotos(item, size = "80px") {
    const clothes = Array.isArray(item?.clothes)
      ? [...item.clothes].sort(
          (a, b) => Number(a.cloth_number) - Number(b.cloth_number),
        )
      : [];

    if (clothes.length === 0) {
      return renderPhoto(
        null,
        `${item?.customer_name || "Customer"} cloth`,
        size,
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {clothes.map((cloth, index) => (
          <div
            key={cloth.id || `${item.id}-cloth-${cloth.cloth_number || index}`}
            className="relative"
          >
            {renderPhoto(
              cloth.cloth_photo,
              `${item.customer_name || "Customer"} cloth ${
                cloth.cloth_number || index + 1
              }`,
              size,
            )}

            <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {cloth.cloth_number || index + 1}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const summary = dashboard.summary;

  const reminders = useMemo(
    () => [
      ...(dashboard.reminders?.passed || []),
      ...(dashboard.reminders?.today || []),
    ],
    [dashboard.reminders],
  );

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="ml-0 min-h-screen lg:ml-64">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="pt-20">
          <div className="space-y-6 p-4 sm:p-6 lg:space-y-7 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-[#172033] sm:text-3xl">
                  Dashboard
                </h1>

                <p className="mt-1 max-w-xl text-sm text-gray-500">
                  Overview of your tailoring work and customer reminders.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => getDashboard(false)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>

                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
                  <CalendarDays size={16} />
                  <span>{today}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => getDashboard()}
                  className="shrink-0 font-medium underline"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 size={38} className="animate-spin text-[#172033]" />
                  <p className="mt-4 text-sm font-medium text-gray-600">
                    Loading dashboard...
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Please wait while we load your orders.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Total Clothes
                        </p>
                        <h2 className="mt-2 text-3xl font-semibold text-[#172033]">
                          {summary.totalClothes}
                        </h2>
                        <p className="mt-2 text-xs text-gray-400">
                          Total active orders
                        </p>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-[#d9a441]">
                        <Package size={21} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Pending
                        </p>
                        <h2 className="mt-2 text-3xl font-semibold text-[#172033]">
                          {summary.pending}
                        </h2>
                        <p className="mt-2 text-xs text-gray-400">
                          Work still in progress
                        </p>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Clock3 size={21} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Ready Clothes
                        </p>
                        <h2 className="mt-2 text-3xl font-semibold text-[#172033]">
                          {summary.ready}
                        </h2>
                        <p className="mt-2 text-xs text-gray-400">
                          Ready for customer delivery
                        </p>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                        <CheckCircle2 size={21} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600">
                          Passed
                        </p>
                        <h3 className="mt-1 text-2xl font-semibold text-red-700">
                          {summary.passedReminders}
                        </h3>
                        <p className="mt-1 text-xs text-red-500">
                          Reminder date has passed
                        </p>
                      </div>
                      <AlertCircle size={24} className="text-red-500" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-600">
                          Today
                        </p>
                        <h3 className="mt-1 text-2xl font-semibold text-amber-700">
                          {summary.todayReminders}
                        </h3>
                        <p className="mt-1 text-xs text-amber-600">
                          Need attention today
                        </p>
                      </div>
                      <Bell size={24} className="text-amber-500" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Upcoming
                        </p>
                        <h3 className="mt-1 text-2xl font-semibold text-[#172033]">
                          {summary.upcomingReminders}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          Future reminders
                        </p>
                      </div>
                      <CalendarDays size={24} className="text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Today's &amp; Overdue Orders
                      </h2>
                      <p className="text-sm text-gray-500">
                        Today's reminders and overdue pending orders
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                        Passed: {summary.passedReminders}
                      </span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                        Today: {summary.todayReminders}
                      </span>
                    </div>
                  </div>

                  {reminders.length === 0 ? (
                    <div className="flex min-h-[250px] items-center justify-center px-5">
                      <div className="text-center">
                        <CheckCircle2
                          size={38}
                          className="mx-auto text-green-500"
                        />
                        <p className="mt-3 text-sm font-medium text-gray-600">
                          No reminders for today
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          There are no overdue pending orders either.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[1100px]">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                              {[
                                "Customer",
                                "Contact",
                                "Clothes",
                                "Note",
                                "Reminder",
                                "Delivery",
                                "Status",
                              ].map((heading) => (
                                <th
                                  key={heading}
                                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                                >
                                  {heading}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100">
                            {reminders.map((item) => (
                              <tr
                                key={`${item.reminder_status}-${item.id}`}
                                className="transition hover:bg-gray-50"
                              >
                                <td className="px-5 py-4">
                                  <p className="font-semibold text-gray-900">
                                    {item.customer_name || "No name"}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-400">
                                    Order #{item.id}
                                  </p>
                                </td>

                                <td className="px-5 py-4">
                                  <span className="text-sm text-gray-700">
                                    {item.contact || "-"}
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  {renderClothPhotos(item, "80px")}
                                </td>

                                <td className="px-5 py-4">
                                  {renderPhoto(
                                    item.note_photo,
                                    `${item.customer_name || "Customer"} note`,
                                    "80px",
                                  )}
                                </td>

                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                      item.reminder_status === "passed"
                                        ? "bg-red-50 text-red-600"
                                        : "bg-blue-50 text-blue-600"
                                    }`}
                                  >
                                    {item.reminder_status === "passed"
                                      ? "Passed"
                                      : "Today"}
                                  </span>
                                  <p className="mt-1 text-sm text-gray-700">
                                    {formatDate(item.remainder_date)}
                                  </p>
                                </td>

                                <td className="px-5 py-4">
                                  <span className="text-sm text-gray-700">
                                    {item.delivery_date
                                      ? formatDate(item.delivery_date)
                                      : "-"}
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                      item.status === "pending"
                                        ? "bg-amber-50 text-amber-600"
                                        : item.status === "ready"
                                          ? "bg-green-50 text-green-600"
                                          : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="divide-y divide-gray-100 md:hidden">
                        {reminders.map((item) => (
                          <div
                            key={`${item.reminder_status}-${item.id}`}
                            className="p-4"
                          >
                            <div className="mb-4 flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {item.customer_name || "No name"}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  {item.contact || "No contact"}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                  Order #{item.id}
                                </p>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                                  item.reminder_status === "passed"
                                    ? "bg-red-50 text-red-600"
                                    : "bg-blue-50 text-blue-600"
                                }`}
                              >
                                {item.reminder_status === "passed"
                                  ? "Passed"
                                  : "Today"}
                              </span>
                            </div>

                            <div>
                              <p className="mb-2 text-xs font-medium text-gray-400">
                                Clothes
                              </p>
                              {renderClothPhotos(item, "90px")}
                            </div>

                            <div className="mt-4">
                              <p className="mb-2 text-xs font-medium text-gray-400">
                                Note
                              </p>
                              {renderPhoto(item.note_photo, "Note", "90px")}
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-gray-400">
                                  Reminder
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-700">
                                  {formatDate(item.remainder_date)}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-400">
                                  Delivery
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-700">
                                  {item.delivery_date
                                    ? formatDate(item.delivery_date)
                                    : "-"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-400">Status</p>
                                <p className="mt-1 text-sm font-medium capitalize text-gray-700">
                                  {item.status}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
