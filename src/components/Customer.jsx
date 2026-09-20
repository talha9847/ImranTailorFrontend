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
    // Keep your existing logout logic here.
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
    // Close if already open
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
      return;
    }

    // Open customer
    setExpandedCustomer(customerId);

    // Don't fetch again if already loaded
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

            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Customers
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                View customers and their orders
              </p>
            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer name or contact..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-700" />

                <p className="mt-3 text-sm text-gray-500">
                  Loading customers...
                </p>
              </div>
            ) : customers.length === 0 ? (
              /* ===============================================
                 EMPTY
              =============================================== */

              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                <UserRound size={40} className="mx-auto text-gray-300" />

                <p className="mt-3 font-medium text-gray-700">
                  No customers found
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Try a different search
                </p>
              </div>
            ) : (
              /* ===============================================
                 CUSTOMER LIST
              =============================================== */

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* =============================================
                    DESKTOP HEADER
                ============================================= */}

                <div className="hidden grid-cols-[1fr_220px_100px] border-b border-gray-200 bg-gray-50 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">
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
                          className="w-full text-left transition hover:bg-gray-50"
                        >
                          <div className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1fr_220px_100px] md:items-center md:px-5">
                            {/* CUSTOMER */}

                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                <UserRound size={19} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-gray-900">
                                  {customer.customer_name}
                                </p>

                                <p className="text-xs text-gray-400">
                                  Customer ID: {customer.id}
                                </p>
                              </div>
                            </div>

                            {/* CONTACT */}

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone
                                size={15}
                                className="shrink-0 text-gray-400"
                              />

                              <span>{customer.contact}</span>
                            </div>

                            {/* ORDERS */}

                            <div className="flex items-center justify-between md:justify-center md:gap-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ShoppingBag size={16} />

                                <span>
                                  {isExpanded ? "Hide" : "View"} orders
                                </span>
                              </div>

                              {isExpanded ? (
                                <ChevronUp
                                  size={19}
                                  className="text-gray-500"
                                />
                              ) : (
                                <ChevronDown
                                  size={19}
                                  className="text-gray-500"
                                />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* =================================
                              EXPANDED ORDERS
                          ================================= */}

                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 sm:px-6">
                            <div className="mb-3 flex items-center gap-2">
                              <ShoppingBag
                                size={17}
                                className="text-gray-600"
                              />

                              <h3 className="font-semibold text-gray-800">
                                Orders
                              </h3>
                            </div>

                            {/* LOADING */}

                            {isOrdersLoading ? (
                              <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-3 border-gray-200 border-t-gray-700" />

                                <p className="mt-2 text-sm text-gray-500">
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

                              <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                                <ShoppingBag
                                  size={30}
                                  className="mx-auto text-gray-300"
                                />

                                <p className="mt-2 text-sm font-medium text-gray-600">
                                  No orders found
                                </p>
                              </div>
                            ) : (
                              /* ORDERS */

                              <div className="space-y-2">
                                {orders.map((order) => (
                                  <div
                                    key={order.id}
                                    className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    {/* ORDER ID */}

                                    <div className="flex items-center gap-3">
                                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                        <ShoppingBag size={17} />
                                      </div>

                                      <div>
                                        <p className="text-xs text-gray-400">
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
                                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                                    >
                                      <Eye size={16} />
                                      View Order
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
