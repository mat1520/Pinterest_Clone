import { Navigate } from "react-router-dom";
import { useAuth } from "../store/authStore";

function ProtectedRoute({ children }) {
  const { authenticated, loading } = useAuth();
  if (loading) return null;
  return authenticated ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
