import { Navigate } from "react-router-dom";
import { useAuth, Permissions } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission: keyof Permissions;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, permission, redirectTo = "/unauthorized" }: ProtectedRouteProps) {
  const { permissions } = useAuth();
  if (!permissions[permission]) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}
