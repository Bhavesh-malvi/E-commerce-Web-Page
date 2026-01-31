import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {

  const { user, authLoading } = useContext(AppContext);


  if (authLoading) {
    return <p className="text-center mt-10">Loading...</p>;
  }


  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }


  return children;
};

export default AdminRoute;
