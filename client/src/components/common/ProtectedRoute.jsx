import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute({ children, roles, redirectTo = "/portal/login" }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;

  return children;
}
