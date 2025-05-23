import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "./atms/src/context/AuthContext";

const ProtectedRoute = () => {
  const { user } = useContext(AuthContext);
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
