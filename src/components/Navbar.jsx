import React from "react";
import { LogOut, Scissors, User, Menu } from "lucide-react";

const Navbar = ({ onLogout, onMenuClick }) => {
  return (
    <header
      className="
        fixed left-0 right-0 top-0 z-30
        h-20 border-b border-gray-200
        bg-white
        lg:left-64
      "
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={onMenuClick}
            className="
              rounded-lg p-2
              text-gray-600
              hover:bg-gray-100
              lg:hidden
            "
          >
            <Menu size={22} />
          </button>

          {/* Logo - mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#172033] text-[#d9a441]">
              <Scissors size={18} strokeWidth={2} />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-[#172033]">TailorHub</p>

              <p className="text-xs text-gray-400">Clothing Management</p>
            </div>
          </div>

          {/* Desktop title */}
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-[#172033]">TailorHub</p>

            <p className="text-xs text-gray-400">Clothing Management</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Info */}
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-[#172033]">Shop Admin</p>

            <p className="text-xs text-gray-400">Administrator</p>
          </div>

          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1e6c9] text-[#8f681d] sm:h-10 sm:w-10">
            <User size={18} strokeWidth={1.8} />
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="
              flex items-center gap-2
              rounded-lg
              border border-gray-200
              px-2.5 py-2
              text-sm font-medium
              text-gray-600
              transition
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600
              sm:px-3
            "
          >
            <LogOut size={17} strokeWidth={1.8} />

            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
