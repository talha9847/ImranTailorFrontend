import React, { useMemo, useState } from "react";
import {
  Search,
  Package,
  User,
  Phone,
  CheckCircle2,
  Clock3,
  Truck,
  CalendarDays,
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Clothes = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const clothes = [
    {
      id: 1,
      customerName: "Rahul Patel",
      contact: "+91 98765 43210",
      clothPhoto:
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=300&q=80",
      notePhoto:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=300&q=80",
      status: "pending",
      deliveryDate: "17 Sep 2026",
    },
    {
      id: 2,
      customerName: "Ahmed Sheikh",
      contact: "+91 98250 12345",
      clothPhoto:
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=300&q=80",
      notePhoto:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
      status: "ready",
      deliveryDate: "16 Sep 2026",
    },
    {
      id: 3,
      customerName: "Neha Shah",
      contact: "+91 99090 45678",
      clothPhoto:
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=300&q=80",
      notePhoto:
        "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=300&q=80",
      status: "delivered",
      deliveryDate: "14 Sep 2026",
    },
    {
      id: 4,
      customerName: "Vivek Mehta",
      contact: "+91 98123 56789",
      clothPhoto:
        "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=300&q=80",
      notePhoto:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80",
      status: "pending",
      deliveryDate: "18 Sep 2026",
    },
    {
      id: 5,
      customerName: "Priya Joshi",
      contact: "+91 98980 11122",
      clothPhoto:
        "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=300&q=80",
      notePhoto:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80",
      status: "ready",
      deliveryDate: "16 Sep 2026",
    },
    {
      id: 6,
      customerName: "Karan Shah",
      contact: "+91 97250 87654",
      clothPhoto:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80",
      notePhoto:
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=300&q=80",
      status: "delivered",
      deliveryDate: "12 Sep 2026",
    },
  ];

  const getStatus = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock3,
        };

      case "ready":
        return {
          label: "Ready",
          className: "bg-green-50 text-green-700 border-green-200",
          icon: CheckCircle2,
        };

      case "delivered":
        return {
          label: "Delivered",
          className: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Truck,
        };

      default:
        return {
          label: "Unknown",
          className: "bg-gray-50 text-gray-600 border-gray-200",
          icon: Package,
        };
    }
  };

  const filteredClothes = useMemo(() => {
    return clothes.filter((item) => {
      const matchesFilter =
        activeFilter === "all" || item.status === activeFilter;

      const searchText = search.toLowerCase();

      const matchesSearch =
        item.customerName.toLowerCase().includes(searchText) ||
        item.contact.toLowerCase().includes(searchText) ||
        String(item.id).includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  const filterButtons = [
    {
      key: "all",
      label: "All Clothes",
      count: clothes.length,
    },
    {
      key: "pending",
      label: "Pending",
      count: clothes.filter((item) => item.status === "pending").length,
    },
    {
      key: "ready",
      label: "Ready",
      count: clothes.filter((item) => item.status === "ready").length,
    },
    {
      key: "delivered",
      label: "Delivered",
      count: clothes.filter((item) => item.status === "delivered").length,
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb]">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <Sidebar />

      {/* =====================================================
          MAIN AREA
      ====================================================== */}
      <div className="min-h-screen md:ml-64">
        {/* NAVBAR */}
        <Navbar
          onLogout={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        />

        {/* CONTENT */}
        <main className="pt-20">
          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* =================================================
                PAGE HEADER
            ================================================== */}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#172033]">
                All Clothes
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                View and manage all customer clothing orders.
              </p>
            </div>

            {/* =================================================
                FILTER / SEARCH
            ================================================== */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4">
                {/* SEARCH */}
                <div className="relative w-full">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search customer, contact or order..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-[#172033] outline-none transition placeholder:text-gray-400 focus:border-[#d9a441] focus:bg-white"
                  />
                </div>

                {/* FILTER BUTTONS */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {filterButtons.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setActiveFilter(filter.key)}
                      className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                        activeFilter === filter.key
                          ? "bg-[#172033] text-white"
                          : "border border-gray-200 bg-white text-gray-600 hover:border-[#d9a441] hover:text-[#8f681d]"
                      }`}
                    >
                      {filter.label}

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${
                          activeFilter === filter.key
                            ? "bg-white/15 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* =================================================
                RESULTS
            ================================================== */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {/* HEADER */}
              <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e6c9] text-[#8f681d]">
                    <Package size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#172033]">
                      {activeFilter === "all"
                        ? "All Clothes"
                        : `${getStatus(activeFilter).label} Clothes`}
                    </h2>

                    <p className="text-xs text-gray-400">
                      Showing {filteredClothes.length} orders
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CalendarDays size={14} />
                  16 September 2026
                </div>
              </div>

              {/* =================================================
                  DESKTOP TABLE
              ================================================== */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Cloth Photo
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Note Photo
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Delivery
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredClothes.map((item) => {
                      const status = getStatus(item.status);
                      const StatusIcon = status.icon;

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-gray-50/70"
                        >
                          {/* CUSTOMER */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1e6c9] text-[#8f681d]">
                                <User size={16} />
                              </div>

                              <div>
                                <p className="text-sm font-medium text-[#172033]">
                                  {item.customerName}
                                </p>

                                <p className="text-xs text-gray-400">
                                  Order #{String(item.id).padStart(4, "0")}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* CONTACT */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={15} className="text-gray-400" />
                              {item.contact}
                            </div>
                          </td>

                          {/* CLOTH PHOTO */}
                          <td className="px-6 py-4">
                            <div className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                              <img
                                src={item.clothPhoto}
                                alt={`${item.customerName} cloth`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </td>

                          {/* NOTE PHOTO */}
                          <td className="px-6 py-4">
                            <div className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                              <img
                                src={item.notePhoto}
                                alt="Measurement note"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </td>

                          {/* DELIVERY */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CalendarDays
                                size={15}
                                className="text-gray-400"
                              />
                              {item.deliveryDate}
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${status.className}`}
                            >
                              <StatusIcon size={13} />
                              {status.label}
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
                {filteredClothes.map((item) => {
                  const status = getStatus(item.status);
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
                    >
                      {/* CUSTOMER */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1e6c9] text-[#8f681d]">
                            <User size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#172033]">
                              {item.customerName}
                            </p>

                            <p className="text-xs text-gray-400">
                              Order #{String(item.id).padStart(4, "0")}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.className}`}
                        >
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </div>

                      {/* PHOTOS */}
                      <div className="mt-4 flex gap-3">
                        <div>
                          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                            Cloth
                          </p>

                          <div className="h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            <img
                              src={item.clothPhoto}
                              alt={`${item.customerName} cloth`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>

                        <div>
                          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                            Note
                          </p>

                          <div className="h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            <img
                              src={item.notePhoto}
                              alt="Measurement note"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="mt-4 grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2.5">
                          <Phone size={14} className="text-gray-400" />

                          <span className="text-xs text-gray-600">
                            {item.contact}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2.5">
                          <CalendarDays size={14} className="text-gray-400" />

                          <span className="text-xs text-gray-600">
                            Delivery: {item.deliveryDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* EMPTY */}
              {filteredClothes.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <Package size={22} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[#172033]">
                    No clothes found
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    Try changing the filter or search term.
                  </p>
                </div>
              )}

              {/* FOOTER */}
              <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                <p className="text-xs text-gray-400">
                  Showing {filteredClothes.length} of {clothes.length} orders
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Clothes;
