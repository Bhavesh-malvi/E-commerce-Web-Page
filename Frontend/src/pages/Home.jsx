import React from 'react'
import HomeBanner from '../components/Home/Homebanner'
import HomeCategory from '../components/Home/HomeCategory'
import CategoryProduct from '../components/Home/CategoryProduct'
import OurService from '../components/Home/OurService'
import Collaboration from '../components/Home/Collaboration'

const Home = () => {
    return (
        <>
            <HomeBanner/>
            <HomeCategory />
            <div className="min-h-screen">
                <CategoryProduct />
            </div>
            <OurService />
            <Collaboration />
        </>
    )
}

export default Home