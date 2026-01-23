'use client';

import React, { useState } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../data/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const cartItem = items.find(item => item.id === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!product.inStock) return;
    
    setIsAdding(true);
    addToCart(product);
    
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <div className={`product-card ${!product.inStock ? 'out-of-stock' : ''}`}>
      {product.badge && (
        <span className="product-badge">{product.badge}</span>
      )}
      
      <div className="product-image">
        <span className="product-emoji">{product.image}</span>
        {!product.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
      </div>
      
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-rating">
          <span className="star">★</span>
          <span className="rating-value">{product.rating}</span>
        </div>
        
        <div className="product-footer">
          <div className="product-price">
            <span className="current-price">{formatCurrency(product.price)}</span>
            {product.originalPrice && (
              <span className="original-price">{formatCurrency(product.originalPrice)}</span>
            )}
          </div>
          
          <button
            className={`add-to-cart-btn ${isAdding ? 'adding' : ''} ${quantityInCart > 0 ? 'in-cart' : ''}`}
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            {quantityInCart > 0 ? (
              <span className="btn-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="check-icon">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {quantityInCart}
              </span>
            ) : (
              <span className="btn-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="plus-icon">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

