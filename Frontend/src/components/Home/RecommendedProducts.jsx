import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Products from '../Products';

const RecommendedProducts = () => {
  const { getRecommendations, user } = useContext(AppContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReco = async () => {
      // Fetch regardless of user status (backend handles new vs existing users)
      const res = await getRecommendations();
      if (res && res.success) {
        setRecommendations(res.products || []);
      }
      setLoading(false);
    };

    fetchReco();
  }, [getRecommendations]);

  if (loading) return null; // Or a skeleton loader
  if (!recommendations || recommendations.length === 0) return null;

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
