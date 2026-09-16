import React, { useState } from "react";
import {
  Package,
  Clock3,
  CheckCircle2,
  Bell,
  CalendarDays,
  User,
  Eye,
  AlertCircle,
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const summary = {
    totalClothes: 42,
    pending: 18,
    ready: 24,
  };

  const reminders = [
    {
      id: 1,
      customerName: "Rahul Patel",
      clothPhoto:
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=300&q=80",
      notePhoto:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=300&q=80",
      reminderDate: "16 Sep 2026",
      deliveryDate: "17 Sep 2026",
      reminderStatus: "today",
    },
    {
      id: 2,
      customerName: "Ahmed Sheikh",
      clothPhoto:
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=300&q=80",
      notePhoto:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
      reminderDate: "15 Sep 2026",
      deliveryDate: "16 Sep 2026",
      reminderStatus: "passed",
    },
    {
      id: 3,
      customerName: "Neha Shah",
      clothPhoto:
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=300&q=80",
      notePhoto:
        "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=300&q=80",
      reminderDate: "17 Sep 2026",
      deliveryDate: "19 Sep 2026",
      reminderStatus: "upcoming",
    },
    {
      id: 4,
      customerName: "Vivek Mehta",
      clothPhoto:
        "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=300&q=80",
      notePhoto:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80",
      reminderDate: "16 Sep 2026",
      deliveryDate: "18 Sep 2026",
      reminderStatus: "today",
    },
    {
      id: 5,
      customerName: "Priya Joshi",
      clothPhoto:
        "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=300&q=80",
      notePhoto:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80",
      reminderDate: "14 Sep 2026",
      deliveryDate: "16 Sep 2026",
      reminderStatus: "passed",
    },
  ];

  const getReminderStatus = (status) => {
    switch (status) {
      case "today":
        return {
          label: "Reminder Today",
          className: "bg-amber-50 text-amber-700 border border-amber-200",
          icon: Bell,
        };

      case "passed":
        return {
          label: "Reminder Passed",
          className: "bg-red-50 text-red-700 border border-red-200",
          icon: AlertCircle,
        };

      default:
        return {
          label: "Upcoming",
          className: "bg-gray-100 text-gray-600 border border-gray-200",
          icon: CalendarDays,
        };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb]">
      {/* ================= SIDEBAR ================= */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ================= MAIN ================= */}
      <div className="ml-0 min-h-screen lg:ml-64">
        {/* ================= NAVBAR ================= */}
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        {/* ================= CONTENT ================= */}
        <main className="pt-20">
          <div className="space-y-6 p-4 sm:p-6 lg:space-y-7 lg:p-8">
            {/* ================= PAGE HEADER ================= */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-[#172033] sm:text-3xl">
                  Dashboard
                </h1>

                <p className="mt-1 max-w-xl text-sm text-gray-500">
                  Overview of your tailoring work and today's reminders.
                </p>
              </div>

              {/* Date */}
              <div className="flex w-fit shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
                <CalendarDays size={16} className="shrink-0" />

                <span>16 September 2026</span>
              </div>
            </div>

            {/* ================= SUMMARY CARDS ================= */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {/* Total */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
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

              {/* Pending */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">Pending</p>

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

              {/* Ready */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
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

            {/* ================= REMINDERS ================= */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {/* Header */}
              <div className="flex flex-col gap-4 border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1e6c9] text-[#8f681d]">
                    <Bell size={19} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-semibold text-[#172033]">
                      Customer Reminders
                    </h2>

                    <p className="text-xs text-gray-400">
                      Reminders that need attention
                    </p>
                  </div>
                </div>

                <div className="flex w-fit items-center gap-2 text-xs text-gray-500">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  Today's reminders
                </div>
              </div>

              {/* ================= TABLE ================= */}
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6 sm:py-4">
                        Customer
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6 sm:py-4">
                        Cloth Photo
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6 sm:py-4">
                        Written / Note
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6 sm:py-4">
                        Reminder Date
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6 sm:py-4">
                        Delivery Date
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
                      const status = getReminderStatus(item.reminderStatus);

                      const StatusIcon = status.icon;

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-gray-50/70"
                        >
                          {/* Customer */}
                          <td className="px-4 py-3 sm:px-6 sm:py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1e6c9] text-[#8f681d]">
                                <User size={17} />
                              </div>

                              <div>
                                <p className="whitespace-nowrap text-sm font-medium text-[#172033]">
                                  {item.customerName}
                                </p>

                                <p className="text-xs text-gray-400">
                                  Order #{String(item.id).padStart(4, "0")}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Cloth */}
                          <td className="px-4 py-3 sm:px-6 sm:py-4">
                            <div className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                              <img
                                src={item.clothPhoto}
                                alt="Cloth"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </td>

                          {/* Note */}
                          <td className="px-4 py-3 sm:px-6 sm:py-4">
                            <div className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                              <img
                                src={item.notePhoto}
                                alt="Written measurement note"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </td>

                          {/* Reminder */}
                          <td className="px-4 py-3 sm:px-6 sm:py-4">
                            <div className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600">
                              <Bell
                                size={15}
                                className={
                                  item.reminderStatus === "today"
                                    ? "text-amber-500"
                                    : item.reminderStatus === "passed"
                                      ? "text-red-500"
                                      : "text-gray-400"
                                }
                              />

                              {item.reminderDate}
                            </div>
                          </td>

                          {/* Delivery */}
                          <td className="px-4 py-3 sm:px-6 sm:py-4">
                            <div className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600">
                              <CalendarDays
                                size={15}
                                className="text-gray-400"
                              />

                              {item.deliveryDate}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 sm:px-6 sm:py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${status.className}`}
                            >
                              <StatusIcon size={13} />
                              {status.label}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3 text-right sm:px-6 sm:py-4">
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-[#d9a441] hover:bg-[#fffaf0] hover:text-[#8f681d]"
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

              {/* Footer */}
              <div className="border-t border-gray-100 px-4 py-4 sm:px-6">
                <p className="text-xs text-gray-400">
                  Showing {reminders.length} customer reminders
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
