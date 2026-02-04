import React from 'react';
import { assets } from '../../assets/assets';

const Preloader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
            {/* Logo Wrapper with Pulse Effect */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-[#FF8F9C] rounded-full blur-xl opacity-20 animate-pulse"></div>
                <img 
                    src={assets.logo} 
                    alt="Loading..." 
                    className="w-32 md:w-40 relative z-10 animate-bounce-slight" 
                    style={{ animationDuration: '2s' }}
                />
            </div>

            {/* Custom Spinner */}
            <div className="flex gap-2">
                <div className="w-3 h-3 bg-[#FF8F9C] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-[#FF8F9C] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-[#FF8F9C] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>

            {/* Optional Loading Text */}
            <p className="mt-4 text-[#787878] text-sm font-medium tracking-widest uppercase animate-pulse">
                Loading
            </p>
            
            <style jsx>{`
                @keyframes bounce-slight {
                    0%, 100% { transform: translateY(-5%); }
                    50% { transform: translateY(5%); }
                }
                .animate-bounce-slight {
                    animation: bounce-slight 2s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default Preloader;
