'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import type { Product, CartItem, DeliveryOption, DeliveryAddress, Order } from '../types';

interface CartContextType {
  items: CartItem[];
  deliveryOption: DeliveryOption | null;
  deliveryAddress: DeliveryAddress | null;
  isCartOpen: boolean;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currentOrder: Order | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryOption: (option: DeliveryOption) => void;
  setDeliveryAddress: (address: DeliveryAddress) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  createOrder: () => Order;
  setCurrentOrder: (order: Order | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryOption, setDeliveryOptionState] = useState<DeliveryOption | null>(null);
  const [deliveryAddress, setDeliveryAddressState] = useState<DeliveryAddress | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const deliveryFee = deliveryOption?.price || 0;
  const total = subtotal + deliveryFee;

  const addToCart = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    setDeliveryOptionState(null);
    setDeliveryAddressState(null);
  }, []);

  const setDeliveryOption = useCallback((option: DeliveryOption) => {
    setDeliveryOptionState(option);
  }, []);

  const setDeliveryAddress = useCallback((address: DeliveryAddress) => {
    setDeliveryAddressState(address);
  }, []);

  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const createOrder = useCallback((): Order => {
    const order: Order = {
      id: 'ORD_' + Date.now(),
      items: [...items],
      deliveryOption: deliveryOption!,
      deliveryAddress: deliveryAddress || undefined,
      subtotal,
      deliveryFee,
      total,
      status: 'pending',
      createdAt: new Date(),
    };
    setCurrentOrder(order);
    return order;
  }, [items, deliveryOption, deliveryAddress, subtotal, deliveryFee, total]);

  return (
    <CartContext.Provider
      value={{
        items,
        deliveryOption,
        deliveryAddress,
        isCartOpen,
        itemCount,
        subtotal,
        deliveryFee,
        total,
        currentOrder,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setDeliveryOption,
        setDeliveryAddress,
        toggleCart,
        openCart,
        closeCart,
        createOrder,
        setCurrentOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

