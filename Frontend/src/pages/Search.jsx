import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../Api/Api";
import Products from "../components/Products";
import { assets } from "../assets/assets";

const Search = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!keyword) return;
      
      try {
        setLoading(true);
        // Call backend search API
        const { data } = await API.get(`/product?keyword=${encodeURIComponent(keyword)}`);
        
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword]);

  return (
    <div className="min-h-screen">
      {/* Banner (Optional) */}
      <div
        className="rounded-[10px] sm:rounded-[15px] bg-no-repeat bg-cover bg-bottom h-40 sm:h-60 mx-3 sm:mx-0 relative mb-8"
        style={{ backgroundImage: `url(${assets.bannerImg})` }}
      >
         <div className="absolute inset-0 bg-black/30 rounded-[10px] sm:rounded-[15px] flex items-center justify-center">
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-wide">
               Results for "{keyword}"
            </h1>
         </div>
      </div>

      <div className="px-4 sm:px-8 md:px-16 lg:px-25 py-8">
        {loading ? (
           <div className="flex justify-center items-center h-60">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8F9C]"></div>
           </div>
        ) : (
          <>
             <p className="text-gray-500 mb-6">Found {products.length} results</p>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
               {products.length > 0 ? (
                 products.map((product) => (
                   <Products key={product._id} product={product} />
                 ))
               ) : (
                 <div className="col-span-full text-center py-20 text-gray-500 text-lg">
                   No products found for "{keyword}"
                 </div>
               )}
             </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
