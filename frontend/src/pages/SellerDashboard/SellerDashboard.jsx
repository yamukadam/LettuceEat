// SellerDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext'

const SellerDashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();
  const {token} = useContext(StoreContext);
  const url = 'http://localhost:4000'; // Your backend URL

  useEffect(() => {
    const checkStripeConnection = async () => {
      try {
        console.log('Token:', token); // Add this line to log the token
        const response = await axios.get(`${url}/api/stripe/connection-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsConnected(response.data.isConnected);
      } catch (error) {
        console.error('Error checking Stripe connection:', error);
      }
    };
  
    checkStripeConnection();
  }, []);

  const handleConnectStripe = async () => {
    try {
      const response = await axios.get(`${url}/api/stripe/connect`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { url: stripeUrl } = response.data;
      window.location.href = stripeUrl; // Redirect to Stripe onboarding
    } catch (error) {
      console.error('Error connecting to Stripe:', error);
    }
  };

  return (
    <div>
      <h1>Seller Dashboard</h1>
      {isConnected ? (
        <p>Your account is connected to Stripe.</p>
      ) : (
        <button onClick={handleConnectStripe}>Connect with Stripe</button>
      )}
    </div>
  );
};

export default SellerDashboard;
