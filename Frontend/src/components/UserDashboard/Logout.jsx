import { useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";



const Logout = () => {

  const { setUser } = useContext(AppContext);


  useEffect(() => {

    localStorage.removeItem("token");
    setUser(null);

    window.location.href = "/";

  }, []);


  return <p>Logging out...</p>;
};

export default Logout;
