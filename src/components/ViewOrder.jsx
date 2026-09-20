import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Loader2,
  Package,
  Phone,
  Truck,
  User,
  X,
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const ViewOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPhoto, setSelectedPhoto] = useState(null);

  /*
   * ------------------------------------------------------------
   * Logout
   * ------------------------------------------------------------
   */

  const handleLogout = async () => {
    try {
      await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /*
   * ------------------------------------------------------------
   * Date Helpers
   * ------------------------------------------------------------
   */

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

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /*
   * ------------------------------------------------------------
   * Google Drive Photo Helpers
   * ------------------------------------------------------------
   *
   * Supports both:
   *
   * 1. photo = "GOOGLE_DRIVE_FILE_ID"
   *
   * 2. photo = {
   *      id,
   *      thumbnail,
   *      url
   *    }
   * ------------------------------------------------------------
   */

  function getDriveFileId(photo) {
    if (!photo) {
      return "";
    }

    if (typeof photo === "string") {
      return photo;
    }

    if (photo.id) {
      return photo.id;
    }

    return "";
  }

  function getDriveUrl(photo) {
    if (!photo) {
      return "";
    }

    if (typeof photo === "string") {
      return `https://drive.google.com/file/d/${photo}/view?usp=sharing`;
    }

    if (photo.url) {
      return photo.url;
    }

    if (photo.id) {
      return `https://drive.google.com/file/d/${photo.id}/view?usp=sharing`;
    }

    return "";
  }

  function getPhotoSrc(photo) {
    if (!photo) {
      return "";
    }

    /*
     * If backend returns:
     *
     * "1WZEJ1TJyCcI1H2nqRGyRgttu3Bs0yf6q"
     */
    if (typeof photo === "string") {
      return `https://drive.google.com/thumbnail?id=${photo}&sz=w1000`;
    }

    /*
     * If backend returns:
     *
     * {
     *   id,
     *   thumbnail,
     *   url
     * }
     */
    if (photo.thumbnail) {
      return photo.thumbnail;
    }

    if (photo.url) {
      return photo.url;
    }

    if (photo.id) {
      return `https://drive.google.com/thumbnail?id=${photo.id}&sz=w1000`;
    }

    return "";
  }

  /*
   * ------------------------------------------------------------
   * Open Photo Preview
   * ------------------------------------------------------------
   */

  function openPhoto(photo, title = "Photo") {
    if (!photo) {
      return;
    }

    setSelectedPhoto({
      photo,
      title,
    });
  }

  /*
   * ------------------------------------------------------------
   * Open Original Google Drive Photo
   * ------------------------------------------------------------
   */

  function openDrive(photo) {
    const url = getDriveUrl(photo);

    if (!url) {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  /*
   * ------------------------------------------------------------
   * Status
   * ------------------------------------------------------------
   */

  function getStatus(status) {
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
  }

  /*
   * ------------------------------------------------------------
   * GET ORDER
   * ------------------------------------------------------------
   */

  async function getOrder() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`/api/clothes/getOrderById/${id}`, {
        withCredentials: true,
      });

      const data = response.data;

      console.log("VIEW ORDER API RESPONSE:", data);

      const orderData = data?.data || data?.order || data;

      console.log("VIEW ORDER DATA:", orderData);

      setOrder(orderData);
    } catch (error) {
      console.error("Get order error:", error.response?.data || error.message);

      setError(error.response?.data?.message || "Unable to load order details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      getOrder();
    }
  }, [id]);

  /*
   * ------------------------------------------------------------
   * Normalize Order
   * ------------------------------------------------------------
   */

  const customer = order?.customer || {};

  const clothes = Array.isArray(order?.clothes)
    ? [...order.clothes].sort(
        (a, b) => Number(a.cloth_number || 0) - Number(b.cloth_number || 0),
      )
    : [];

  const customerName =
    order?.customerName ||
    order?.customer_name ||
    customer?.customer_name ||
    "";

  const contact = order?.contact || customer?.contact || "";

  const notePhoto = order?.notePhoto || order?.note_photo || null;

  const status = getStatus(order?.status || "pending");

  const StatusIcon = status.icon;

  /*
   * ------------------------------------------------------------
   * Render
   * ------------------------------------------------------------
   */

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="ml-0 min-h-screen lg:ml-64">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="pt-20">
          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* ==================================================
                HEADER
                ================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-[#172033] sm:text-3xl">
                    View Order
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    Complete details for order #{id}
                  </p>
                </div>
              </div>

              {order && (
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${status.className}`}
                >
                  <StatusIcon size={16} />

                  {status.label}
                </span>
              )}
            </div>

            {/* ==================================================
                ERROR
                ================================================== */}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* ==================================================
                LOADING
                ================================================== */}

            {loading && (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
                <Loader2 size={34} className="animate-spin text-[#d9a441]" />

                <p className="mt-3 text-sm text-gray-400">
                  Loading order details...
                </p>
              </div>
            )}

            {/* ==================================================
                ORDER
                ================================================== */}

            {!loading && order && (
              <>
                {/* ==============================================
                    CUSTOMER + ORDER SUMMARY
                    ============================================== */}

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                  {/* Customer */}

                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e6c9] text-[#8f681d]">
                        <User size={19} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-[#172033]">
                          Customer Information
                        </h2>

                        <p className="text-xs text-gray-400">
                          Customer details for this order
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Customer Name
                        </p>

                        <p className="mt-2 text-sm font-semibold text-[#172033]">
                          {customerName || "-"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Contact
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <Phone size={15} className="text-gray-400" />

                          <p className="text-sm font-semibold text-[#172033]">
                            {contact || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Order ID
                        </p>

                        <p className="mt-2 text-sm font-semibold text-[#172033]">
                          #{String(order.id).padStart(4, "0")}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Number of Clothes
                        </p>

                        <p className="mt-2 text-sm font-semibold text-[#172033]">
                          {clothes.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Dates */}

                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e6c9] text-[#8f681d]">
                        <CalendarDays size={19} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-[#172033]">
                          Order Details
                        </h2>

                        <p className="text-xs text-gray-400">
                          Dates and status
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                        <div className="flex items-center gap-2">
                          <Bell size={15} className="text-amber-500" />

                          <span className="text-xs text-gray-500">
                            Reminder
                          </span>
                        </div>

                        <span className="text-xs font-medium text-[#172033]">
                          {formatDate(
                            order.remainder_date || order.remainderDate,
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                        <div className="flex items-center gap-2">
                          <Truck size={15} className="text-green-600" />

                          <span className="text-xs text-gray-500">
                            Delivery
                          </span>
                        </div>

                        <span className="text-xs font-medium text-[#172033]">
                          {formatDate(
                            order.delivery_date || order.deliveryDate,
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={15} className="text-gray-400" />

                          <span className="text-xs text-gray-500">Created</span>
                        </div>

                        <span className="text-right text-xs font-medium text-[#172033]">
                          {formatDateTime(order.created_at || order.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                        <span className="text-xs text-gray-500">Status</span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.className}`}
                        >
                          <StatusIcon size={12} />

                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ==============================================
                    CLOTHES
                    ============================================== */}

                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e6c9] text-[#8f681d]">
                        <Package size={19} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-[#172033]">
                          Clothes in Order
                        </h2>

                        <p className="text-xs text-gray-400">
                          {clothes.length}{" "}
                          {clothes.length === 1 ? "cloth" : "clothes"} in this
                          order
                        </p>
                      </div>
                    </div>
                  </div>

                  {clothes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                      <ImagePlus size={30} className="text-gray-300" />

                      <p className="mt-3 text-sm text-gray-400">
                        No clothes found for this order.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2 lg:grid-cols-3">
                      {clothes.map((cloth, index) => {
                        const photo =
                          cloth.cloth_photo || cloth.clothPhoto || null;

                        const photoSrc = getPhotoSrc(photo);

                        const clothNumber = cloth.cloth_number || index + 1;

                        return (
                          <div
                            key={cloth.id || cloth.cloth_number || index}
                            className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
                          >
                            {/* Photo */}

                            {photoSrc ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openPhoto(photo, `Cloth ${clothNumber}`)
                                }
                                className="group relative block h-64 w-full overflow-hidden bg-gray-100"
                              >
                                <img
                                  src={photoSrc}
                                  alt={`Cloth ${clothNumber}`}
                                  loading="lazy"
                                  className="h-full w-full object-cover transition group-hover:scale-[1.02] group-hover:opacity-90"
                                />

                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                                  <span className="rounded-lg bg-black/60 px-3 py-2 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                                    View Photo
                                  </span>
                                </div>
                              </button>
                            ) : (
                              <div className="flex h-64 items-center justify-center bg-gray-100 text-gray-300">
                                <ImagePlus size={32} />
                              </div>
                            )}

                            {/* Info */}

                            <div className="space-y-3 p-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-[#172033]">
                                  Cloth {clothNumber}
                                </h3>

                                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-gray-500">
                                  #{clothNumber}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-lg bg-white p-3">
                                  <p className="text-[10px] uppercase tracking-wide text-gray-400">
                                    Cloth ID
                                  </p>

                                  <p className="mt-1 break-all text-xs font-semibold text-[#172033]">
                                    {cloth.id || "-"}
                                  </p>
                                </div>

                                <div className="rounded-lg bg-white p-3">
                                  <p className="text-[10px] uppercase tracking-wide text-gray-400">
                                    Order ID
                                  </p>

                                  <p className="mt-1 break-all text-xs font-semibold text-[#172033]">
                                    {cloth.order_id || order.id || "-"}
                                  </p>
                                </div>
                              </div>

                              {photo && (
                                <button
                                  type="button"
                                  onClick={() => openDrive(photo)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-[#d9a441] hover:bg-[#fffaf0] hover:text-[#8f681d]"
                                >
                                  Open Original Photo
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ==============================================
                    NOTE PHOTO
                    ============================================== */}

                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e6c9] text-[#8f681d]">
                        <ImagePlus size={19} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-[#172033]">
                          Note / Measurement Photo
                        </h2>

                        <p className="text-xs text-gray-400">
                          Additional photo attached to this order
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    {notePhoto && getPhotoSrc(notePhoto) ? (
                      <div className="max-w-xl overflow-hidden rounded-2xl border border-gray-200">
                        <button
                          type="button"
                          onClick={() =>
                            openPhoto(notePhoto, "Note / Measurement")
                          }
                          className="group relative block w-full"
                        >
                          <img
                            src={getPhotoSrc(notePhoto)}
                            alt="Note / Measurement"
                            loading="lazy"
                            className="max-h-[500px] w-full object-contain bg-gray-50"
                          />

                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                            <span className="rounded-lg bg-black/60 px-3 py-2 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                              View Photo
                            </span>
                          </div>
                        </button>

                        <div className="border-t border-gray-100 p-3">
                          <button
                            type="button"
                            onClick={() => openDrive(notePhoto)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-[#d9a441] hover:bg-[#fffaf0] hover:text-[#8f681d]"
                          >
                            Open Original Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
                        <div className="text-center">
                          <ImagePlus
                            size={28}
                            className="mx-auto text-gray-300"
                          />

                          <p className="mt-2 text-sm text-gray-400">
                            No note photo attached
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ==============================================
                    FOOTER
                    ============================================== */}

                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    <ArrowLeft size={16} />
                    Back to Orders
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* ========================================================
          PHOTO PREVIEW MODAL
          ======================================================== */}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}

            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-5">
              <p className="text-sm font-semibold text-[#172033]">
                {selectedPhoto.title}
              </p>

              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Image */}

            <div className="flex max-h-[75vh] items-center justify-center overflow-auto bg-gray-100 p-3 sm:p-5">
              {getPhotoSrc(selectedPhoto.photo) ? (
                <img
                  src={getPhotoSrc(selectedPhoto.photo)}
                  alt={selectedPhoto.title}
                  className="max-h-[70vh] max-w-full object-contain"
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-gray-400">
                  Image unavailable
                </div>
              )}
            </div>

            {/* Footer */}

            <div className="flex justify-end gap-2 border-t border-gray-100 bg-white p-3 sm:p-4">
              <button
                type="button"
                onClick={() => openDrive(selectedPhoto.photo)}
                className="rounded-lg bg-[#172033] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#222d43]"
              >
                Open Original
              </button>

              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOrder;
