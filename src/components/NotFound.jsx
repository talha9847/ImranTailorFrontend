import React from "react";
import { ArrowLeft, Home, Scissors } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f6f4ef] flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        {/* Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#172033] text-[#d9a441] shadow-lg">
            <Scissors className="w-7 h-7" strokeWidth={1.7} />
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#172033]">
            TailorHub
          </h1>
        </div>

        {/* 404 Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_12px_40px_rgba(23,32,51,0.08)] p-8 sm:p-10">
          {/* 404 */}
          <div className="mb-6">
            <span className="text-7xl sm:text-8xl font-bold tracking-tight text-[#172033]">
              404
            </span>

            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#d9a441]" />
          </div>

          {/* Message */}
          <h2 className="text-2xl font-semibold text-[#172033]">
            Page not found
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500 max-w-sm mx-auto">
            The page you're looking for doesn't exist or may have been moved to
            another location.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="
                w-full sm:w-auto
                h-11
                px-5
                rounded-xl
                border border-gray-200
                bg-white
                text-[#172033]
                text-sm
                font-medium
                transition
                hover:bg-gray-50
                active:scale-[0.98]
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
              Go back
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="
                w-full sm:w-auto
                h-11
                px-5
                rounded-xl
                bg-[#172033]
                text-white
                text-sm
                font-medium
                transition
                hover:bg-[#202d46]
                active:scale-[0.98]
                shadow-lg
                shadow-[#172033]/10
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <Home className="w-4 h-4" strokeWidth={1.8} />
              Back to dashboard
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 TailorHub. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
