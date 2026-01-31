import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import API from '../../Api/Api.js';

const DeliveryUpdate = () => {
    const { trackingId } = useParams();
    const [status, setStatus] = useState('idle'); // idle, locating, updating, success, error
    const [coords, setCoords] = useState(null);

    const handleUpdateLocation = () => {
        setStatus('locating');
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });
                
                try {
                    setStatus('updating');
                    await API.post('/order/location/update', {
                        trackingId,
                        lat: latitude,
                        lng: longitude
                    });
                    setStatus('success');
                } catch (error) {
                    console.error(error);
                    setStatus('error');
                }

            }, (error) => {
                console.error(error);
                setStatus('error');
                alert("Location permission denied");
            });
        } else {
            alert("Geolocation not supported");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl text-center">
                <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaMapMarkerAlt className="text-4xl animate-pulse" />
                </div>
                
                <h1 className="text-2xl font-bold mb-2">Delivery Partner App</h1>
                <p className="text-gray-400 mb-8">Update location for Tracking ID: <br/><span className="text-white font-mono bg-gray-700 px-2 py-1 rounded mt-2 inline-block">{trackingId}</span></p>

                {status === 'idle' && (
                    <button 
                        onClick={handleUpdateLocation}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/30"
                    >
                        UPDATE LOCATION
                    </button>
                )}

                {status === 'locating' && <p className="text-yellow-400 animate-pulse">Acquiring GPS...</p>}
                {status === 'updating' && <p className="text-blue-400 animate-pulse">Syncing with Server...</p>}
                
                {status === 'success' && (
                    <div className="text-green-400">
                        <FaCheckCircle className="text-5xl mx-auto mb-4" />
                        <p className="text-lg font-bold">Location Updated!</p>
                        <p className="text-sm text-gray-500 mt-2">Lat: {coords?.lat?.toFixed(4)}, Lng: {coords?.lng?.toFixed(4)}</p>
                    </div>
                )}
                
                {status === 'error' && <p className="text-red-400">Failed to update location. Try again.</p>}
            </div>
        </div>
    );
};

export default DeliveryUpdate;
