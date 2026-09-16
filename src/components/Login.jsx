import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    console.log({
      email,
      password,
    });

    // TODO:
    // Call your login API here
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#172033] text-[#d9a441] mb-4 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 3h12M8 3v18m8-18v18M5 21h14M5 7h14"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#172033]">
            TailorHub
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Clothing & Inventory Management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(23,32,51,0.08)] border border-gray-100 p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-semibold text-[#172033]">
              Welcome back
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Sign in to manage your shop
            </p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#172033] mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                  w-full
                  h-12
                  px-4
                  rounded-xl
                  border border-gray-200
                  bg-[#fafafa]
                  text-[#172033]
                  placeholder:text-gray-400
                  outline-none
                  transition
                  focus:bg-white
                  focus:border-[#d9a441]
                  focus:ring-4
                  focus:ring-[#d9a441]/10
                "
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#172033]"
                >
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-medium text-[#b38325] hover:text-[#8f681d] transition"
                >
                  Forgot password?
                </button>
              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  w-full
                  h-12
                  px-4
                  rounded-xl
                  border border-gray-200
                  bg-[#fafafa]
                  text-[#172033]
                  placeholder:text-gray-400
                  outline-none
                  transition
                  focus:bg-white
                  focus:border-[#d9a441]
                  focus:ring-4
                  focus:ring-[#d9a441]/10
                "
              />
            </div>

            {/* Login */}
            <button
              type="submit"
              className=" w-full h-12 rounded-xl bg-[#172033] text-white font-medium tracking-wide transition hover:bg-[#202d46] active:scale-[0.99] shadow-lg shadow-[#172033]/10"
            >
              Sign in
            </button>
          </form>

          {/* Bottom */}
          <div className="mt-7 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Secure access to your shop</p>
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

export default Login;
