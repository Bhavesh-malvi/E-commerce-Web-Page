import { createContext, useEffect, useState } from "react";
import { dummyProducts } from "../assets/assets";
import API from "../api/Api";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();



export const AppProvider = ({children})=>{

    const [open, setOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);



    const [currency, setCurrency] = useState("INR");

    const [isShow, setIsShow] = useState(false)

    const [baseCategoryData, setBaseCategoryData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [products, setProducts] = useState([]);
    const [wishlist, setWishlist] = useState({ items: [] });
    const [cart, setCart] = useState(null);
    const [activeDeals, setActiveDeals] = useState([]);
    const [activeMegaDeal, setActiveMegaDeal] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressID, setSelectedAddressID] = useState(localStorage.getItem("selectedAddressID") || null);


    const fetchProducts = async () => {
        try {
            const data = await getAllProducts({ limit: 1000 });
            if (data.success) {
                setProducts(data.products);
                console.log("Fetched Products:", data.products);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };
    
    const fetchActiveDeals = async () => {
        try {
            const res = await API.get("/deal/active");
            if (res.data.success) {
                setActiveDeals(res.data.deals);
                console.log("Active Deals:", res.data.deals);
            }
        } catch (error) {
            console.error("Error fetching active deals:", error);
        }
    };

    const fetchActiveMegaDeal = async () => {
        try {
            const res = await API.get("/megadeal/active");
            if (res.data.success) {
                setActiveMegaDeal(res.data.megaDeal);
                console.log("Active Mega Deal:", res.data.megaDeal);
            }
        } catch (error) {
            console.error("Error fetching mega deal:", error);
        }
    };


    const newArrival = products.filter((p) => 
        p?.badges?.some(b => b.toLowerCase().includes("new arrivals")) || 
        (p?.isNew === true)
    ).sort((a, b) => new Date(b.listedAt || b.createdAt) - new Date(a.listedAt || a.createdAt));

    const trending = products.filter((p) => 
        p?.badges?.some(b => b.toLowerCase().includes("trending")) || 
        (p?.sold > 5)
    ).sort((a, b) => (b.sold || 0) - (a.sold || 0));

    const topRated = products.filter((p) => 
        p?.badges?.some(b => b.toLowerCase().includes("top rated")) || 
        (p?.ratings >= 4.5 && p?.numOfReviews > 0)
    ).sort((a, b) => (b.ratings || 0) - (a.ratings || 0));

    const dealOfTheDay = products.filter((p) => 
        p?.badges?.some(b => b.toLowerCase().includes("deal of the day"))
    );

    const newProducts = products.filter((p) => 
        p?.badges?.some(b => b.toLowerCase().includes("new products")) || 
        (p?.isNew === true)
    );

    const bestSeller = products.filter((p) => 
        p?.badges?.some(b => b.toLowerCase().includes("best sellers")) || 
        (p?.sold > 10)
    ).sort((a, b) => (b.sold || 0) - (a.sold || 0));


    


    const trendTypeData = [
        {
            title: "New Arrivals",
            data: newArrival
        },
        {
            title: "Trending",
            data: trending
        },
        {
            title: "Top Rated",
            data: topRated
        },
    ]


    const truncateText = (text, maxLength = 20) => {
        if (!text) return "";
        return text.length > maxLength
            ? text.slice(0, maxLength) + "..."
            : text;
    };


    const rates = {
        INR: 1,
        USD : 0.011,
    };

    const convertPrice = (price) =>{
        return (price * rates[currency]).toFixed(2)
    };


    const getWishlist = async () => {
      try {
        const res = await API.get("/wishlist");
        if (res.data.success) {
          setWishlist(res.data.wishlist);
        }
        return res.data;
      } catch (error) {
        return error.response?.data || { success: false };
      }
    };

    const addToWishlist = async (productId, variant = {}) => {
      try {
        const res = await API.post("/wishlist", { product: productId, variant });
        if (res.data.success) {
          setWishlist(res.data.wishlist);
        }
        return res.data;
      } catch (error) {
        return error.response?.data || { success: false };
      }
    };

    const removeFromWishlist = async (itemId) => {
      try {
        const res = await API.delete(`/wishlist/${itemId}`);
        if (res.data.success) {
          setWishlist(res.data.wishlist);
        }
        return res.data;
      } catch (error) {
        return error.response?.data || { success: false };
      }
    };

    useEffect(() => {
        const init = async () => {
             await fetchProducts();
             await fetchActiveDeals();
             await fetchActiveMegaDeal();

             const token = localStorage.getItem("token");
             if (token) {
                 await getProfile();
                 await getWishlist();
                 await getCart();
                 await fetchAddresses();
             }
             setAuthLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsShow(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);












const login = async (email, password) => {

  try {

    setLoading(true);

    const { data } = await API.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", data.token);

    setUser(data.user);
    // Fetch wishlist after login
    getWishlist();

    return data;

  } catch (err) {

    // 🚨 Blocked User
    if (err.response?.status === 403) {

      return {
        success: false,
        message: "Your account has been blocked. Please contact support.",
      };
    }


    // ❌ Invalid credentials / others
    return err.response?.data || {
      success: false,
      message: "Login failed",
    };

  } finally {

    setLoading(false);
  }
};







const register = async (formData) => {

  try {

    setLoading(true);

    const { data } = await API.post("/auth/register", formData);

    if (data?.token) {

      localStorage.setItem("token", data.token);

      setUser(data.user);
      getWishlist();
    }

    return data;

  } catch (err) {

    return err.response?.data || {
      success: false,
      message: "Registration failed",
    };

  } finally {
    setLoading(false);
  }
};




   const getProfile = async () => {
  try {

    const { data } = await API.get("/auth/profile");

    setUser(data.user);

    return data; // ✅ IMPORTANT

  } catch {

    setUser(null);
    return null;

  } finally {

    setAuthLoading(false);
  }
};


  
  const updateProfile = async (formData) =>{
    try {
        
        setLoading(true);

        const {data} = await API.put("/auth/profile", formData,{
            headers:{
                "Content-Type": "multipart/form-data"
            }
        })

        setUser(data.user);

        return data

    } catch (error) {
        console.log("Profle Update time Error", error);
        
    }finally{
        setLoading(false);
    }
  }
  

  const forgotPassword = async(email) =>{
    try {
        
        const {data} = await API.post("/auth/forgot-password", {email});

        return data;

    } catch (error) {
        return error.response?.data
    }
}



const getAllUsers = async () => {
    try {
        const {data} = await API.get("/admin/users")

        return data;
    } catch (error) {
        return error.response?.data || {
            success: false,
            message: "Failed to fetch users",
        }
    }
}



const blockUser = async (id) => {
  try {

    const { data } = await API.put(`/admin/users/block/${id}`);

    return data;

  } catch (error) {

    console.log("Block Error:", error);

    return error.response?.data;
  }
};


const applySeller = async (formData) => {

  try {

    const res = await API.post(
      "/seller/apply",
      formData
    );

    return res.data;

  } catch (error) {

    return error.response?.data || {
      success: false,
      message: "Request failed"
    };
  }
};


// ================= SELLER ADMIN =================

// Get all sellers
const getAllSellers = async () => {
  try {

    const res = await API.get("/admin/sellers");

    return res.data;

  } catch (error) {

    return error.response?.data || {
      success: false,
      message: "Failed to fetch sellers"
    };
  }
};


// Approve seller
const approveSeller = async (id) => {
  try {

    const res = await API.put(
      `/admin/seller/verify/${id}`
    );

    return res.data;

  } catch (error) {

    return error.response?.data || {
      success: false,
      message: "Approval failed"
    };
  }
};



useEffect(() => {

  const init = async () => {

    if (localStorage.getItem("token")) {
      await getProfile();
    } else {
      setAuthLoading(false);
    }
    await fetchProducts();

  };

  init();

}, []);









// ================= SELLER DASHBOARD =================

// Get seller dashboard stats
const getSellerDashboard = async () => {
  try {
    const res = await API.get("/seller/dashboard");
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to fetch dashboard"
    };
  }
};




// Get seller's orders
const getSellerOrders = async () => {
  try {
    const res = await API.get("/order/seller");
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to fetch orders"
    };
  }
};


// Update order status
const updateOrderStatus = async (orderId, status) => {
  try {
    const res = await API.put(`/order/${orderId}/status`, { status });
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to update order status"
    };
  }
};


// Get seller profile
const getSellerProfile = async () => {
  try {
    const res = await API.get("/seller/me");
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to fetch seller profile"
    };
  }
};


// Update seller profile
const updateSellerProfile = async (formData) => {
  try {
    const res = await API.put("/seller/profile", formData);
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to update profile"
    };
  }
};


// Get all products belonging to the logged-in seller
const getSellerProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await API.get(`/product/seller-all?${queryParams}`);
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to fetch seller products"
    };
  }
};

