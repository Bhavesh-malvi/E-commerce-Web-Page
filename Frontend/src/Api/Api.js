import axios from "axios";


const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});


/* ================================
   Request Interceptor
================================ */
API.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


/* ================================
   Response Interceptor
================================ */
API.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response) {

      const status = error.response.status;
      const message = error.response.data?.message;


      // ✅ Only logout when token is invalid / expired
      if (
        status === 401 &&
        (
          message === "Invalid token" ||
          message === "Session expired. Please login again."
        )
      ) {

        localStorage.removeItem("token");

        // Redirect only if on protected route
        if (
          window.location.pathname.startsWith("/admin") ||
          window.location.pathname.startsWith("/seller")
        ) {
          window.location.href = "/";
        }
      }


      console.log("API Error:", error.response.data);

    } else {

      console.log("Network Error");

    }

    return Promise.reject(error);
  }
);



export default API;
