import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('fc_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('fc_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (produce, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.produceId === produce._id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            produceId: produce._id,
            name: produce.name,
            unit: produce.unit,
            pricePerUnit: produce.pricePerUnit,
            farmerEarning: produce.farmerEarning,
            platformFee: produce.platformFee,
            deliveryCost: produce.deliveryCost,
            farmer: produce.farmer,
            quantity: quantity,
          },
        ];
      }
    });
  };

  const removeFromCart = (produceId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.produceId !== produceId));
  };

  const updateQuantity = (produceId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(produceId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.produceId === produceId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('fc_cart');
  };

  // Compute Cart Summary Totals with price breakdown
  const cartTotals = cartItems.reduce(
    (acc, item) => {
      const qty = item.quantity;
      acc.totalQuantity += qty;
      acc.subtotal += item.pricePerUnit * qty;
      acc.farmerEarningTotal += (item.farmerEarning || item.pricePerUnit * 0.75) * qty;
      acc.platformFeeTotal += (item.platformFee || item.pricePerUnit * 0.1) * qty;
      acc.deliveryCostTotal += (item.deliveryCost || item.pricePerUnit * 0.15) * qty;
      return acc;
    },
    {
      totalQuantity: 0,
      subtotal: 0,
      farmerEarningTotal: 0,
      platformFeeTotal: 0,
      deliveryCostTotal: 0,
    }
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotals,
        cartCount: cartTotals.totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
