import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const ProtectedRoute = () => {
  const { isSignedIn } = useUser();

  return isSignedIn ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
