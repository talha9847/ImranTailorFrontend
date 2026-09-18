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
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

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

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  function normalizeDateValue(value) {
    if (!value) {
      return "";
    }

    const stringValue = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
      return stringValue;
    }

    const match = stringValue.match(/^(\d{4}-\d{2}-\d{2})/);

    return match ? match[1] : "";
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

  function getDriveUrl(photo) {
    if (!photo) {
      return "";
    }

    if (typeof photo === "string") {
      return photo;
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

    const imageUrl = photo.thumbnail || photo.url || getDriveUrl(photo);

    if (!imageUrl) {
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
        src={imageUrl}
        alt={alt}
        loading="lazy"
        onClick={() => openPhoto(photo)}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
        className="cursor-pointer rounded-lg border border-gray-200 object-cover transition hover:opacity-80"
        style={{
          width: size,
          height: size,
        }}
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

      setDashboard({
        ...emptyDashboard,
        ...(data.data || {}),
        summary: {
          ...emptyDashboard.summary,
          ...(data.data?.summary || {}),
        },
        reminders: {
          ...emptyDashboard.reminders,
          ...(data.data?.reminders || {}),
        },
      });
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

  const summary = dashboard.summary;

  const reminders = useMemo(() => {
    return [
      ...(dashboard.reminders?.passed || []),
      ...(dashboard.reminders?.today || []),
    ];
  }, [dashboard.reminders]);

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

              <div className="flex w-fit shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
                <CalendarDays size={16} />

                <span>{today}</span>
              </div>
            </div>

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
                        Today's & Overdue Orders
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
                              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Customer
                              </th>

                              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Contact
                              </th>

                              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Clothes
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
