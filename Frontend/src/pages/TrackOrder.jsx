import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaTruck, FaCheck, FaBox, FaMapMarkerAlt, FaSearch, FaMapMarkedAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import API from '../api/Api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const TrackOrder = () => {
    const [searchParams] = useSearchParams();
    const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [address, setAddress] = useState('');

    useEffect(() => {
        if(orderData?.location?.lat && orderData?.location?.lng) {
            fetchAddress(orderData.location.lat, orderData.location.lng);
        }
    }, [orderData]);

    const fetchAddress = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            setAddress(data.display_name);
        } catch (error) {
            console.error("Geocoding failed", error);
            setAddress('Address info unavailable');
        }
    };

    const handleTrack = async (e) => {
        e?.preventDefault();
        if(!trackingId) return;
        
        setLoading(true);
        setError('');
        setOrderData(null);
        setAddress('');

        try {
            const res = await API.get(`/order/track/${trackingId}`);
            if(res.data.success) {
                setOrderData(res.data.order);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Order not found');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { label: 'Processing', icon: <FaBox />, status: 'processing' },
        { label: 'Shipped', icon: <FaTruck />, status: 'shipped' },
        { label: 'Out for Delivery', icon: <FaMapMarkerAlt />, status: 'out for delivery' },
        { label: 'Delivered', icon: <FaCheck />, status: 'delivered' }
    ];

    const getStepIndex = (status) => {
        if(!status) return 0;
        const s = status.toLowerCase();
        if(s === 'processing' || s === 'packed' || s === 'pending') return 0;
        if(s === 'shipped') return 1;
        if(s === 'out for delivery') return 2;
        if(s === 'delivered') return 3;
        return 0;
    };

    const currentStepIndex = orderData ? getStepIndex(orderData.status) : -1;

    // Custom Truck Icon for Map
    const TruckIcon = new L.DivIcon({
        className: 'custom-icon',
        html: `<div style="background-color: #FF8F9C; width: 30px; height: 30px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(168,85,247,0.3);">
                <svg stroke="currentColor" fill="white" stroke-width="0" viewBox="0 0 640 512" height="15px" width="15px" xmlns="http://www.w3.org/2000/svg"><path d="M624 352h-16V243.9c0-12.7-5.1-24.9-14.1-33.9L494 110.1c-9-9-21.2-14.1-33.9-14.1H416V48c0-26.5-21.5-48-48-48H112C85.5 0 64 21.5 64 48v48H8c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h272c4.4 0 8 3.6 8 8v16c0 4.4-3.6 8-8 8H40c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h208c4.4 0 8 3.6 8 8v16c0 4.4-3.6 8-8 8H8c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h208c4.4 0 8 3.6 8 8v16c0 4.4-3.6 8-8 8H64v128c0 53 43 96 96 96s96-43 96-96h128c0 53 43 96 96 96s96-43 96-96h48c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zM160 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm320 0c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm80-208H416V144h44.1l99.9 100v12z"></path></svg>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif">Track Your Order</h1>
                        <p className="text-gray-500 mt-1">Check the delivery status of your package</p>
                    </div>

                    <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 sm:min-w-[320px]">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                                placeholder="Enter Tracking ID"
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF8F9C] outline-none shadow-sm transition-all"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-[#FF8F9C] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#ff7a8a] transition shadow-lg shadow-[#FF8F9C]/20 disabled:opacity-70 whitespace-nowrap"
                        >
                            {loading ? 'Searching...' : 'Track Package'}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                {orderData ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Vertical Progress Tracker */}
                        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-8 border-b pb-4">Order Status</h2>
                            <div className="relative">
                                {/* Vertical line background */}
                                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-100 rounded-full"></div>
                                {/* Filled vertical line */}
                                <div 
                                    className="absolute left-6 top-0 w-1 bg-gradient-to-b from-[#FF8F9C] to-[#ff7a8a] rounded-full transition-all duration-1000"
                                    style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                                ></div>

                                <div className="space-y-23.5">
                                    {steps.map((step, idx) => {
                                        const isCompleted = idx <= currentStepIndex;
                                        return (
                                            <div key={idx} className="relative flex items-center gap-6 group">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-300 ${
                                                    isCompleted ? 'bg-[#FF8F9C] border-[#FF8F9C]/20 text-white shadow-md' : 'bg-white border-gray-100 text-gray-300'
                                                }`}>
                                                    {step.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-bold transition-all duration-300 ${isCompleted ? 'text-[#FF8F9C]' : 'text-gray-400'}`}>
                                                        {step.label}
                                                    </h3>
                                                    {isCompleted && idx === currentStepIndex && (
                                                        <span className="text-xs text-[#FF8F9C] font-medium bg-[#FF8F9C]/10 px-2 py-0.5 rounded-full animate-pulse">
                                                            Current Status
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Map and Details */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Live Map */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-red-500" /> Live Location
                                        </h3>
                                        {orderData.location?.updatedAt && (
                                            <span className="text-xs text-gray-500 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                                                Last Updated: {new Date(orderData.location.updatedAt).toLocaleTimeString()}
                                            </span>
                                        )}
                                    </div>
                                    {address && (
                                        <div className="mt-4 flex gap-2">
                                            <p className="text-sm text-gray-600 break-words leading-relaxed">
                                                <span className="font-semibold text-gray-700">Location: </span> {address}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="relative h-[400px] sm:h-[500px] bg-gray-100 w-full z-0">
                                    {orderData.location?.lat && orderData.location?.lng ? (
                                        <MapContainer 
                                            center={[orderData.location.lat, orderData.location.lng]} 
                                            zoom={13} 
                                            scrollWheelZoom={false}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker 
                                                position={[orderData.location.lat, orderData.location.lng]}
                                                icon={TruckIcon}
                                            >
                                                <Popup className="font-bold">
                                                    Package is here!
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                                            <div className="bg-gray-200 p-6 rounded-full mb-6">
                                                <FaMapMarkedAlt className="text-5xl opacity-40 shadow-inner" />
                                            </div>
                                            <h4 className="text-lg font-semibold mb-2">GPS Tracking Unavailable</h4>
                                            <p className="max-w-xs mx-auto">Package is currently in transit or tracking has not been enabled for this carrier yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    !loading && (
                        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                             <div className="bg-[#FF8F9C]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaSearch className="text-3xl text-[#FF8F9C]" />
                             </div>
                             <h3 className="text-xl font-bold text-gray-800 mb-2">Want to track your package?</h3>
                             <p className="text-gray-500 max-w-sm mx-auto">Enter your tracking number above to see the real-time status of your order.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
