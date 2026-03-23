'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../data/products';
import Link from 'next/link';

export default function CartDrawer() {
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    itemCount 
  } = useCart();

  return (
    <>
    
      <div 
        className={`cart-backdrop ${isCartOpen ? 'open' : ''}`} 
        onClick={closeCart}
      />
      
     
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2 className="cart-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="cart-title-icon">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Your Cart
            {itemCount > 0 && <span className="cart-count">({itemCount})</span>}
          </h2>
          <button className="close-btn" onClick={closeCart} aria-label="Close cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="empty-icon">🛒</span>
            <p>Your cart is empty</p>
            <button className="continue-shopping-btn" onClick={closeCart}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <span>{item.image}</span>
                  </div>
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <p className="cart-item-price">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span className="summary-value">{formatCurrency(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery</span>
                  <span className="summary-value muted">Calculated at checkout</span>
                </div>
              </div>
              
              <Link href="/checkout" className="checkout-btn" onClick={closeCart}>
                Proceed to Checkout
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}

