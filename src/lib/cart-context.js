'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth-context';
import { cartAPI } from '@/services/api';
import { normalizeCartItem, normalizeCartItems, oneFrom } from '@/lib/api-data';

const CartContext = createContext({});

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const response = await cartAPI.getCart();
      setItems(normalizeCartItems(response));
    } catch (_error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    if (!user) return { error: { message: 'Please sign in to add items to cart' } };
    const existing = items.find((i) => i.product_id === productId);
    try {
      const response = existing
        ? await cartAPI.updateItem(existing.id, { quantity: existing.quantity + quantity })
        : await cartAPI.addItem({ product_id: productId, productId, quantity });
      const data = normalizeCartItem(oneFrom(response, ['cart_item', 'cartItem', 'item']));
      if (data?.id) {
        setItems((prev) => {
          const found = prev.some((i) => i.id === data.id);
          return found ? prev.map((i) => (i.id === data.id ? data : i)) : [...prev, data];
        });
      } else {
        await fetchCart();
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) return removeItem(itemId);
    try {
      const response = await cartAPI.updateItem(itemId, { quantity });
      const data = normalizeCartItem(oneFrom(response, ['cart_item', 'cartItem', 'item']));
      if (data?.id) {
        setItems((prev) => prev.map((i) => (i.id === data.id ? data : i)));
      } else {
        setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error };
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartAPI.removeItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      return { error: null };
    } catch (error) {
      return { error: error.response?.data || error };
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await cartAPI.clearCart();
      setItems([]);
      return { error: null };
    } catch (error) {
      return { error: error.response?.data || error };
    }
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.products?.price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, addItem, updateQuantity, removeItem, clearCart, itemCount, subtotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
