import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const UserRoute = ({ children }) => {

  const { user, authLoading } = useContext(AppContext);


  if (authLoading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  // Not authenticated - redirect to home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Redirect based on role
  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === "seller") {
    return <Navigate to="/seller" replace />;
  }

  // Not a regular user
  if (user.role !== "user") {
    return <Navigate to="/" replace />;
  }


  return children;
};

export default UserRoute;
