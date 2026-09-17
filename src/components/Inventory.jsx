import React, { useEffect, useState } from "react";
import {
  Plus,
  Minus,
  Edit3,
  Package,
  X,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import axios from "axios";

const API_URL = "http://localhost:5000";

function Inventory() {
  // =========================
  // INVENTORY DATA
  // =========================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FORM
  // =========================
  const emptyForm = {
    clothName: "",
    quantity: 1,
    buyingPrice: "",
    sellingPrice: "",
  };

  const [form, setForm] = useState(emptyForm);

  // add / edit
  const [modalType, setModalType] = useState(null);

  // item being edited
  const [selectedItem, setSelectedItem] = useState(null);

  // edit quantity action
  const [quantityAction, setQuantityAction] = useState("add");

  // quantity to add/remove
  const [quantityChange, setQuantityChange] = useState(1);

  // =========================
  // GET ALL INVENTORY
  // =========================
  useEffect(function () {
    getInventory();
  }, []);
  async function getInventory() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/api/inventory/getInventory");

      const data = response.data;

      const inventoryData = Array.isArray(data)
        ? data
        : data.inventory || data.data || [];

      setInventory(inventoryData);
    } catch (error) {
      console.error(
        "Get inventory error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Unable to load inventory");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // OPEN ADD MODAL
  // =========================
  function openAddModal() {
    setForm(emptyForm);
    setSelectedItem(null);
    setModalType("add");
  }

  // =========================
  // OPEN EDIT MODAL
  // =========================
  function openEditModal(item) {
    setSelectedItem(item);

    setForm({
      clothName: item.cloth_name || item.clothName || "",
      quantity: Number(item.quantity) || 0,
      buyingPrice: item.buying_price || item.buyingPrice || "",
      sellingPrice: item.selling_price || item.sellingPrice || "",
    });

    setQuantityAction("add");
    setQuantityChange(1);

    setModalType("edit");
  }

  // =========================
  // CLOSE MODAL
  // =========================
  function closeModal() {
    setModalType(null);
    setSelectedItem(null);
    setForm(emptyForm);
    setQuantityAction("add");
    setQuantityChange(1);
  }

  // =========================
  // INPUT CHANGE
  // =========================
  function handleChange(e) {
    const { name, value } = e.target;

    setForm(function (prev) {
      return {
        ...prev,
        [name]: value,
      };
    });
  }

  // =========================
  // ADD MODAL QUANTITY
  // =========================
  function increaseAddQuantity() {
    setForm(function (prev) {
      return {
        ...prev,
        quantity: Number(prev.quantity || 0) + 1,
      };
    });
  }

  function decreaseAddQuantity() {
    setForm(function (prev) {
      return {
        ...prev,
        quantity: Math.max(1, Number(prev.quantity || 1) - 1),
      };
    });
  }

  // =========================
  // EDIT QUANTITY
  // =========================
  function increaseChangeQuantity() {
    setQuantityChange(function (prev) {
      return Number(prev) + 1;
    });
  }

  function decreaseChangeQuantity() {
    setQuantityChange(function (prev) {
      return Math.max(1, Number(prev) - 1);
    });
  }

  // =========================
  // CURRENT / NEW QUANTITY
  // =========================
  const currentQuantity = selectedItem ? Number(selectedItem.quantity) : 0;

  const changeAmount = Math.max(0, Number(quantityChange) || 0);

  const newQuantity =
    quantityAction === "add"
      ? currentQuantity + changeAmount
      : Math.max(0, currentQuantity - changeAmount);

  // =========================
  // CREATE INVENTORY
  // =========================
  async function createInventory() {
    try {
      setSubmitting(true);
      setError("");

      const response = await axios.post("/api/inventory/createInventory", {
        cloth_name: form.clothName.trim(),
        quantity: Number(form.quantity),
        buying_price: Number(form.buyingPrice),
        selling_price: Number(form.sellingPrice),
      });

      console.log("Inventory created:", response.data);

      await getInventory();
      closeModal();
    } catch (error) {
      console.error(
        "Create inventory error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Unable to create inventory");
    } finally {
      setSubmitting(false);
    }
  }

  // =========================
  // UPDATE INVENTORY
  // =========================
  async function updateInventory() {
    try {
      setSubmitting(true);
      setError("");

      const id = selectedItem.id;

      const response = await axios.put(`/api/inventory/updateInventory/${id}`, {
        cloth_name: form.clothName.trim(),
        quantity: newQuantity,
        buying_price: Number(form.buyingPrice),
        selling_price: Number(form.sellingPrice),
      });

      console.log("Inventory updated:", response.data);

      await getInventory();
      closeModal();
    } catch (error) {
      console.error(
        "Update inventory error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Unable to update inventory");
    } finally {
      setSubmitting(false);
    }
  }

  // =========================
  // SUBMIT
  // =========================
  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting) return;

    if (!form.clothName.trim()) {
      return;
    }

    if (modalType === "add") {
      await createInventory();
    }

    if (modalType === "edit") {
      await updateInventory();
    }
  }

  // =========================
  // LOGOUT
  // =========================
  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  // =========================
  // TOTALS
  // =========================
  const totalQuantity = inventory.reduce(function (total, item) {
    return total + Number(item.quantity || 0);
  }, 0);

  const stockValue = inventory.reduce(function (total, item) {
    return (
      total +
      Number(item.quantity || 0) *
        Number(item.buying_price || item.buyingPrice || 0)
    );
  }, 0);

  // =========================
  // RENDER
  // =========================
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
            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#172033] sm:text-3xl">
                  Inventory
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your available clothes and stock.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#172033] px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#222d43] sm:w-auto"
              >
                <Plus size={18} />
                Add Inventory
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Total Items */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Items
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold text-[#172033]">
                      {inventory.length}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Different cloth types
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#172033] text-[#d9a441]">
                    <Package size={21} />
                  </div>
                </div>
              </div>

              {/* Total Quantity */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Quantity
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold text-[#172033]">
                      {totalQuantity}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Available in stock
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <ShoppingBag size={21} />
                  </div>
                </div>
              </div>

              {/* Stock Value */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Stock Value
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold text-[#172033]">
                      ₹{stockValue.toLocaleString("en-IN")}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Based on buying price
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <IndianRupee size={21} />
                  </div>
                </div>
              </div>
            </div>

            {/* INVENTORY TABLE */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e6c9] text-[#8f681d]">
                    <Package size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#172033]">
                      Available Inventory
                    </h2>

                    <p className="text-xs text-gray-400">Current cloth stock</p>
                  </div>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2
                      size={28}
                      className="animate-spin text-[#d9a441]"
                    />

                    <p className="mt-3 text-sm text-gray-400">
                      Loading inventory...
                    </p>
                  </div>
                ) : inventory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Package size={40} className="text-gray-300" />

                    <p className="mt-3 text-sm text-gray-500">
                      No inventory found
                    </p>

                    <button
                      type="button"
                      onClick={openAddModal}
                      className="mt-4 rounded-lg bg-[#172033] px-4 py-2 text-xs font-medium text-white"
                    >
                      Add Inventory
                    </button>
                  </div>
                ) : (
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/70">
                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6">
                          #
                        </th>

                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6">
                          Cloth Name
                        </th>

                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6">
                          Quantity
                        </th>

                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6">
                          Buying Price
                        </th>

                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6">
                          Selling Price
                        </th>

                        <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-6">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {inventory.map(function (item, index) {
                        const clothName =
                          item.cloth_name || item.clothName || "";

                        const buyingPrice =
                          item.buying_price || item.buyingPrice || 0;

                        const sellingPrice =
                          item.selling_price || item.sellingPrice || 0;

                        return (
                          <tr
                            key={item.id}
                            className="transition hover:bg-gray-50/70"
                          >
                            <td className="px-4 py-4 text-sm text-gray-400 sm:px-6">
                              {String(index + 1).padStart(2, "0")}
                            </td>

                            <td className="px-4 py-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1e6c9] text-[#8f681d]">
                                  <Package size={17} />
                                </div>

                                <div>
                                  <p className="whitespace-nowrap text-sm font-medium text-[#172033]">
                                    {clothName}
                                  </p>

                                  <p className="text-xs text-gray-400">
                                    Cloth item
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 sm:px-6">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                  Number(item.quantity) === 0
                                    ? "bg-red-50 text-red-600"
                                    : Number(item.quantity) <= 5
                                      ? "bg-amber-50 text-amber-600"
                                      : "bg-green-50 text-green-600"
                                }`}
                              >
                                {item.quantity} pcs
                              </span>
                            </td>

                            <td className="px-4 py-4 sm:px-6">
                              <p className="whitespace-nowrap text-sm text-gray-600">
                                ₹{Number(buyingPrice).toLocaleString("en-IN")}
                              </p>
                            </td>

                            <td className="px-4 py-4 sm:px-6">
                              <p className="whitespace-nowrap text-sm font-medium text-[#172033]">
                                ₹{Number(sellingPrice).toLocaleString("en-IN")}
                              </p>
                            </td>

                            <td className="px-4 py-4 text-right sm:px-6">
                              <button
                                type="button"
                                onClick={function () {
                                  openEditModal(item);
                                }}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-[#d9a441] hover:bg-[#fffaf0] hover:text-[#8f681d]"
                              >
                                <Edit3 size={15} />
                                Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="border-t border-gray-100 px-4 py-4 sm:px-6">
                <p className="text-xs text-gray-400">
                  Showing {inventory.length} inventory items
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-[#172033]">
                  {modalType === "add" ? "Add Inventory" : "Edit Inventory"}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {modalType === "add"
                    ? "Add a new cloth item."
                    : "Update cloth information and stock."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-5 sm:p-6">
                {/* CLOTH NAME */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Cloth Name
                  </label>

                  <input
                    type="text"
                    name="clothName"
                    value={form.clothName}
                    onChange={handleChange}
                    placeholder="e.g. Cotton Shirt"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/20"
                  />
                </div>

                {/* ADD QUANTITY */}
                {modalType === "add" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Quantity
                    </label>

                    <div className="flex h-12 items-center rounded-xl border border-gray-200">
                      <button
                        type="button"
                        onClick={decreaseAddQuantity}
                        disabled={Number(form.quantity) <= 1}
                        className="flex h-full w-12 items-center justify-center border-r border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus size={17} />
                      </button>

                      <div className="flex flex-1 items-center justify-center">
                        <span className="text-sm font-semibold text-[#172033]">
                          {form.quantity}
                        </span>

                        <span className="ml-2 text-xs text-gray-400">
                          pieces
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={increaseAddQuantity}
                        className="flex h-full w-12 items-center justify-center border-l border-gray-200 text-gray-600 transition hover:bg-gray-50"
                      >
                        <Plus size={17} />
                      </button>
                    </div>
                  </div>
                )}

                {/* EDIT QUANTITY */}
                {modalType === "edit" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Stock Adjustment
                    </label>

                    <div className="mb-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                      <span className="text-sm text-gray-500">
                        Current Quantity
                      </span>

                      <span className="text-lg font-semibold text-[#172033]">
                        {currentQuantity} pcs
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* ADD */}
                      <button
                        type="button"
                        onClick={function () {
                          setQuantityAction("add");
                          setQuantityChange(1);
                        }}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          quantityAction === "add"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <Plus size={17} />
                        Add Stock
                      </button>

                      {/* REMOVE */}
                      <button
                        type="button"
                        onClick={function () {
                          setQuantityAction("remove");
                          setQuantityChange(1);
                        }}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          quantityAction === "remove"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <Minus size={17} />
                        Remove Stock
                      </button>
                    </div>

                    {/* QUANTITY CHANGE */}
                    <div className="mt-4">
                      <label className="mb-2 block text-xs font-medium text-gray-500">
                        Quantity to{" "}
                        {quantityAction === "add" ? "Add" : "Remove"}
                      </label>

                      <div className="flex h-12 items-center rounded-xl border border-gray-200">
                        <button
                          type="button"
                          onClick={decreaseChangeQuantity}
                          className="flex h-full w-12 items-center justify-center border-r border-gray-200 text-gray-600 transition hover:bg-gray-50"
                        >
                          <Minus size={17} />
                        </button>

                        <div className="flex flex-1 items-center justify-center">
                          <span className="text-sm font-semibold text-[#172033]">
                            {quantityChange}
                          </span>

                          <span className="ml-2 text-xs text-gray-400">
                            pieces
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={increaseChangeQuantity}
                          className="flex h-full w-12 items-center justify-center border-l border-gray-200 text-gray-600 transition hover:bg-gray-50"
                        >
                          <Plus size={17} />
                        </button>
                      </div>
                    </div>

                    {/* NEW QUANTITY */}
                    <div
                      className={`mt-4 rounded-xl border px-4 py-3 ${
                        quantityAction === "add"
                          ? "border-green-100 bg-green-50"
                          : "border-red-100 bg-red-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          New Quantity
                        </span>

                        <span
                          className={`text-lg font-semibold ${
                            quantityAction === "add"
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {newQuantity} pcs
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        {currentQuantity} {quantityAction === "add" ? "+" : "−"}{" "}
                        {changeAmount} = {newQuantity}
                      </p>
                    </div>
                  </div>
                )}

                {/* PRICE FIELDS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* BUYING PRICE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Buying Price
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        name="buyingPrice"
                        value={form.buyingPrice}
                        onChange={handleChange}
                        placeholder="350"
                        min="0"
                        required
                        className="w-full rounded-xl border border-gray-200 py-3 pl-8 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/20"
                      />
                    </div>
                  </div>

                  {/* SELLING PRICE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Selling Price
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        name="sellingPrice"
                        value={form.sellingPrice}
                        onChange={handleChange}
                        placeholder="650"
                        min="0"
                        required
                        className="w-full rounded-xl border border-gray-200 py-3 pl-8 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#172033] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#222d43] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {modalType === "add" ? "Adding..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      {modalType === "add" ? "Add Inventory" : "Save Changes"}
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
}

export default Inventory;
