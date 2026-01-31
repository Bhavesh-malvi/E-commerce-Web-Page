import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const SellerRoute = ({ children }) => {
  
  const { user } = useContext(AppContext);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default SellerRoute;
