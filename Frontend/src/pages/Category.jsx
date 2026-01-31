import React, { useEffect, useContext } from "react";
import { assets } from "../assets/assets";
import FilteredBar from "../components/Category/FilteredBar";
import Products from "../components/Products";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const normalize = (value = "") =>
  value.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "");

const Category = () => {
  const { gender, category } = useParams();
  const { setBaseCategoryData, filteredData, products } = useContext(AppContext);

  useEffect(() => {
    if (!products || products.length === 0) return;

    // 🗺️ Gender Mapping Table
    const genderMap = {
      male: "men",
      female: "women",
      men: "men",
      women: "women"
    };
    
    const routeCategory = normalize(category);
    
    // 🔍 Intelligence: If gender param looks like a category, swap them
    let finalGender = gender;
    let finalCategory = category;

    // List of known genders to distinguish from categories
    const knownGenders = ["male", "female", "men", "women"];
    
    if (gender && !knownGenders.includes(gender.toLowerCase())) {
        // If 'gender' param is NOT a known gender, it might be the category (due to route matching)
        finalCategory = gender;
        finalGender = null;
    }

    const targetGender = finalGender ? finalGender.toLowerCase() : null;
    const finalNormalizedCategory = normalize(finalCategory);

    const baseData = products.filter((p) => {
      const productCategory = normalize(p.category || "");
      const productSubCategory = normalize(p.subCategory || "");
      const pGender = (p.gender || p.genderType || "").toLowerCase();

      // 🔹 Category matching
      const isCategoryMatch =
        !finalCategory || 
        productCategory.includes(finalNormalizedCategory) ||
        productSubCategory.includes(finalNormalizedCategory) ||
        finalNormalizedCategory.includes(productCategory) ||
        finalNormalizedCategory.includes(productSubCategory);

      if (!isCategoryMatch) return false;

      // 🔹 Gender matching (Flexible)
      if (targetGender) {
        const isMaleTarget = targetGender === "male" || targetGender === "men" || targetGender === "male's";
        const isFemaleTarget = targetGender === "female" || targetGender === "women" || targetGender === "women's";
        
        const isProductMale = pGender === "male" || pGender === "men" || pGender === "male's";
        const isProductFemale = pGender === "female" || pGender === "women" || pGender === "women's";

        if (isMaleTarget && !isProductMale) return false;
        if (isFemaleTarget && !isProductFemale) return false;
        
        // If it's a specific gender target but product doesn't match either (e.g. unisex or other), 
        // fallback to direct include check for unconventional values
        if (!isMaleTarget && !isFemaleTarget) {
            if (!pGender.includes(targetGender) && !targetGender.includes(pGender)) return false;
        }
      }

      return true;
    });

    setBaseCategoryData(baseData);
  }, [gender, category, products, setBaseCategoryData]);

    return (
        <>
        <div
            className="rounded-[10px] sm:rounded-[15px] bg-no-repeat bg-cover bg-bottom h-60 sm:h-80 md:h-119 mx-3 sm:mx-0"
            style={{ backgroundImage: `url(${assets.bannerImg})` }}
        />

        <div className="mt-6 sm:mt-8 md:mt-10 px-3 sm:px-0">
            {/* Filter bar - horizontal on mobile, vertical sidebar on desktop */}
            <div className="lg:hidden mb-6">
                <FilteredBar isMobile={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                {/* Desktop sidebar */}
                <div className="hidden lg:block lg:sticky lg:top-0 lg:self-start">
                    <FilteredBar isMobile={false} />
                </div>

                {/* Products grid */}
                <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 py-4 sm:py-6 md:py-8">
                {filteredData.length === 0 ? (
                    <p className="col-span-full text-center text-sm sm:text-base text-gray-500 py-10">
                    No Products Found
                    </p>
                ) : (
                    filteredData.map((product) => (
                    <Products key={product._id} product={product} />
                    ))
                )}
                </div>
            </div>
        </div>
        </>
    );
};

export default Category;
