import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Package,
  Clock3,
  CheckCircle2,
  Bell,
  CalendarDays,
  User,
  Eye,
  AlertCircle,
  Loader2,
  ImagePlus,
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboard, setDashboard] = useState({
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
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    getDashboard();
  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  function normalizeDateValue(value) {
    if (!value) {
      return "";
    }

    const stringValue = String(value);

    /*
     * Keep YYYY-MM-DD exactly as it is.
     *
     * This prevents timezone shifting.
     */
    if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
      return stringValue;
    }

    /*
     * ISO timestamp:
     *
     * 2026-09-17T18:30:00.000Z
     */
    const match = stringValue.match(/^(\d{4}-\d{2}-\d{2})/);

    if (match) {
      return match[1];
    }

    return "";
  }

  function formatDate(value) {
    const dateValue = normalizeDateValue(value);

    if (!dateValue) {
      return "-";
    }

    const [year, month, day] = dateValue.split("-").map(Number);

    if (!year || !month || !day) {
      return "-";
    }

    /*
     * Explicit local Date.
     *
     * Do not use:
     *
     * new Date("2026-09-17")
     *
     * because it can shift due to UTC conversion.
     */
    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // =========================================================
  // PHOTO HELPERS
  // SAME STYLE AS CLOTHES.JSX
  // =========================================================

  function getDriveUrl(photo) {
    if (!photo) {
      return "";
    }

    if (photo.url) {
      return photo.url;
    }

    if (photo.id) {
      return `https://drive.google.com/file/d/${photo.id}/view?usp=sharing`;
    }

    return "";
  }

  function openPhoto(photo) {
    const url = getDriveUrl(photo);

    if (!url) {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function renderPhoto(photo, alt, size = "80px") {
    if (!photo) {
      return (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-gray-300"
          style={{
            width: size,
            height: size,
          }}
        >
          <ImagePlus size={20} />
        </div>
      );
    }

    return (
      <img
        src={photo.thumbnail}
        alt={alt}
        loading="lazy"
        onClick={() => openPhoto(photo)}
        className="cursor-pointer rounded-lg border border-gray-200 object-cover transition hover:opacity-80"
        style={{
          width: size,
          height: size,
        }}
      />
    );
  }

  // =========================================================
  // REMINDER STATUS
  // =========================================================

  function getReminderStatus(status) {
    switch (status) {
      case "today":
        return {
          label: "Reminder Today",
          className: "border border-amber-200 bg-amber-50 text-amber-700",
          icon: Bell,
        };

      case "passed":
        return {
          label: "Reminder Passed",
          className: "border border-red-200 bg-red-50 text-red-700",
          icon: AlertCircle,
        };

      default:
        return {
          label: "Upcoming",
          className: "border border-gray-200 bg-gray-100 text-gray-600",
          icon: CalendarDays,
        };
    }
  }

  // =========================================================
  // API
  // =========================================================

  async function getDashboard(showLoader = true) {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response = await axios.get("/api/dashboard/getDashboard", {
        withCredentials: true,
      });

      const data = response.data;

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load dashboard");
      }

      setDashboard(
        data.data || {
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
        },
      );
    } catch (error) {
      console.error(
        "Get dashboard error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load dashboard",
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  // =========================================================
  // DATA
  // =========================================================

  const summary = dashboard.summary;

  const reminders = useMemo(() => {
    return [
      ...(dashboard.reminders?.passed || []),
      ...(dashboard.reminders?.today || []),
    ];
  }, [dashboard.reminders]);

  // =========================================================
  // RENDER
  // =========================================================

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
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-[#172033] sm:text-3xl">
                  Dashboard
                </h1>

                <p className="mt-1 max-w-xl text-sm text-gray-500">
                  Overview of your tailoring work and customer reminders.
                </p>
              </div>

              <div className="flex w-fit shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
                <CalendarDays size={16} className="shrink-0" />

                <span>
                  {new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
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
                  onClick={() => getDashboard()}
                  className="font-medium underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* =================================================
                MAIN SUMMARY
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {/* Total */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Clothes
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold text-[#172033]">
                      {loading ? "—" : summary.totalClothes}
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

              {/* Pending */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending</p>

                    <h2 className="mt-2 text-3xl font-semibold text-[#172033]">
                      {loading ? "—" : summary.pending}
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

              {/* Ready */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Ready Clothes
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold text-[#172033]">
                      {loading ? "—" : summary.ready}
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

            {/* =================================================
                REMINDER SUMMARY
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Passed */}
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Passed</p>

                    <h3 className="mt-1 text-2xl font-semibold text-red-700">
                      {loading ? "—" : summary.passedReminders}
                    </h3>

                    <p className="mt-1 text-xs text-red-500">
                      Reminder date has passed
                    </p>
                  </div>

                  <AlertCircle size={24} className="text-red-500" />
                </div>
              </div>

              {/* Today */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600">Today</p>

                    <h3 className="mt-1 text-2xl font-semibold text-amber-700">
                      {loading ? "—" : summary.todayReminders}
                    </h3>

                    <p className="mt-1 text-xs text-amber-600">
                      Need attention today
                    </p>
                  </div>

                  <Bell size={24} className="text-amber-500" />
                </div>
              </div>

              {/* Upcoming */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Upcoming
                    </p>

                    <h3 className="mt-1 text-2xl font-semibold text-[#172033]">
                      {loading ? "—" : summary.upcomingReminders}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Future reminders
                    </p>
                  </div>

                  <CalendarDays size={24} className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* =================================================
                REMINDER TABLE
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Today's & Overdue Orders
                  </h2>

                  <p className="text-sm text-gray-500">
                    Today's reminders and overdue pending orders
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                    Passed: {dashboard.summary.passedReminders}
                  </span>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                    Today: {dashboard.summary.todayReminders}
                  </span>
                </div>
              </div>

              {reminders.length === 0 ? (
                <div className="flex min-h-[250px] items-center justify-center px-5">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">
                      No reminders for today
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      There are no overdue pending orders either.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* DESKTOP */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[1000px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Customer
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Contact
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Cloth
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Note
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Reminder
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Delivery
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {reminders.map((item) => (
                          <tr
                            key={`${item.reminder_status}-${item.id}`}
                            className="transition hover:bg-gray-50"
                          >
                            {/* CUSTOMER */}
                            <td className="px-5 py-4">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {item.customer_name || "No name"}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  Order #{item.id}
                                </p>
                              </div>
                            </td>

                            {/* CONTACT */}
                            <td className="px-5 py-4">
                              <span className="text-sm text-gray-700">
                                {item.contact || "-"}
                              </span>
                            </td>

                            {/* CLOTH PHOTO */}
                            <td className="px-5 py-4">
                              {renderPhoto(
                                item.cloth_photo,
                                `${item.customer_name || "Customer"} cloth`,
                                "80px",
                              )}
                            </td>

                            {/* NOTE PHOTO */}
                            <td className="px-5 py-4">
                              {renderPhoto(
                                item.note_photo,
                                `${item.customer_name || "Customer"} note`,
                                "80px",
                              )}
                            </td>

                            {/* REMINDER */}
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

                            {/* DELIVERY */}
                            <td className="px-5 py-4">
                              <span className="text-sm text-gray-700">
                                {item.delivery_date
                                  ? formatDate(item.delivery_date)
                                  : "-"}
                              </span>
                            </td>

                            {/* STATUS */}
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

                  {/* MOBILE */}
                  <div className="divide-y divide-gray-100 md:hidden">
                    {reminders.map((item) => (
                      <div
                        key={`${item.reminder_status}-${item.id}`}
                        className="p-4"
                      >
                        {/* CUSTOMER */}
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

                        {/* PHOTOS */}
                        <div className="flex gap-3">
                          <div>
                            <p className="mb-1 text-xs font-medium text-gray-400">
                              Cloth
                            </p>

                            {renderPhoto(item.cloth_photo, "Cloth", "90px")}
                          </div>

                          <div>
                            <p className="mb-1 text-xs font-medium text-gray-400">
                              Note
                            </p>

                            {renderPhoto(item.note_photo, "Note", "90px")}
                          </div>
                        </div>

                        {/* DETAILS */}
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-400">Reminder</p>

                            <p className="mt-1 text-sm font-medium text-gray-700">
                              {formatDate(item.remainder_date)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-400">Delivery</p>

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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
