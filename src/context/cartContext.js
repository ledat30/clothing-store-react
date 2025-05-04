import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from "axios";

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const storedCartItems = localStorage.getItem('cartItems');
        if (storedCartItems) {
            setCartItems(JSON.parse(storedCartItems));
        }
    }, []);

    const saveCartItemsToLocalStorage = (items) => {
        localStorage.setItem('cartItems', JSON.stringify(items));
    };

    const fetchCartItems = async (userId) => {
        
        try {
            let response = await axios.get(`http://localhost:3000/api/product/read-product-cart?userId=${userId}`);
            
            
            if (response.data && response.data.EC === 0) {
                setCartItems(response.data.DT);
                saveCartItemsToLocalStorage(response.data.DT);
            } else {
                setCartItems([]);
                saveCartItemsToLocalStorage([]);
            }
        } catch (error) {
            console.error("Error fetching cart items:", error);
            setCartItems([]);
            saveCartItemsToLocalStorage([]);
        }
    };
    const value = {
        cartItems,
        fetchCartItems,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};