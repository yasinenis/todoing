import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import { FullScreenLoader } from "@/components/full-screen-loader";

export function ProtectedRoute() {
  const { session, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}
