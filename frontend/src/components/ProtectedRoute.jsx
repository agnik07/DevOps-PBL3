import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading session...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === "teacher" ? "/dashboard" : "/student-dashboard"} replace />;
  return <Outlet />;
};

export default ProtectedRoute;
