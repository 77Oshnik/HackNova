import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const ProtectedRoute = () => {
  const { isSignedIn } = useAuth();
  console.log("Auth Status:", isSignedIn); // Debugging

  return isSignedIn ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
