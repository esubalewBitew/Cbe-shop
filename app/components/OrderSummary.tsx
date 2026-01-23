'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../data/products';

export default function OrderSummary() {
  const { items, subtotal, deliveryFee, deliveryOption, total } = useCart();

  return (
    <div className="order-summary">
      <h3 className="summary-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="summary-icon">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        Order Summary
      </h3>
      
      <div className="summary-items">
        {items.map(item => (
          <div key={item.id} className="summary-item">
            <div className="item-info">
              <span className="item-emoji">{item.image}</span>
              <div className="item-details">
                <span className="item-name">{item.name}</span>
                <span className="item-qty">Qty: {item.quantity}</span>
              </div>
            </div>
            <span className="item-total">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      
      <div className="summary-divider" />
      
      <div className="summary-calculations">
        <div className="calc-row">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="calc-row">
          <span>Delivery {deliveryOption && `(${deliveryOption.name})`}</span>
          <span className={deliveryFee === 0 ? 'free' : ''}>
            {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
          </span>
        </div>
      </div>
      
      <div className="summary-divider" />
      
      <div className="summary-total">
        <span>Total</span>
        <span className="total-amount">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

