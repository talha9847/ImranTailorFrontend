import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  Package,
  User,
  Phone,
  CheckCircle2,
  Clock3,
  Truck,
  CalendarDays,
  Plus,
  X,
  ImagePlus,
  Loader2,
  Bell,
  Upload,
  ChevronDown,
  Pencil,
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const emptyForm = {
  customer_name: "",
  contact: "",
  cloth_photo: null,
  note_photo: null,
  remainder_date: "",
  delivery_date: "",
  status: "pending",
};

const Clothes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [removeCloth, setRemoveCloth] = useState(false);
  const [removeNote, setRemoveNote] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [clothPreview, setClothPreview] = useState("");
  const [notePreview, setNotePreview] = useState("");

  useEffect(() => {
    getClothes();
  }, []);

  /*
   * ------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------
   */

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  function normalizeDateValue(value) {
    if (!value) return "";

    const stringValue = String(value);

    /*
     * If backend sends:
     * 2026-09-17
     *
     * Keep it exactly as-is.
     * Do NOT pass it through new Date()
     * because timezone conversion can change the day.
     */
    if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
      return stringValue;
    }

    /*
     * For ISO timestamps such as:
     * 2026-09-17T18:30:00.000Z
     *
     * Extract the calendar date from the value.
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
     * Use local Date with explicit values instead of:
     * new Date("2026-09-17")
     *
     * This prevents UTC timezone shifting.
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

  function getReminderClass(value) {
    const dateValue = normalizeDateValue(value);

    if (!dateValue) {
      return "text-gray-500";
    }

    const today = new Date();

    const todayValue = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    if (dateValue < todayValue) {
      return "text-red-600";
    }

    if (dateValue === todayValue) {
      return "text-amber-600";
    }

    return "text-gray-600";
  }

  function getDriveUrl(photo) {
    if (!photo) return "";

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

    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function normalizeItem(item) {
    const customer = item.customer || {};

    return {
      id: item.id,

      customerName:
        item.customerName || item.customer_name || customer.customer_name || "",

      contact: item.contact || customer.contact || "",

      clothPhoto: item.clothPhoto || item.cloth_photo || null,

      notePhoto: item.notePhoto || item.note_photo || null,

      status: item.status || "pending",

      remainderDate: item.remainderDate || item.remainder_date || "",

      deliveryDate: item.deliveryDate || item.delivery_date || "",
    };
  }

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
   * API
   * ------------------------------------------------------------
   */

  async function getClothes(showLoader = true) {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response = await axios.get("/api/clothes/getClothes", {
        withCredentials: true,
      });

      const data = response.data;

      const clothesData = Array.isArray(data)
        ? data
        : data?.clothes || data?.data || [];

      setClothes(clothesData);
    } catch (error) {
      console.error(
        "Get clothes error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Unable to load clothes orders",
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  /*
   * ------------------------------------------------------------
   * Modal
   * ------------------------------------------------------------
   */

  function resetModalState() {
    setEditMode(false);
    setEditingId(null);

    setForm(emptyForm);

    setClothPreview("");
    setNotePreview("");

    setRemoveCloth(false);
    setRemoveNote(false);

    setUploadProgress(0);
  }

  function openAddModal() {
    resetModalState();

    setError("");
    setModalOpen(true);
  }

  function openEditModal(item) {
    setEditMode(true);
    setEditingId(item.id);

    setError("");

    setForm({
      customer_name: item.customerName || "",
      contact: item.contact || "",

      cloth_photo: null,
      note_photo: null,

      remainder_date: normalizeDateValue(item.remainderDate),

      delivery_date: normalizeDateValue(item.deliveryDate),

      status: item.status || "pending",
    });

    setClothPreview(item.clothPhoto?.thumbnail || "");

    setNotePreview(item.notePhoto?.thumbnail || "");

    setRemoveCloth(false);
    setRemoveNote(false);

    setModalOpen(true);
  }

  function closeModal() {
    if (operationLoading) {
      return;
    }

    setModalOpen(false);
    resetModalState();
    setError("");
  }

  /*
   * ------------------------------------------------------------
   * Form
   * ------------------------------------------------------------
   */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function validateImage(file, label) {
    if (!file) {
      return false;
    }

    if (!file.type.startsWith("image/")) {
      setError(`Please select a valid ${label} image.`);

      return false;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(`${label} image must be less than 5MB.`);

      return false;
    }

    return true;
  }

  function handleClothPhoto(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!validateImage(file, "cloth")) {
      event.target.value = "";
      return;
    }

    setError("");

    /*
     * Revoke previous blob URL if one exists.
     */
    if (clothPreview && clothPreview.startsWith("blob:")) {
      URL.revokeObjectURL(clothPreview);
    }

    const preview = URL.createObjectURL(file);

    setForm((previous) => ({
      ...previous,
      cloth_photo: file,
    }));

    setClothPreview(preview);

    /*
     * New file means we don't need the backend
     * remove flag anymore.
     */
    setRemoveCloth(false);
  }

  function handleNotePhoto(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!validateImage(file, "note")) {
      event.target.value = "";
      return;
    }

    setError("");

    if (notePreview && notePreview.startsWith("blob:")) {
      URL.revokeObjectURL(notePreview);
    }

    const preview = URL.createObjectURL(file);

    setForm((previous) => ({
      ...previous,
      note_photo: file,
    }));

    setNotePreview(preview);

    setRemoveNote(false);
  }

  function removeClothPhoto() {
    if (operationLoading) return;

    if (clothPreview && clothPreview.startsWith("blob:")) {
      URL.revokeObjectURL(clothPreview);
    }

    setForm((previous) => ({
      ...previous,
      cloth_photo: null,
    }));

    setClothPreview("");

    if (editMode) {
      setRemoveCloth(true);
    }
  }

  function removeNotePhoto() {
    if (operationLoading) return;

    if (notePreview && notePreview.startsWith("blob:")) {
      URL.revokeObjectURL(notePreview);
    }

    setForm((previous) => ({
      ...previous,
      note_photo: null,
    }));

    setNotePreview("");

    if (editMode) {
      setRemoveNote(true);
    }
  }

  function createFormData() {
    const formData = new FormData();

    formData.append("customer_name", form.customer_name.trim());

    formData.append("contact", form.contact.trim());

    /*
     * Always send dates as YYYY-MM-DD.
     */
    formData.append("remainder_date", normalizeDateValue(form.remainder_date));

    formData.append("delivery_date", normalizeDateValue(form.delivery_date));

    formData.append("status", form.status);

    formData.append("removeClothPhoto", String(removeCloth));

    formData.append("removeNotePhoto", String(removeNote));

    if (form.cloth_photo instanceof File) {
      formData.append("cloth_photo", form.cloth_photo);
    }

    if (form.note_photo instanceof File) {
      formData.append("note_photo", form.note_photo);
    }

    return formData;
  }

  /*
   * ------------------------------------------------------------
   * Create
   * ------------------------------------------------------------
   */

  async function createClothes() {
    try {
      setOperationLoading(true);
      setUploadProgress(0);
      setError("");

      const formData = createFormData();

      await axios.post("/api/clothes/createClothes", formData, {
        withCredentials: true,

        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;

          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );

          setUploadProgress(percent);
        },
      });

      setUploadProgress(100);

      await getClothes(false);

      setModalOpen(false);
      resetModalState();
      setError("");
    } catch (error) {
      console.error(
        "Create clothes error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Unable to create clothes order",
      );
    } finally {
      setOperationLoading(false);

      setTimeout(() => {
        setUploadProgress(0);
      }, 500);
    }
  }

  /*
   * ------------------------------------------------------------
   * Update
   * ------------------------------------------------------------
   */

  async function updateClothes() {
    if (!editingId) {
      setError("Invalid clothes order.");
      return;
    }

    try {
      setOperationLoading(true);
      setUploadProgress(0);
      setError("");

      const formData = createFormData();

      await axios.put(`/api/clothes/updateClothes/${editingId}`, formData, {
        withCredentials: true,

        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;

          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );

          setUploadProgress(percent);
        },
      });

      setUploadProgress(100);

      await getClothes(false);

      setModalOpen(false);
      resetModalState();
      setError("");
    } catch (error) {
      console.error(
        "Update clothes error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Unable to update clothes order",
      );
    } finally {
      setOperationLoading(false);

      setTimeout(() => {
        setUploadProgress(0);
      }, 500);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (operationLoading) {
      return;
    }

    if (!form.customer_name.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!form.contact.trim()) {
      setError("Customer contact is required.");
      return;
    }

    if (!form.delivery_date) {
      setError("Delivery date is required.");
      return;
    }

    if (
      form.remainder_date &&
      form.delivery_date &&
      normalizeDateValue(form.remainder_date) >
        normalizeDateValue(form.delivery_date)
    ) {
      setError("Reminder date cannot be after the delivery date.");
      return;
    }

    if (editMode) {
      await updateClothes();
    } else {
      await createClothes();
    }
  }

  /*
   * ------------------------------------------------------------
   * Status
   * ------------------------------------------------------------
   */

  async function updateStatus(id, status) {
    if (statusLoadingId || operationLoading) {
      return;
    }

    try {
      setStatusLoadingId(id);
      setError("");

      await axios.patch(
        `/api/clothes/updateClothesStatus/${id}`,
        { status },
        {
          withCredentials: true,
        },
      );

      /*
       * Reuse getClothes() instead of duplicating
       * fetching logic.
       */
      await getClothes(false);
    } catch (error) {
      console.error(
        "Update status error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Unable to update order status",
      );
    } finally {
      setStatusLoadingId(null);
    }
  }

  /*
   * ------------------------------------------------------------
   * Data
   * ------------------------------------------------------------
   */

  const normalizedClothes = useMemo(
    () => clothes.map(normalizeItem),
    [clothes],
  );

  const filteredClothes = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return normalizedClothes.filter((item) => {
      const matchesFilter =
        activeFilter === "all" || item.status === activeFilter;

      if (!searchText) {
        return matchesFilter;
      }

      const matchesSearch =
        item.customerName.toLowerCase().includes(searchText) ||
        item.contact.toLowerCase().includes(searchText) ||
        String(item.id).includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [normalizedClothes, activeFilter, search]);

  const filterButtons = useMemo(
    () => [
      {
        key: "all",
        label: "All Clothes",
        count: normalizedClothes.length,
      },
      {
        key: "pending",
        label: "Pending",
        count: normalizedClothes.filter((item) => item.status === "pending")
          .length,
      },
      {
        key: "ready",
        label: "Ready",
        count: normalizedClothes.filter((item) => item.status === "ready")
          .length,
      },
      {
        key: "delivered",
        label: "Delivered",
        count: normalizedClothes.filter((item) => item.status === "delivered")
          .length,
      },
    ],
    [normalizedClothes],
  );

  /*
   * ------------------------------------------------------------
   * Render helpers
   * ------------------------------------------------------------
   */

  function renderPhoto(photo, alt, size = "136px") {
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

  const currentStatus = activeFilter === "all" ? null : getStatus(activeFilter);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-screen ml-0 lg:ml-64">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="pt-20">
          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#172033] sm:text-3xl">
                  All Clothes
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  View and manage all customer clothing orders.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddModal}
                disabled={operationLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#172033] px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#222d43] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Plus size={18} />
                Add Customer
              </button>
            </div>

            {/* Error */}
            {error && !modalOpen && (
              <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="ml-3"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Search / filters */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="relative w-full">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search customer, contact or order..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-[#172033] outline-none transition placeholder:text-gray-400 focus:border-[#d9a441] focus:bg-white"
                  />
                </div>

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

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e6c9] text-[#8f681d]">
                    <Package size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#172033]">
                      {currentStatus
                        ? `${currentStatus.label} Clothes`
                        : "All Clothes"}
                    </h2>

                    <p className="text-xs text-gray-400">
                      Showing {filteredClothes.length} orders
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CalendarDays size={14} />

                  {new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-[#d9a441]" />

                  <p className="mt-3 text-sm text-gray-400">
                    Loading clothes...
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[1350px] table-fixed">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/70">
                          <th className="w-[220px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Customer
                          </th>

                          <th className="w-[170px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Contact
                          </th>

                          <th className="w-[180px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Cloth
                          </th>

                          <th className="w-[180px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Note
                          </th>

                          <th className="w-[150px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Reminder
                          </th>

                          <th className="w-[150px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Delivery
                          </th>

                          <th className="w-[140px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Status
                          </th>

                          <th className="w-[220px] px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {filteredClothes.map((item) => {
                          const status = getStatus(item.status);

                          const StatusIcon = status.icon;

                          const isStatusLoading = statusLoadingId === item.id;

                          return (
                            <tr
                              key={item.id}
                              className="transition hover:bg-gray-50/70"
                            >
                              {/* Customer */}
                              <td className="px-6 py-4 align-middle">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1e6c9] text-[#8f681d]">
                                    <User size={16} />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-[#172033]">
                                      {item.customerName}
                                    </p>

                                    <p className="text-xs text-gray-400">
                                      Order #{String(item.id).padStart(4, "0")}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Contact */}
                              <td className="px-6 py-4 align-middle">
                                <div className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600">
                                  <Phone
                                    size={15}
                                    className="shrink-0 text-gray-400"
                                  />

                                  {item.contact}
                                </div>
                              </td>

                              {/* Cloth */}
                              <td className="px-6 py-4 align-middle">
                                {renderPhoto(
                                  item.clothPhoto,
                                  `${item.customerName} cloth`,
                                  "136px",
                                )}
                              </td>

                              {/* Note */}
                              <td className="px-6 py-4 align-middle">
                                {renderPhoto(
                                  item.notePhoto,
                                  `${item.customerName} note`,
                                  "136px",
                                )}
                              </td>

                              {/* Reminder */}
                              <td className="px-6 py-4 align-middle">
                                <div
                                  className={`flex min-w-[125px] items-center gap-2 whitespace-nowrap text-sm ${getReminderClass(
                                    item.remainderDate,
                                  )}`}
                                >
                                  <Bell size={15} className="shrink-0" />

                                  <span>{formatDate(item.remainderDate)}</span>
                                </div>
                              </td>

                              {/* Delivery */}
                              <td className="px-6 py-4 align-middle">
                                <div className="flex min-w-[125px] items-center gap-2 whitespace-nowrap text-sm text-gray-600">
                                  <CalendarDays
                                    size={15}
                                    className="shrink-0 text-gray-400"
                                  />

                                  <span>{formatDate(item.deliveryDate)}</span>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4 align-middle">
                                <span
                                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${status.className}`}
                                >
                                  <StatusIcon size={13} />

                                  {status.label}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 align-middle">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(item)}
                                    disabled={
                                      operationLoading || !!statusLoadingId
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-[#d9a441] hover:bg-[#fffaf0] hover:text-[#8f681d] disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <Pencil size={14} />
                                    Edit
                                  </button>

                                  <div className="relative">
                                    <select
                                      value={item.status}
                                      disabled={
                                        isStatusLoading || operationLoading
                                      }
                                      onChange={(event) =>
                                        updateStatus(
                                          item.id,
                                          event.target.value,
                                        )
                                      }
                                      className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-gray-600 outline-none transition focus:border-[#d9a441] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <option value="pending">Pending</option>

                                      <option value="ready">Ready</option>

                                      <option value="delivered">
                                        Delivered
                                      </option>
                                    </select>

                                    {isStatusLoading ? (
                                      <Loader2
                                        size={14}
                                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-[#d9a441]"
                                      />
                                    ) : (
                                      <ChevronDown
                                        size={14}
                                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                                      />
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile */}
                  <div className="space-y-3 p-4 md:hidden">
                    {filteredClothes.map((item) => {
                      const status = getStatus(item.status);

                      const StatusIcon = status.icon;

                      const isStatusLoading = statusLoadingId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
                        >
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

                          <div className="mt-4 flex gap-3">
                            <div>
                              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                Cloth
                              </p>

                              {renderPhoto(item.clothPhoto, "Cloth", "128px")}
                            </div>

                            <div>
                              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                Note
                              </p>

                              {renderPhoto(item.notePhoto, "Note", "128px")}
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-2">
                            <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2.5">
                              <Phone size={14} className="text-gray-400" />

                              <span className="text-xs text-gray-600">
                                {item.contact}
                              </span>
                            </div>

                            <div
                              className={`flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 ${getReminderClass(
                                item.remainderDate,
                              )}`}
                            >
                              <Bell size={14} />

                              <span className="text-xs">
                                Reminder: {formatDate(item.remainderDate)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2.5">
                              <CalendarDays
                                size={14}
                                className="text-gray-400"
                              />

                              <span className="text-xs text-gray-600">
                                Delivery: {formatDate(item.deliveryDate)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              disabled={operationLoading || !!statusLoadingId}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-600 transition hover:border-[#d9a441] hover:bg-[#fffaf0] hover:text-[#8f681d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <div className="relative">
                              <select
                                value={item.status}
                                disabled={isStatusLoading || operationLoading}
                                onChange={(event) =>
                                  updateStatus(item.id, event.target.value)
                                }
                                className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-8 text-xs text-gray-600 outline-none focus:border-[#d9a441] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="pending">Pending</option>

                                <option value="ready">Ready</option>

                                <option value="delivered">Delivered</option>
                              </select>

                              {isStatusLoading ? (
                                <Loader2
                                  size={14}
                                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-[#d9a441]"
                                />
                              ) : (
                                <ChevronDown
                                  size={14}
                                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

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

                      <button
                        type="button"
                        onClick={openAddModal}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#172033] px-4 py-2.5 text-xs font-medium text-white"
                      >
                        <Plus size={14} />
                        Add Customer
                      </button>
                    </div>
                  )}
                </>
              )}

              {!loading && (
                <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                  <p className="text-xs text-gray-400">
                    Showing {filteredClothes.length} of{" "}
                    {normalizedClothes.length} orders
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-[#172033]">
                  {editMode ? "Edit Clothes Order" : "Add Customer"}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {editMode
                    ? "Update customer, photos, dates and status."
                    : "Add customer details and clothing order."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={operationLoading}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6 p-5 sm:p-6">
                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Customer */}
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1e6c9] text-[#8f681d]">
                      <User size={17} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#172033]">
                        Customer Information
                      </h3>

                      <p className="text-xs text-gray-400">
                        Basic customer details
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Customer Name
                      </label>

                      <input
                        type="text"
                        name="customer_name"
                        value={form.customer_name}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Patel"
                        required
                        disabled={operationLoading}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/20 disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Contact Number
                      </label>

                      <input
                        type="tel"
                        name="contact"
                        value={form.contact}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        required
                        disabled={operationLoading}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/20 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1e6c9] text-[#8f681d]">
                      <ImagePlus size={17} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#172033]">
                        Clothing Photos
                      </h3>

                      <p className="text-xs text-gray-400">
                        Upload or replace cloth and measurement photos
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Cloth */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Cloth Photo
                      </label>

                      {clothPreview ? (
                        <div className="relative overflow-hidden rounded-xl border border-gray-200">
                          <img
                            src={clothPreview}
                            alt="Cloth preview"
                            className="h-52 w-full object-cover"
                          />

                          {operationLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Loader2
                                size={28}
                                className="animate-spin text-white"
                              />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={removeClothPhoto}
                            disabled={operationLoading}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 disabled:opacity-50"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex h-52 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 transition hover:border-[#d9a441] hover:bg-[#fffaf0]">
                          {operationLoading ? (
                            <Loader2
                              size={25}
                              className="animate-spin text-[#d9a441]"
                            />
                          ) : (
                            <Upload size={25} className="text-gray-400" />
                          )}

                          <p className="mt-3 text-sm font-medium text-gray-600">
                            Upload cloth photo
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            PNG, JPG up to 5MB
                          </p>

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleClothPhoto}
                            disabled={operationLoading}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Note */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Note / Measurement Photo
                      </label>

                      {notePreview ? (
                        <div className="relative overflow-hidden rounded-xl border border-gray-200">
                          <img
                            src={notePreview}
                            alt="Note preview"
                            className="h-52 w-full object-cover"
                          />

                          {operationLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Loader2
                                size={28}
                                className="animate-spin text-white"
                              />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={removeNotePhoto}
                            disabled={operationLoading}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 disabled:opacity-50"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex h-52 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 transition hover:border-[#d9a441] hover:bg-[#fffaf0]">
                          {operationLoading ? (
                            <Loader2
                              size={25}
                              className="animate-spin text-[#d9a441]"
                            />
                          ) : (
                            <Upload size={25} className="text-gray-400" />
                          )}

                          <p className="mt-3 text-sm font-medium text-gray-600">
                            Upload note photo
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            PNG, JPG up to 5MB
                          </p>

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleNotePhoto}
                            disabled={operationLoading}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1e6c9] text-[#8f681d]">
                      <CalendarDays size={17} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#172033]">
                        Order Details
                      </h3>

                      <p className="text-xs text-gray-400">
                        Set dates and order status
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Bell size={15} className="text-amber-500" />
                        Reminder Date
                      </label>

                      <input
                        type="date"
                        name="remainder_date"
                        value={form.remainder_date}
                        onChange={handleChange}
                        disabled={operationLoading}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/20 disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Truck size={15} className="text-green-600" />
                        Delivery Date
                      </label>

                      <input
                        type="date"
                        name="delivery_date"
                        value={form.delivery_date}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/20 disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Status
                      </label>

                      <div className="relative">
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          disabled={operationLoading}
                          className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-gray-700 outline-none transition focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/20 disabled:bg-gray-50"
                        >
                          <option value="pending">Pending</option>

                          <option value="ready">Ready</option>

                          <option value="delivered">Delivered</option>
                        </select>

                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={operationLoading}
                  className="w-full rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={operationLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#172033] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#222d43] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {operationLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />

                      {editMode
                        ? `Updating Details... ${uploadProgress}%`
                        : `Adding Customer... ${uploadProgress}%`}
                    </>
                  ) : editMode ? (
                    <>
                      <Pencil size={16} />
                      Update Details
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add Customer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clothes;
