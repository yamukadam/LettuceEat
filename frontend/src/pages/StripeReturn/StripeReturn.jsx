// StripeReturn.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StripeReturn = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // You can perform any necessary actions here
    // For example, refresh the seller's connection status
    // Then redirect to the seller dashboard or another page
    navigate('/seller-dashboard');
  }, []);

  return (
    <div>
      <p>Redirecting...</p>
    </div>
  );
};

export default StripeReturn;
