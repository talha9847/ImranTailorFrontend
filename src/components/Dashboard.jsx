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
  Scissors,
  ArrowUpRight,
  Shirt,
  ChevronRight,
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
  reminders: { passed: [], today: [], upcoming: [] },
};

const DASHBOARD_CACHE_KEY = "dashboard_cache";
const CACHE_DURATION = 4 * 60 * 60 * 1000;

function getCachedDashboard() {
  try {
    const cached = localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    const expired =
      !parsed.timestamp || Date.now() - parsed.timestamp >= CACHE_DURATION;
    if (expired || !parsed.data) {
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
      JSON.stringify({ timestamp: Date.now(), data }),
    );
  } catch (error) {
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
    if (!initialCachedDashboard) getDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getDashboard(showLoader = true) {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
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
        summary: { ...emptyDashboard.summary, ...(data.summary || {}) },
        reminders: { ...emptyDashboard.reminders, ...(data.reminders || {}) },
      };
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
      if (showLoader) setLoading(false);
      else setRefreshing(false);
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      localStorage.removeItem(DASHBOARD_CACHE_KEY);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  function normalizeDateValue(value) {
    if (!value) return "";
    const stringValue = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) return stringValue;
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
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  function renderPhoto(photo, alt, size = "76px") {
    const imageUrl = photo?.thumbnail || photo?.url || getDriveUrl(photo);
    const imageStyle = { width: size, height: size };

    if (!imageUrl) {
      return (
        <div
          className="flex shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-300"
          style={imageStyle}
          aria-label="No image available"
        >
          <ImagePlus size={20} />
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => openPhoto(photo)}
        className="group relative block shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left"
        style={imageStyle}
        aria-label={`Open ${alt}`}
      >
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-slate-900/0 transition group-hover:bg-slate-900/10" />
      </button>
    );
  }

  function renderClothPhotos(item, size = "76px") {
    const clothes = Array.isArray(item?.clothes)
      ? [...item.clothes].sort(
          (a, b) => Number(a.cloth_number) - Number(b.cloth_number),
        )
      : [];

    if (!clothes.length) {
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
              `${item.customer_name || "Customer"} cloth ${cloth.cloth_number || index + 1}`,
              size,
            )}
            <span className="absolute bottom-1 left-1 rounded-lg bg-slate-950/75 px-1.5 py-0.5 text-[10px] font-bold text-white">
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

  const statCards = [
    {
      label: "Total clothes",
      value: summary.totalClothes,
      caption: "Orders in your workspace",
      icon: Package,
      iconStyle: "bg-[#fff2d4] text-[#b98520]",
      accent: "from-[#dca83f] to-[#f0c76c]",
    },
    {
      label: "In progress",
      value: summary.pending,
      caption: "Work still in progress",
      icon: Clock3,
      iconStyle: "bg-amber-100 text-amber-700",
      accent: "from-amber-400 to-orange-500",
    },
    {
      label: "Ready for pickup",
      value: summary.ready,
      caption: "Finished and ready",
      icon: CheckCircle2,
      iconStyle: "bg-emerald-100 text-emerald-700",
      accent: "from-[#dca83f] to-[#f0c76c]",
    },
  ];

  const reminderStats = [
    {
      label: "Overdue",
      value: summary.passedReminders,
      icon: AlertCircle,
      tone: "border-rose-100 bg-rose-50 text-rose-700",
      detail: "Past reminder date",
    },
    {
      label: "Due today",
      value: summary.todayReminders,
      icon: Bell,
      tone: "border-amber-100 bg-amber-50 text-amber-700",
      detail: "Needs your attention",
    },
    {
      label: "Upcoming",
      value: summary.upcomingReminders,
      icon: CalendarDays,
      tone: "border-sky-100 bg-[#edf4fb] text-[#42658b]",
      detail: "Coming up next",
    },
  ];

  const statusStyle = (status) => {
    if (status === "pending")
      return "bg-amber-50 text-amber-700 ring-amber-200";
    if (status === "ready")
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    return "bg-slate-100 text-slate-600 ring-slate-200";
  };

  const reminderStyle = (status) =>
    status === "passed"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : "bg-[#edf4fb] text-[#42658b] ring-sky-200";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8fa] text-[#1d2638]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-screen lg:ml-64">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="px-3 pb-8 pt-20 sm:px-6 sm:pb-10 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-[1440px] space-y-5 sm:space-y-7">
            <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1d2638] via-[#202a3d] to-[#2b3548] px-5 py-6 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-8">
              <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-2 -top-8 h-40 w-40 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-[#dca83f]/20 blur-3xl" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-200">
                    <Scissors size={14} />
                    TAILORING WORKSPACE
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Your work at a glance
                  </h1>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-200/80 sm:text-base">
                    Keep track of orders, finished clothes, and the customers
                    who need a follow-up.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:items-end">
                  <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white/90 backdrop-blur">
                    <CalendarDays size={16} className="text-[#dca83f]" />
                    {today}
                  </div>
                  <button
                    type="button"
                    onClick={() => getDashboard(false)}
                    disabled={refreshing}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1d2638] shadow-sm transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <RefreshCw
                      size={16}
                      className={refreshing ? "animate-spin" : ""}
                    />
                    {refreshing ? "Refreshing…" : "Refresh dashboard"}
                  </button>
                </div>
              </div>
              <div className="relative mt-6 flex items-center gap-2 border-t border-white/15 pt-4 text-xs text-slate-200/80 sm:mt-7">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.12)]" />
                Your workspace overview
                <span className="ml-auto hidden text-slate-200/60 sm:inline">
                  Stay organized, one order at a time
                </span>
              </div>
            </section>

            {error && (
              <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => getDashboard()}
                  className="min-h-10 rounded-xl bg-rose-700 px-4 py-2 font-semibold text-white transition hover:bg-rose-800"
                >
                  Try again
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 text-center shadow-sm sm:min-h-[420px]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff2d4] text-[#b98520]">
                  <Loader2 size={30} className="animate-spin" />
                </div>
                <p className="mt-4 font-semibold text-slate-800">
                  Preparing your dashboard
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Getting your latest orders and reminders.
                </p>
              </div>
            ) : (
              <>
                <section>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                        Order overview
                      </h2>
                      <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        A quick snapshot of your tailoring work
                      </p>
                    </div>
                    <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200 sm:inline-flex">
                      Live summary
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                    {statCards.map(
                      ({
                        label,
                        value,
                        caption,
                        icon: Icon,
                        iconStyle,
                        accent,
                      }) => (
                        <article
                          key={label}
                          className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 sm:p-6"
                        >
                          <div
                            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`}
                          />
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-500">
                                {label}
                              </p>
                              <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-[42px]">
                                {value ?? 0}
                              </p>
                              <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                                {caption}
                              </p>
                            </div>
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconStyle}`}
                            >
                              <Icon size={23} strokeWidth={2.1} />
                            </div>
                          </div>
                          <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <ArrowUpRight size={14} />
                            Workspace summary
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                </section>

                <section>
                  <div className="mb-3">
                    <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                      Reminder center
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      Know what needs attention and when
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    {reminderStats.map(
                      ({ label, value, icon: Icon, tone, detail }) => (
                        <article
                          key={label}
                          className={`rounded-2xl border p-4 sm:rounded-3xl sm:p-5 ${tone}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold opacity-90">
                                {label}
                              </p>
                              <p className="mt-2 text-3xl font-bold tracking-tight">
                                {value ?? 0}
                              </p>
                              <p className="mt-1 text-xs opacity-75">
                                {detail}
                              </p>
                            </div>
                            <div className="rounded-xl bg-white/75 p-2.5">
                              <Icon size={21} />
                            </div>
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                </section>

                <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff2d4] text-[#b98520]">
                          <Bell size={20} />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                            Today’s & overdue orders
                          </h2>
                          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                            Customer reminders that deserve your attention
                            first.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pl-14 sm:pl-0">
                        <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                          Overdue · {summary.passedReminders ?? 0}
                        </span>
                        <span className="rounded-full bg-[#edf4fb] px-3 py-1.5 text-xs font-semibold text-[#42658b] ring-1 ring-[#dce8f4]">
                          Today · {summary.todayReminders ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {reminders.length === 0 ? (
                    <div className="px-5 py-12 text-center sm:py-16">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={30} />
                      </div>
                      <h3 className="mt-4 text-base font-bold text-slate-800">
                        You’re all caught up!
                      </h3>
                      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                        There are no reminders for today and no overdue orders
                        to follow up on.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop/tablet layout */}
                      <div className="hidden overflow-x-auto lg:block">
                        <table className="w-full min-w-[1050px]">
                          <thead>
                            <tr className="bg-slate-50/80 text-left">
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
                                  className="whitespace-nowrap px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400"
                                >
                                  {heading}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reminders.map((item) => (
                              <tr
                                key={`${item.reminder_status}-${item.id}`}
                                className="transition hover:bg-slate-50/70"
                              >
                                <td className="px-5 py-4">
                                  <p className="font-semibold text-slate-900">
                                    {item.customer_name || "No name"}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-400">
                                    Order #{item.id}
                                  </p>
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {item.contact || "—"}
                                </td>
                                <td className="px-5 py-4">
                                  {renderClothPhotos(item, "64px")}
                                </td>
                                <td className="px-5 py-4">
                                  {renderPhoto(
                                    item.note_photo,
                                    `${item.customer_name || "Customer"} note`,
                                    "64px",
                                  )}
                                </td>
                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${reminderStyle(item.reminder_status)}`}
                                  >
                                    {item.reminder_status === "passed"
                                      ? "Overdue"
                                      : "Today"}
                                  </span>
                                  <p className="mt-2 whitespace-nowrap text-sm text-slate-600">
                                    {formatDate(item.remainder_date)}
                                  </p>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                  {item.delivery_date
                                    ? formatDate(item.delivery_date)
                                    : "—"}
                                </td>
                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusStyle(item.status)}`}
                                  >
                                    {item.status || "Unknown"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile-first order cards */}
                      <div className="divide-y divide-slate-100 lg:hidden">
                        {reminders.map((item) => (
                          <article
                            key={`${item.reminder_status}-${item.id}`}
                            className="p-4 sm:p-5"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                                <Shirt size={21} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h3 className="break-words font-bold text-slate-900">
                                      {item.customer_name || "No name"}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                      {item.contact || "No contact details"}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-400">
                                      Order #{item.id}
                                    </p>
                                  </div>
                                  <span
                                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${reminderStyle(item.reminder_status)}`}
                                  >
                                    {item.reminder_status === "passed"
                                      ? "Overdue"
                                      : "Due today"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-5">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                                  Clothes
                                </p>
                                <span className="text-xs text-slate-400">
                                  {Array.isArray(item.clothes)
                                    ? item.clothes.length
                                    : 0}{" "}
                                  item(s)
                                </span>
                              </div>
                              {renderClothPhotos(item, "76px")}
                            </div>

                            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                              {renderPhoto(
                                item.note_photo,
                                "Customer note",
                                "56px",
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                                  Order note
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                  {item.note_photo
                                    ? "Tap the image to view the note."
                                    : "No note image added."}
                                </p>
                              </div>
                              {item.note_photo && (
                                <ChevronRight
                                  size={17}
                                  className="shrink-0 text-slate-400"
                                />
                              )}
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                              <div className="rounded-2xl border border-slate-100 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                  Reminder
                                </p>
                                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                  {formatDate(item.remainder_date)}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-slate-100 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                  Delivery
                                </p>
                                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                  {item.delivery_date
                                    ? formatDate(item.delivery_date)
                                    : "—"}
                                </p>
                              </div>
                              <div className="col-span-2 rounded-2xl border border-slate-100 p-3 sm:col-span-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                  Order status
                                </p>
                                <div className="mt-1.5">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusStyle(item.status)}`}
                                  >
                                    {item.status || "Unknown"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </>
                  )}
                </section>

                <footer className="flex items-center justify-center gap-2 pb-2 pt-1 text-xs text-slate-400">
                  <Scissors size={13} />
                  Made for a smoother workday
                </footer>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
