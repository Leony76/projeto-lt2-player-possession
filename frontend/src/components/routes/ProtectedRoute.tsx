
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = (): React.JSX.Element => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p>Verifing session...</p>;
  }

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
