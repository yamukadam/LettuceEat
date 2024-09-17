import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {assets} from '../../assets/assets';


const PlaceOrder = () => {
  const [payment, setPayment] = useState('cod');
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  });

  const {
    getTotalCartAmount,
    token,
    food_list,
    cartItems,
    url,
    setCartItems,
    currency,
    deliveryCharge,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  const stripe = useStripe();
  const elements = useElements();

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  // PlaceOrder.jsx

const placeOrder = async (e) => {
  e.preventDefault();

  let orderData = {
    address: data,
    // No need to send items, the backend will fetch from cartData
  };

  try {
    if (payment === 'stripe') {
      console.log('Placing order with Stripe:', orderData);
      let response = await axios.post(`${url}/api/order/placeOrder`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Response from /placeOrder:', response.data);

      if (response.data.success) {
        const { clientSecrets } = response.data;

        for (const clientSecret of clientSecrets) {
          const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                address: {
                  line1: data.street,
                  city: data.city,
                  state: data.state,
                  postal_code: data.zipcode,
                  country: data.country,
                },
              },
            },
          });

          if (result.error) {
            console.error('Stripe payment error:', result.error.message);
            toast.error(result.error.message);
            return;
          } else if (result.paymentIntent.status === 'succeeded') {
            console.log('Payment succeeded for one seller!');
          }
        }

        toast.success('Order placed successfully!');
        setCartItems({});
        navigate('/myorders');
      } else {
        console.error('Error from /placeOrder:', response.data.message);
        toast.error(response.data.message);
      }
    } else {
      console.log('Placing order with COD:', orderData);
      let response = await axios.post(`${url}/api/order/placeOrderCod`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Response from /placeOrderCod:', response.data);

      if (response.data.success) {
        toast.success(response.data.message);
        setCartItems({});
        navigate('/myorders');
      } else {
        console.error('Error from /placeOrderCod:', response.data.message);
        toast.error(response.data.message);
      }
    }
  } catch (error) {
    console.error('Error placing order:', error);
    const errorMessage = error.response?.data?.message || 'Something went wrong while placing the order.';
    toast.error(errorMessage);
  }
};

  

  useEffect(() => {
    if (!token) {
      toast.error('To place an order, please sign in first.');
      navigate('/cart');
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token]);

  return (
    <form onSubmit={placeOrder} className='place-order'>
      {/* ... existing form fields ... */}
      <div className='place-order-right'>
        <div className='cart-total'>
          {/* ... cart totals ... */}
        </div>
        <div className='payment'>
          <h2>Payment Method</h2>
          <div onClick={() => setPayment('cod')} className='payment-option'>
            <img src={payment === 'cod' ? assets.checked : assets.un_checked} alt='' />
            <p>COD ( Cash on delivery )</p>
          </div>
          <div onClick={() => setPayment('stripe')} className='payment-option'>
            <img src={payment === 'stripe' ? assets.checked : assets.un_checked} alt='' />
            <p>Stripe ( Credit / Debit )</p>
          </div>
          {payment === 'stripe' && (
            <div className='card-element'>
              <CardElement options={{ hidePostalCode: true }} />
            </div>
          )}
        </div>
        <button className='place-order-submit' type='submit'>
          {payment === 'cod' ? 'Place Order' : 'Proceed To Payment'}
        </button>
      </div>
    </form>
  );
};

export default PlaceOrder;

