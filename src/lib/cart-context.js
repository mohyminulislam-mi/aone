"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { normalizeProduct } from "@/lib/api-data";

const CART_STORAGE_KEY = "cart";
const CartContext = createContext(null);

function safeParseCart() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.map(normalizeStoredItem).filter(Boolean)
      : [];
  } catch (_error) {
    return [];
  }
}

function normalizeStoredItem(item) {
  if (!item) return null;

  const product = normalizeProduct(item.products ?? item.product ?? item);
  const id = item.id ?? item.product_id ?? item.productId ?? product?.id;
  const productId = item.product_id ?? item.productId ?? product?.id ?? id;

  if (!productId) return null;

  return {
    id: String(productId),
    product_id: productId,
    quantity: Math.max(1, Number(item.quantity ?? 1)),
    products: {
      ...product,
      id: productId,
      price: Number(product?.price ?? item.price ?? 0),
      image_url: product?.image_url ?? item.image,
      categories: product?.categories ?? item.categories ?? item.category ?? null,
    },
  };
}

function emitCartChanged(items) {
  window.dispatchEvent(new CustomEvent("cart:changed", { detail: items }));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(safeParseCart());
    setIsReady(true);

    function handleStorage(event) {
      if (event.key === CART_STORAGE_KEY) setItems(safeParseCart());
    }

    function handleCartChanged(event) {
      setItems(Array.isArray(event.detail) ? event.detail : safeParseCart());
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("cart:changed", handleCartChanged);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cart:changed", handleCartChanged);
    };
  }, []);

  function saveCart(nextItems) {
    const normalized = nextItems.map(normalizeStoredItem).filter(Boolean);
    setItems(normalized);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
    emitCartChanged(normalized);
  }

  function addItem(product, quantity = 1) {
    const cartProduct = normalizeProduct(product);
    if (!cartProduct?.id) return;

    const addQuantity = Math.max(1, Number(quantity || 1));
    const currentItems = safeParseCart();
    const existing = currentItems.find((item) => item.product_id === cartProduct.id);

    if (existing) {
      saveCart(
        currentItems.map((item) =>
          item.product_id === cartProduct.id
            ? { ...item, quantity: item.quantity + addQuantity }
            : item,
        ),
      );
      return;
    }

    saveCart([
      ...currentItems,
      normalizeStoredItem({
        id: cartProduct.id,
        product_id: cartProduct.id,
        quantity: addQuantity,
        products: cartProduct,
      }),
    ]);
  }

  function updateQuantity(id, quantity) {
    const nextQuantity = Number(quantity);

    if (nextQuantity <= 0) {
      removeItem(id);
      return;
    }

    saveCart(
      safeParseCart().map((item) =>
        String(item.id) === String(id) || String(item.product_id) === String(id)
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    );
  }

  function removeItem(id) {
    saveCart(
      safeParseCart().filter(
        (item) => String(item.id) !== String(id) && String(item.product_id) !== String(id),
      ),
    );
  }

  function clearCart() {
    saveCart([]);
  }

  const value = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.products?.price ?? 0) * item.quantity,
      0,
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      isReady,
      subtotal,
      itemCount,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [items, isReady]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
