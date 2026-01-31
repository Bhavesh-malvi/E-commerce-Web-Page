import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { useToast } from '../components/common/Toast';
import API from '../api/Api';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const toast = useToast();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    if (!orderId) {
        navigate('/orders');
        return;
    }

    if (success === 'true' && sessionId) {
      try {
        const res = await API.post('/payment/verify', {
          orderId,
          sessionId
        });

        if (res.data.success) {
          toast.success("Payment Successful! Order Confirmed.");
          navigate('/orders');
        } else {
          toast.error("Payment verification failed.");
          navigate('/orders');
        }
      } catch (error) {
        console.error(error);
        toast.error("Payment verification failed.");
        navigate('/orders');
      }
    } else {
        toast.error("Payment cancelled or failed.");
        navigate('/orders');
    }
    setVerifying(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Verifying Payment...</h2>
        <p className="text-gray-500 mt-2">Please do not close this window.</p>
      </div>
    </div>
  );
};

export default Verify;
