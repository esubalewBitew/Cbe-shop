'use client';

import React from 'react';
import type { DeliveryOption } from '../types';
import { formatCurrency } from '../data/products';

interface DeliverySelectorProps {
  options: DeliveryOption[];
  selectedOption: DeliveryOption | null;
  onSelect: (option: DeliveryOption) => void;
}

export default function DeliverySelector({ options, selectedOption, onSelect }: DeliverySelectorProps) {
  return (
    <div className="delivery-selector">
      <h3 className="delivery-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="delivery-icon">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        Delivery Options
      </h3>
      
      <div className="delivery-options">
        {options.map(option => (
          <button
            key={option.id}
            className={`delivery-option ${selectedOption?.id === option.id ? 'selected' : ''}`}
            onClick={() => onSelect(option)}
          >
            <span className="option-icon">{option.icon}</span>
            <div className="option-details">
              <span className="option-name">{option.name}</span>
              <span className="option-description">{option.description}</span>
              <span className="option-time">⏱️ {option.estimatedTime}</span>
            </div>
            <span className={`option-price ${option.price === 0 ? 'free' : ''}`}>
              {option.price === 0 ? 'FREE' : formatCurrency(option.price)}
            </span>
            <div className="option-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