// Toggle product status
const toggleProductStatus = async (productId) => {
  try {
    const res = await API.put(`/product/${productId}/toggle`);
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to toggle product status"
    };
  }
};


// Get seller analytics
const getSellerAnalytics = async () => {
  try {
    const res = await API.get("/seller/analytics");
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to fetch analytics"
    };
  }
};


// Add product
const addProduct = async (formData) => {
  try {
    const res = await API.post("/product/add", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to add product"
    };
  }
};


// Update product
const updateProduct = async (id, formData) => {
  try {
    const res = await API.put(`/product/update/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to update product"
    };
  }
};


// Delete product
const deleteProduct = async (id) => {
  try {
    const res = await API.delete(`/product/delete/${id}`);
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to delete product"
    };
  }
};


// Get all products (with filters)
const getAllProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await API.get(`/product?${queryParams}`);
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to fetch products"
    };
  }
};


// Get single product
const getSingleProduct = async (id) => {
  try {
    const res = await API.get(`/product/single/${id}`);
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to fetch product"
    };
  }
};

// Get unique categories
const getUniqueCategories = async () => {
  try {
    const res = await API.get("/product/categories");
    return res.data;
  } catch (error) {
    return { success: false, categories: [] };
  }
};

// Get unique subcategories
const getUniqueSubCategories = async (category) => {
  try {
    const res = await API.get("/product/subcategories", { params: { category } });
    return res.data;
  } catch (error) {
    return { success: false, subCategories: [] };
  }
};


// ================= ADMIN DASHBOARD =================

// Get admin stats
const getAdminStats = async () => {
  try {
    const res = await API.get("/admin/stats");
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to fetch stats"
    };
  }
};


// Get monthly revenue
const getMonthlyRevenue = async () => {
  try {
    const res = await API.get("/admin/monthly");
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to fetch revenue"
    };
  }
};


// Get top products
const getTopProducts = async () => {
  try {
    const res = await API.get("/admin/top-products");
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to fetch top products"
    };
  }
};


// Get recent orders
const getRecentOrders = async () => {
    try {
    const res = await API.get("/admin/recent-orders");
    return res.data;
    } catch (error) {
    return error.response?.data || {
        success: false,
        message: "Failed to fetch orders"
    };
    }
};

// ================= CART =================
const getCart = async () => {
  try {
    const res = await API.get("/cart");
    if (res.data.success) {
      setCart(res.data.cart);
    }
    return res.data;
  } catch (error) {
    return error.response?.data;
  }
};

const addToCart = async (productId, quantity = 1, variant) => {
  try {
    const res = await API.post("/cart", { productId, quantity, variant });
    if (res.data.success) {
      setCart(res.data.cart);
    }
    return res.data;
  } catch (error) {
    return error.response?.data;
  }
};

const removeFromCart = async (productId) => {
  try {
    const res = await API.delete(`/cart/${productId}`);
    if (res.data.success) {
      setCart(res.data.cart);
    }
    return res.data;
  } catch (error) {
    return error.response?.data;
  }
};

const updateCartQuantity = async (productId, quantity) => {
  try {
    const res = await API.put("/cart/quantity", { productId, quantity });
    if (res.data.success) {
      setCart(res.data.cart);
    }
    return res.data;
  } catch (error) {
    return error.response?.data;
  }
};

const placeOrder = async (data) => {
  try {
    const res = await API.post("/order/place", data);
    return res.data;
  } catch (error) {
    return error.response?.data;
  }
};

const applyCoupon = async (code, total) => {
  try {
    const res = await API.post("/coupon/apply", { code, total });
    return res.data;
  } catch (error) {
    return error.response?.data;
  }
};


// Get today stats
const getTodayStats = async () => {
  try {
    const res = await API.get("/admin/today");
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to fetch today stats"
    };
  }
};


// Get all orders (admin)
const getAllOrders = async () => {
  try {
    const res = await API.get("/admin/orders");
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to fetch orders"
    };
  }
};

// Get all products (admin)
const getAdminProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await API.get(`/admin/products?${queryParams}`);
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to fetch products"
    };
  }
};


// Delete user (admin)
const deleteUser = async (userId) => {
  try {
    const res = await API.delete(`/admin/users/${userId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Failed to delete user"
    };
  }
};


    
    

// Review functions
const addReview = async (productId, formData) => {
  try {
    const res = await API.post(`/review/${productId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: "Failed" };
  }
};

// Browsing history functions
const trackActivity = async (activityData) => {
  try {
    const res = await API.post("/browse/track", activityData);
    return res.data;
  } catch (error) {
    console.error("Tracking error:", error);
    return { success: false };
  }
};

const getMyActivity = async () => {
  try {
    const res = await API.get("/browse/me");
    return res.data;
  } catch (error) {
    console.error("Fetch activity error:", error);
    return { success: false, data: [] };
  }
};






// Order functions
const getMyOrders = async () => {
  try {
    const res = await API.get("/order/my");
    return res.data;
  } catch (error) {
    console.error("Fetch orders error:", error);
    return { success: false, orders: [] };
  }
};


// Address functions
const fetchAddresses = async () => {
    try {
        const res = await API.get("/address");
        if (res.data.success) {
            setAddresses(res.data.list);
            
            // Auto-select default address if none selected or if previously selected is gone
            const defaultAddress = res.data.list.find(a => a.isDefault);
            if (!selectedAddressID && defaultAddress) {
                setSelectedAddressID(defaultAddress._id);
                localStorage.setItem("selectedAddressID", defaultAddress._id);
            }
        }
        return res.data;
    } catch (error) {
        console.error("Fetch addresses error:", error);
        return { success: false, list: [] };
    }
};

const addAddress = async (formData) => {
    try {
        const res = await API.post("/address", formData);
        if (res.data.success) {
            await fetchAddresses();
            if (formData.isDefault) {
              setSelectedAddressID(res.data.address._id);
              localStorage.setItem("selectedAddressID", res.data.address._id);
            }
        }
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Failed to add address" };
    }
};

const updateAddress = async (id, formData) => {
    try {
        const res = await API.put(`/address/${id}`, formData);
        if (res.data.success) {
            await fetchAddresses();
        }
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Failed to update address" };
    }
};

const deleteAddress = async (id) => {
    try {
        const res = await API.delete(`/address/${id}`);
        if (res.data.success) {
            await fetchAddresses();
            if (selectedAddressID === id) {
                setSelectedAddressID(null);
                localStorage.removeItem("selectedAddressID");
            }
        }
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Failed to delete address" };
    }
};


const value = {
    trendTypeData, truncateText, dealOfTheDay, newProducts, 
    currency, setCurrency, convertPrice, setIsShow, isShow,
    filteredData, setFilteredData, baseCategoryData, setBaseCategoryData,
    products, setProducts, fetchProducts,
    open, setOpen, user, login, register, getProfile, loading, updateProfile,setUser,
    forgotPassword, getAllUsers, authLoading, blockUser, applySeller, getAllSellers, approveSeller,
    // Active Deals & Mega Deal
    activeDeals, activeMegaDeal, fetchActiveMegaDeal,
    // Seller functions
    getSellerDashboard, getSellerAnalytics, addProduct, updateProduct, deleteProduct, 
    getAllProducts, getSingleProduct, getSellerProducts, getSellerOrders, updateOrderStatus,
    getSellerProfile, updateSellerProfile, toggleProductStatus, getUniqueCategories, getUniqueSubCategories,
    // Browse & Review
    addReview, trackActivity, getMyActivity,
    // Admin functions
    getAdminStats, getMonthlyRevenue, getTopProducts, getRecentOrders, getTodayStats,
    getAllOrders, deleteUser, getAdminProducts,
    
    // Advanced Tracking
    getInvoice: async (orderId) => {
       try {
         // Direct download link logic usually, but here we might need blob if headers are set
         // Easier: return URL
         return { success: true, url: `${import.meta.env.VITE_BACKEND_URL}/order/invoice/${orderId}` };
       } catch (e) { return { success: false }; }
    },
    sendDeliveryOTP: async (orderId) => {
        try {
            const res = await API.post(`/order/delivery/otp/${orderId}`);
            return res.data;
        } catch (e) { return { success: false, message: e.response?.data?.message }; }
    },
    verifyDeliveryOrder: async (orderId, otp) => {
         try {
            const res = await API.post(`/order/delivery/verify/${orderId}`, { otp });
            return res.data;
        } catch (e) { return { success: false, message: e.response?.data?.message }; }
    },
    
    // Cart & Order
    cart, getCart, addToCart, removeFromCart, updateCartQuantity, placeOrder, applyCoupon, getMyOrders,

    bestSeller,
    activeDeals, fetchActiveDeals,

    // Wishlist functions
    wishlist,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist: async () => {
      try {
        await API.delete("/wishlist");
        setWishlist({ items: [] });
        return { success: true };
      } catch (error) {
        return { success: false };
      }
    },
    
    // Deal functions
    createDeal: async (data) => {
      try {
        const res = await API.post("/deal/create", data);
        return res.data;
      } catch (error) {
        return error.response?.data || { success: false, message: "Failed" };
      }
    },
    getAllDeals: async () => {
      try {
        const res = await API.get("/deal/admin/all");
        return res.data;
      } catch (error) {
        return error.response?.data;
      }
    },
    deleteDeal: async (id) => {
      try {
        const res = await API.delete(`/deal/${id}`);
        return res.data;
      } catch (error) {
        return error.response?.data;
      }
    },
    
    // Mega Deal functions
    createMegaDeal: async (data) => {
      try {
        const res = await API.post("/megadeal/create", data);
        return res.data;
      } catch (error) {
        return error.response?.data || { success: false, message: "Failed" };
      }
    },
    getAllMegaDeals: async () => {
      try {
        const res = await API.get("/megadeal/admin/all");
        return res.data;
      } catch (error) {
        return error.response?.data;
      }
    },
    toggleMegaDealStatus: async (id) => {
      try {
        const res = await API.put(`/megadeal/${id}/toggle`);
        return res.data;
      } catch (error) {
        return error.response?.data;
      }
    },
    deleteMegaDeal: async (id) => {
      try {
        const res = await API.delete(`/megadeal/${id}`);
        return res.data;
      } catch (error) {
        return error.response?.data;
      }
    },
    
    // Coupon functions
    createCoupon: async (data) => {
      try {
        const res = await API.post("/coupon/create", data);
        return res.data;
      } catch (error) {
        return error.response?.data || { success: false, message: "Failed" };
      }
    },
    getAllCoupons: async () => {
      try {
        const res = await API.get("/coupon/admin/all");
        return res.data;
      } catch (error) {
        return error.response?.data;
      }
    },
    deleteCoupon: async (id) => {
      try {
        const res = await API.delete(`/coupon/${id}`);
        return res.data;
      } catch (error) {
        return error.response?.data;
      }
    },
    
    // Address export
    addresses, selectedAddressID, setSelectedAddressID, fetchAddresses, addAddress, updateAddress, deleteAddress
}
    
    
    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}