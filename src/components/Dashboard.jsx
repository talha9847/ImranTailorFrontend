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
      ...(dashboard.reminders?.upcoming || []),
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

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {/* Header */}
              <div className="flex flex-col gap-4 border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1e6c9] text-[#8f681d]">
                    <Bell size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#172033]">
                      Customer Reminders
                    </h2>

                    <p className="text-xs text-gray-400">
                      Passed, today's and upcoming reminders
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-red-50 px-3 py-1.5 text-red-600">
                    Passed: {summary.passedReminders}
                  </span>

                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-600">
                    Today: {summary.todayReminders}
                  </span>

                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600">
                    Upcoming: {summary.upcomingReminders}
                  </span>
                </div>
              </div>

              {/* Loading */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-[#d9a441]" />

                  <p className="mt-3 text-sm text-gray-400">
                    Loading reminders...
                  </p>
                </div>
              ) : reminders.length === 0 ? (
                /* Empty */
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <Bell size={22} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[#172033]">
                    No pending reminders
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    There are currently no active customer reminders.
                  </p>
                </div>
              ) : (
                /* Table */
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[1050px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/70">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6 sm:py-4">
                          Customer
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6 sm:py-4">
                          Cloth
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6 sm:py-4">
                          Note
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6 sm:py-4">
                          Reminder
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6 sm:py-4">
                          Delivery
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6 sm:py-4">
                          Status
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6 sm:py-4">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {reminders.map((item) => {
                        const status = getReminderStatus(item.reminder_status);

                        const StatusIcon = status.icon;

                        return (
                          <tr
                            key={item.id}
                            className="transition hover:bg-gray-50/70"
                          >
                            {/* Customer */}
                            <td className="px-4 py-3 align-middle sm:px-6 sm:py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1e6c9] text-[#8f681d]">
                                  <User size={17} />
                                </div>

                                <div className="min-w-0">
                                  <p className="whitespace-nowrap text-sm font-medium text-[#172033]">
                                    {item.customer_name || "Unknown Customer"}
                                  </p>

                                  <p className="text-xs text-gray-400">
                                    Order #{String(item.id).padStart(4, "0")}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Cloth */}
                            <td className="px-4 py-3 align-middle sm:px-6 sm:py-4">
                              {renderPhoto(
                                item.cloth_photo,
                                `${item.customer_name} cloth`,
                                "80px",
                              )}
                            </td>

                            {/* Note */}
                            <td className="px-4 py-3 align-middle sm:px-6 sm:py-4">
                              {renderPhoto(
                                item.note_photo,
                                `${item.customer_name} note`,
                                "80px",
                              )}
                            </td>

                            {/* Reminder */}
                            <td className="px-4 py-3 align-middle sm:px-6 sm:py-4">
                              <div
                                className={`flex min-w-[125px] items-center gap-2 whitespace-nowrap text-sm ${
                                  item.reminder_status === "today"
                                    ? "text-amber-600"
                                    : item.reminder_status === "passed"
                                      ? "text-red-600"
                                      : "text-gray-600"
                                }`}
                              >
                                <Bell size={15} className="shrink-0" />

                                <span>{formatDate(item.remainder_date)}</span>
                              </div>
                            </td>

                            {/* Delivery */}
                            <td className="px-4 py-3 align-middle sm:px-6 sm:py-4">
                              <div className="flex min-w-[125px] items-center gap-2 whitespace-nowrap text-sm text-gray-600">
                                <CalendarDays
                                  size={15}
                                  className="shrink-0 text-gray-400"
                                />

                                <span>{formatDate(item.delivery_date)}</span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 align-middle sm:px-6 sm:py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${status.className}`}
                              >
                                <StatusIcon size={13} />

                                {status.label}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="px-4 py-3 text-right align-middle sm:px-6 sm:py-4">
                              <button
                                type="button"
                                onClick={() => openPhoto(item.cloth_photo)}
                                disabled={!item.cloth_photo}
                                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-[#d9a441] hover:bg-[#fffaf0] hover:text-[#8f681d] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Eye size={15} />
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer */}
              {!loading && reminders.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-4 sm:px-6">
                  <p className="text-xs text-gray-400">
                    Showing{" "}
                    <span className="font-medium text-gray-500">
                      {reminders.length}
                    </span>{" "}
                    customer reminders
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
