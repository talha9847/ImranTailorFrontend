import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/authContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Wait until /me finishes
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f4ef] flex items-center justify-center">
        <Loader2
          className="w-7 h-7 text-[#d9a441] animate-spin"
          strokeWidth={1.8}
        />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/" />;
  }

  // Authenticated
  return <Outlet />;
};

export default ProtectedRoute;
