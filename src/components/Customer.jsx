import React, { useEffect, useState } from "react";

import axios from "axios";

import {
  ChevronDown,
  ChevronUp,
  Eye,
  Search,
  UserRound,
  Phone,
  ShoppingBag,
  X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { useNavigate } from "react-router-dom";

const Customer = () => {
  const navigate = useNavigate();

  // =========================================================
  // SIDEBAR
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =========================================================
  // CUSTOMERS
  // =========================================================

  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // SEARCH
  // =========================================================

  const [search, setSearch] = useState("");

  // =========================================================
  // EXPANDED CUSTOMER
  // =========================================================

  const [expandedCustomer, setExpandedCustomer] = useState(null);

  // =========================================================
  // CUSTOMER ORDERS
  // =========================================================

  const [customerOrders, setCustomerOrders] = useState({});

  const [ordersLoading, setOrdersLoading] = useState({});

  const [ordersError, setOrdersError] = useState({});

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    navigate("/login");
  };

  // =========================================================
  // FETCH CUSTOMERS
  // =========================================================

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/api/clothes/getAllCustomers", {
        params: {
          search,
        },
        withCredentials: true,
      });

      if (response.data?.success) {
        setCustomers(response.data.data || []);
      } else {
        setCustomers([]);
        setError(response.data?.message || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("Fetch customers error:", error);

      setCustomers([]);

      setError(error.response?.data?.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL CUSTOMER FETCH
  // =========================================================

  useEffect(() => {
    fetchCustomers();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // =========================================================
  // FETCH CUSTOMER ORDERS
  // =========================================================

  const fetchCustomerOrders = async (customerId) => {
    try {
      setOrdersLoading((prev) => ({
        ...prev,
        [customerId]: true,
      }));

      setOrdersError((prev) => ({
        ...prev,
        [customerId]: "",
      }));

      const response = await axios.get(
        `/api/clothes/${customerId}/getCustomerOrders`,
        {
          withCredentials: true,
        },
      );

      if (response.data?.success) {
        setCustomerOrders((prev) => ({
          ...prev,
          [customerId]: response.data.data || [],
        }));
      } else {
        setCustomerOrders((prev) => ({
          ...prev,
          [customerId]: [],
        }));

        setOrdersError((prev) => ({
          ...prev,
          [customerId]: response.data?.message || "Failed to fetch orders",
        }));
      }
    } catch (error) {
      console.error("Fetch customer orders error:", error);

      setCustomerOrders((prev) => ({
        ...prev,
        [customerId]: [],
      }));

      setOrdersError((prev) => ({
        ...prev,
        [customerId]: error.response?.data?.message || "Failed to fetch orders",
      }));
    } finally {
      setOrdersLoading((prev) => ({
        ...prev,
        [customerId]: false,
      }));
    }
  };

  // =========================================================
  // TOGGLE CUSTOMER
  // =========================================================

  const toggleCustomer = async (customerId) => {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
      return;
    }

    setExpandedCustomer(customerId);

    if (Object.prototype.hasOwnProperty.call(customerOrders, customerId)) {
      return;
    }

    await fetchCustomerOrders(customerId);
  };

  // =========================================================
  // VIEW ORDER
  // =========================================================

  const handleViewOrder = (orderId) => {
    navigate(`/view-order/${orderId}`);
  };

  // =========================================================
  // FORMAT ORDER ID
  // =========================================================

  const formatOrderId = (id) => {
    return `#${id}`;
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb]">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="ml-0 min-h-screen lg:ml-64">
        {/* ===================================================
            NAVBAR
        =================================================== */}

        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        {/* ===================================================
            CONTENT
        =================================================== */}

        <main className="pt-20">
          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
                    <UserRound size={18} />
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Customers
                  </h1>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  View customers and manage their orders
                </p>
              </div>

              {!loading && customers.length > 0 && (
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm">
                  <UserRound size={15} className="text-gray-400" />

                  <span>
                    {customers.length}{" "}
                    {customers.length === 1 ? "customer" : "customers"}
                  </span>
                </div>
              )}
            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="relative max-w-xl">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name or contact..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-11 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />

                <p className="mt-4 text-sm font-medium text-gray-600">
                  Loading customers...
                </p>

                <p className="mt-1 text-xs text-gray-400">Please wait</p>
              </div>
            ) : customers.length === 0 ? (
              /* ===============================================
                 EMPTY
              =============================================== */

              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <UserRound size={26} />
                </div>

                <p className="mt-4 font-semibold text-gray-700">
                  No customers found
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  {search
                    ? "Try a different name or contact number."
                    : "Customers will appear here once they are added."}
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
                  >
                    <X size={15} />
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              /* ===============================================
                 CUSTOMER LIST
              =============================================== */

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* =============================================
                    DESKTOP HEADER
                ============================================= */}

                <div className="hidden grid-cols-[1fr_220px_150px] border-b border-gray-200 bg-gray-50/80 px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 md:grid">
                  <div>Customer</div>

                  <div>Contact</div>

                  <div className="text-center">Orders</div>
                </div>

                {/* =============================================
                    CUSTOMERS
                ============================================= */}

                <div className="divide-y divide-gray-100">
                  {customers.map((customer) => {
                    const isExpanded = expandedCustomer === customer.id;

                    const orders = customerOrders[customer.id] || [];

                    const isOrdersLoading = ordersLoading[customer.id];

                    const orderError = ordersError[customer.id];

                    return (
                      <div key={customer.id}>
                        {/* =================================
                            CUSTOMER ROW
                        ================================= */}

                        <button
                          type="button"
                          onClick={() => toggleCustomer(customer.id)}
                          className={`group w-full text-left transition ${
                            isExpanded ? "bg-gray-50" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:px-5 md:grid-cols-[1fr_220px_150px] md:items-center">
                            {/* CUSTOMER */}

                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                                  isExpanded
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                                }`}
                              >
                                <UserRound size={19} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-gray-900">
                                  {customer.customer_name}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-400">
                                  Customer ID: {customer.id}
                                </p>
                              </div>
                            </div>

                            {/* CONTACT */}

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                                <Phone size={14} />
                              </div>

                              <span className="truncate">
                                {customer.contact || "No contact"}
                              </span>
                            </div>

                            {/* ORDERS */}

                            <div className="flex items-center justify-between md:justify-end md:gap-3">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                  {isExpanded ? "Open" : "Orders"}
                                </span>

                                <span className="hidden text-sm text-gray-500 sm:inline">
                                  {isExpanded ? "Hide" : "View"}
                                </span>
                              </div>

                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                  isExpanded
                                    ? "bg-gray-200 text-gray-700"
                                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                                }`}
                              >
                                {isExpanded ? (
                                  <ChevronUp size={17} />
                                ) : (
                                  <ChevronDown size={17} />
                                )}
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* =================================
                            EXPANDED ORDERS
                        ================================= */}

                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-5 sm:px-6">
                            <div className="mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm ring-1 ring-gray-200">
                                  <ShoppingBag size={15} />
                                </div>

                                <div>
                                  <h3 className="text-sm font-semibold text-gray-800">
                                    Customer Orders
                                  </h3>

                                  {!isOrdersLoading &&
                                    !orderError &&
                                    orders.length > 0 && (
                                      <p className="text-xs text-gray-400">
                                        {orders.length}{" "}
                                        {orders.length === 1
                                          ? "order"
                                          : "orders"}
                                      </p>
                                    )}
                                </div>
                              </div>
                            </div>

                            {/* LOADING */}

                            {isOrdersLoading ? (
                              <div className="rounded-xl border border-gray-200 bg-white p-7 text-center shadow-sm">
                                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-3 border-gray-200 border-t-gray-700" />

                                <p className="mt-3 text-sm font-medium text-gray-600">
                                  Loading orders...
                                </p>
                              </div>
                            ) : orderError ? (
                              /* ERROR */

                              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                                {orderError}
                              </div>
                            ) : orders.length === 0 ? (
                              /* NO ORDERS */

                              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                  <ShoppingBag size={21} />
                                </div>

                                <p className="mt-3 text-sm font-semibold text-gray-600">
                                  No orders found
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  This customer doesn't have any orders yet.
                                </p>
                              </div>
                            ) : (
                              /* ORDERS */

                              <div className="space-y-2.5">
                                {orders.map((order) => (
                                  <div
                                    key={order.id}
                                    className="group flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    {/* ORDER INFO */}

                                    <div className="flex min-w-0 items-center gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition group-hover:bg-gray-900 group-hover:text-white">
                                        <ShoppingBag size={17} />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                          Order
                                        </p>

                                        <p className="font-semibold text-gray-900">
                                          {formatOrderId(order.id)}
                                        </p>
                                      </div>
                                    </div>

                                    {/* VIEW ORDER */}

                                    <button
                                      type="button"
                                      onClick={() => handleViewOrder(order.id)}
                                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98] sm:w-auto"
                                    >
                                      <Eye size={16} />

                                      <span>View Order</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Customer;
