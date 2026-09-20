import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  History,
  Scissors,
  Activity,
  X,
  HistoryIcon,
  PackageCheck,
  Shirt,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: Package,
    },
    {
      name: "Used Inventory",
      path: "/used-inventory",
      icon: PackageCheck,
    },
    {
      name: "Clothes",
      path: "/clothes",
      icon: Shirt,
    },
    {
      name: "History",
      path: "/history",
      icon: History,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-64 flex-col
          bg-[#172033] text-white
          transition-transform duration-300
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d9a441] text-[#172033]">
              <Scissors size={21} strokeWidth={2} />
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                TailorHub
              </h1>

              <p className="text-[11px] text-white/45">Shop Management</p>
            </div>
          </div>

          {/* Close button - mobile only */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Main Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#d9a441] text-[#172033] shadow-lg shadow-black/10"
                        : "text-white/65 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} strokeWidth={1.8} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* System Status */}
        <div className="px-4 pb-5">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <Activity
                size={16}
                className="text-green-400"
                strokeWidth={1.8}
              />

              <span className="text-xs font-medium text-white/70">
                System Active
              </span>
            </div>

            <p className="mt-2 text-[11px] text-white/35">
              Inventory system is running normally
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
