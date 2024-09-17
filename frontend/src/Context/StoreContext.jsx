import { createContext, useEffect, useState } from "react";
import { food_list, menu_list } from "../assets/assets";
import axios from "axios";
export const StoreContext = createContext(null);

import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe('pk_test_51PuShVRwGMPa80C8wWlpFqLKnFJdsmev986nfZfINm4EmG6MfFS8yBsNLsTK1sfcRZ8hex1C0T6pLgD1iRWCU1nk00Ex9WD1YR');

const StoreContextProvider = (props) => {


    const url = "http://localhost:4000"
    const [food_list, setFoodList] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("")
    const currency = "$";
    const deliveryCharge = 5;

    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        }
        else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, {headers: {'Authorization': `Bearer ${token}`}});
        }
    }

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, {headers: {'Authorization': `Bearer ${token}`}});
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            try {
              if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                totalAmount += itemInfo.price * cartItems[item];
            }  
            } catch (error) {
                
            }
            
        }
        return totalAmount;
    }

    const [loading, setLoading] = useState(true);

    const fetchFoodList = async () => {
    setLoading(true);
    try {
        const response = await axios.get(url + "/api/food/list");
        setFoodList(response.data.data);
    } finally {
        setLoading(false);
    }
};


    const loadCartData = async (token) => {
        const response = await axios.post(url + "/api/cart/get", {}, {headers: {'Authorization': `Bearer ${token}`}});
        setCartItems(response.data.cartData);
    }

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                setToken(storedToken);
                await loadCartData(storedToken);  // Pass the token string directly
            }
        }
        loadData();
    }, []);

    const contextValue = {
        url,
        food_list,
        setFoodList,
        loading,
        menu_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        token,
        setToken,
        loadCartData,
        setCartItems,
        currency,
        deliveryCharge
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )

}

export default StoreContextProvider;