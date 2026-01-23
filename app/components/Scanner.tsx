'use client';

import React, { useState } from 'react';
import { useCBESuperApp } from '../context/CBESuperAppContext';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';

interface ScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Scanner({ isOpen, onClose }: ScannerProps) {
  const { cameraPermission, requestCameraPermission, openCamera } = useCBESuperApp();
  const { addToCart } = useCart();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<typeof products[0] | null>(null);

  const handleRequestPermission = () => {
    requestCameraPermission();
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setFoundProduct(null);

    openCamera((result) => {
      setIsScanning(false);
      setScanResult(result);
      
      // Try to find a product (in real app, this would lookup by barcode)
      // For demo, we'll randomly select a product
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      setFoundProduct(randomProduct);
    });
  };

  const handleAddToCart = () => {
    if (foundProduct) {
      addToCart(foundProduct);
      onClose();
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setFoundProduct(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="scanner-backdrop" onClick={onClose} />
      
      {/* Scanner Modal */}
      <div className="scanner-modal">
        {/* Header */}
        <div className="scanner-header">
          <h2 className="scanner-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="scanner-icon">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Scan Product
          </h2>
          <button className="scanner-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="scanner-content">
          {cameraPermission !== 'granted' ? (
            // Permission Request View
            <div className="scanner-permission">
              <div className="permission-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <h3>Camera Access Required</h3>
              <p>Allow camera access to scan product barcodes and QR codes for quick shopping.</p>
              <button className="permission-btn" onClick={handleRequestPermission}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Grant Camera Permission
              </button>
            </div>
          ) : scanResult && foundProduct ? (
            // Scan Result View
            <div className="scanner-result">
              <div className="result-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="result-code">Code: {scanResult}</p>
              
              <div className="result-product">
                <div className="result-product-image">
                  <span>{foundProduct.image}</span>
                </div>
                <div className="result-product-info">
                  <h4>{foundProduct.name}</h4>
                  <p className="result-product-price">{foundProduct.price.toLocaleString()} ETB</p>
                  <p className="result-product-category">{foundProduct.category}</p>
                </div>
              </div>

              <div className="result-actions">
                <button className="add-scanned-btn" onClick={handleAddToCart}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add to Cart
                </button>
                <button className="scan-again-btn" onClick={handleReset}>
                  Scan Another
                </button>
              </div>
            </div>
          ) : (
            // Scanner View
            <div className="scanner-view">
              <div className={`scanner-frame ${isScanning ? 'scanning' : ''}`}>
                <div className="frame-corner tl"></div>
                <div className="frame-corner tr"></div>
                <div className="frame-corner bl"></div>
                <div className="frame-corner br"></div>
                {isScanning && <div className="scan-line"></div>}
                <div className="frame-content">
                  {isScanning ? (
                    <p>Scanning...</p>
                  ) : (
                    <p>Position barcode within frame</p>
                  )}
                </div>
              </div>
              
              <button 
                className={`scan-btn ${isScanning ? 'scanning' : ''}`}
                onClick={handleStartScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <span className="spinner"></span>
                    Scanning...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Start Scanning
                  </>
                )}
              </button>

              <p className="scanner-hint">
                Scan product barcodes to quickly add items to your cart
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

