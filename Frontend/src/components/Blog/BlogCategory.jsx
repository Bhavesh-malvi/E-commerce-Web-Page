import React, { useState } from "react";
import { BlogCategory } from "../../assets/assets";
import BlogData from "./BlogData";

const BlogCategoryData = () => {

    const [filteredData, setFilteredData] = useState("All")


    return (
        <>
        <section className="py-16 md:py-20">
            <div className="px-4 ">
                <div className="text-center mb-12">
                    <h2 className="font-Cormorant text-3xl md:text-4xl font-semibold mb-4">
                        Latest From The Journal
                    </h2>
                    <p className="text-[#7c736a] max-w-2xl mx-auto">
                        Explore the latest trends, style guides, and insider tips from our fashion experts.
                    </p>
                </div>
                <div className="mb-12">
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                        <button className={`rounded-full border border-[#FF8F9C] category-pill ${filteredData === "All" ? "category-pill-active" : "category-pill-inactive"}`} onClick={()=> setFilteredData("All")}>All</button>
                        <button className={`rounded-full border border-[#FF8F9C] category-pill ${filteredData === "jewelry" ? "category-pill-active" : "category-pill-inactive"}`} onClick={()=> setFilteredData("jewelry")} >Jewelry</button>
                        <button className={`rounded-full border border-[#FF8F9C] category-pill ${filteredData === "women" ? "category-pill-active" : "category-pill-inactive"}`} onClick={()=> setFilteredData("women")}>Women</button>
                        <button className={`rounded-full border border-[#FF8F9C] category-pill ${filteredData === "men" ? "category-pill-active" : "category-pill-inactive"}`} onClick={()=> setFilteredData("men")}>Men</button>
                        <button className={`rounded-full border border-[#FF8F9C] category-pill ${filteredData === "shoes" ? "category-pill-active" : "category-pill-inactive"}`} onClick={()=> setFilteredData("shoes")}>Shoes</button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lh:gap-10">
                    {BlogCategory.filter((p)=> filteredData === "All"  || p.Category === filteredData).map((data)=>{
                        return(
                            <BlogData data={data} dataFlow={"second"} />
                        )
                    })}
                </div>
            </div>
        </section>
        </>
    );
};

export default BlogCategoryData;
