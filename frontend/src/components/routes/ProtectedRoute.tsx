
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageLoading from "../PageLoading";

export const ProtectedRoute = (): React.JSX.Element => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoading/>;

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
