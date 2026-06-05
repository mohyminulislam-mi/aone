'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth-context';

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
    const { data } = await supabase
      .from('cart_items')
      .select('id, quantity, product_id, products(*)')
      .eq('user_id', user.id);
    setItems(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    if (!user) return { error: { message: 'Please sign in to add items to cart' } };
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select('id, quantity, product_id, products(*)')
        .maybeSingle();
      if (!error && data) {
        setItems((prev) => prev.map((i) => (i.id === data.id ? data : i)));
      }
      return { data, error };
    }
    const { data, error } = await supabase
      .from('cart_items')
      .insert({ product_id: productId, quantity, user_id: user.id })
      .select('id, quantity, product_id, products(*)')
      .maybeSingle();
    if (!error && data) {
      setItems((prev) => [...prev, data]);
    }
    return { data, error };
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) return removeItem(itemId);
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select('id, quantity, product_id, products(*)')
      .maybeSingle();
    if (!error && data) {
      setItems((prev) => prev.map((i) => (i.id === data.id ? data : i)));
    }
    return { data, error };
  };

  const removeItem = async (itemId) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
    return { error };
  };

  const clearCart = async () => {
    if (!user) return;
    const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
    if (!error) setItems([]);
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
