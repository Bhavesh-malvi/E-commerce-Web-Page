
import React from 'react';
import { useParams } from 'react-router-dom';
import UpdatePassword from '../components/UserDashboard/UpdatePassword';

const ResetPassword = () => {
  const { token } = useParams();

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <UpdatePassword token={token} />
      </div>
    </div>
  );
};

export default ResetPassword;
