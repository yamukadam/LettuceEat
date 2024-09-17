// Sell.jsx

import React, { useContext, useEffect, useState } from 'react';
import './Sell.css';
import { assets } from '../../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/add' className="sidebar-option">
          <img src={assets.add_icon} alt="Add Items" />
          <p>Add Items</p>
        </NavLink>
        <NavLink to='/list' className="sidebar-option">
          <img src={assets.order_icon} alt="List Items" />
          <p>List Items</p>
        </NavLink>
        <NavLink to='/orders' className="sidebar-option">
          <img src={assets.order_icon} alt="Orders" />
          <p>Orders</p>
        </NavLink>
      </div>
    </div>
  );
};

const Sell = () => {
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();
  const { token } = useContext(StoreContext);
  const url = 'http://localhost:4000'; // Your backend URL
  console.log('token' , token)

  useEffect(() => {
    if (!token) return; // Prevent executing if token is not available

    const checkStripeConnection = async () => {
      try {
        console.log('Token:', token); // Log the token
        const response = await axios.get(`${url}/api/stripe/connection-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response);
        setIsConnected(response.data.isConnected);
      } catch (error) {
        console.error('Error checking Stripe connection:', error);
      }
    };

    checkStripeConnection();
  }, [token, url]); // Add 'token' and 'url' to dependency array

  const handleConnectStripe = async () => {
    try {
      console.log('Token:', token); // Log the token
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
      <h1>SELLER DASHBOARD</h1>
      {!token ? (
        <div>Please log in to access the Seller Dashboard.</div>
      ) : isConnected ? (
        <div>
          <p>Your account is connected to Stripe.</p>
          <Sidebar />
        </div>
      ) : (
        <button onClick={handleConnectStripe}>Connect with Stripe</button>
      )}
    </div>
  );
};

export default Sell;
