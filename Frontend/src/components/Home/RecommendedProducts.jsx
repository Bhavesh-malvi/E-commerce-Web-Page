import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Products from '../Products';

const RecommendedProducts = () => {
  const { products, user, convertPrice, currency } = useContext(AppContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateRecommendations = () => {
        if (!products || products.length === 0) return;

        // 1. Get Browsing History from LocalStorage
        const historyIds = JSON.parse(localStorage.getItem("browsingHistory") || "[]");
        
        let recommended = [];

        if (historyIds.length > 0) {
            // Logic: Find categories/subcategories of viewed items
            const viewedProducts = historyIds
                .map(id => products.find(p => p._id === id))
                .filter(p => p !== undefined);

            const viewedCategories = [...new Set(viewedProducts.map(p => p.category))];
            const viewedSubCategories = [...new Set(viewedProducts.map(p => p.subCategory).filter(Boolean))];

            // Filter similar products
            recommended = products.filter(p => {
                // Exclude already viewed
                if (historyIds.includes(p._id)) return false;

                // Match SubCategory (High priority) or Category (Medium priority)
                const matchesSub = p.subCategory && viewedSubCategories.includes(p.subCategory);
                const matchesCat = viewedCategories.includes(p.category);

                return matchesSub || matchesCat;
            });

            // Sort: Prioritize SubCategory match, then High Rating/Sales
            recommended.sort((a, b) => {
                const aSub = a.subCategory && viewedSubCategories.includes(a.subCategory) ? 1 : 0;
                const bSub = b.subCategory && viewedSubCategories.includes(b.subCategory) ? 1 : 0;
                if (aSub !== bSub) return bSub - aSub;
                
                return (b.sold || 0) - (a.sold || 0); // Then Sales
            });

        } else {
             // Fallback: Show Trending or Best Sellers if no history
             recommended = products.filter(p => (p.sold || 0) > 0 || (p.ratings || 0) >= 4)
                           .sort((a,b) => (b.sold || 0) - (a.sold || 0));
        }

        // Limit to 8 items
        setRecommendations(recommended.slice(0, 8));
        setLoading(false);
    };

    generateRecommendations();

  }, [products]);

  if (loading) return null;
  if (recommendations.length === 0) return null;

  return (
    <div className='w-full'>
      <h1 className="text-lg sm:text-xl md:text-[20px] font-semibold text-[#333232] border-b pb-2 border-gray-200">
        {user ? "Recommended For You" : "You Might Also Like"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4 sm:mt-5 gap-4 sm:gap-6 md:gap-8">
        {recommendations.map((product) => (
          <Products key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
