'use client';

import React, { useState } from 'react';
import { useCBESuperApp } from '../context/CBESuperAppContext';
import type { DeliveryAddress } from '../types';

interface LocationPickerProps {
  address: DeliveryAddress | null;
  onAddressSet: (address: DeliveryAddress) => void;
}

export default function LocationPicker({ address, onAddressSet }: LocationPickerProps) {
  const { location, requestLocationPermission, getCurrentLocation, permissions } = useCBESuperApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetLocation = async () => {
    setIsLoading(true);
    
    const locationPermission = permissions.find(p => p.permission === 'Location');
    console.log('locationPermission', locationPermission);
    
    if (!locationPermission || locationPermission.status !== 'granted') {
      console.log('requesting location permission');
      requestLocationPermission();
    } else {
      console.log('getting current location');
      getCurrentLocation();
    }
    
  
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  React.useEffect(() => {
    if (location && location.latitude && location.longitude) {
      onAddressSet({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  }, [location, onAddressSet]);

  return (
    <div className="location-picker">
      <h3 className="location-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="location-icon">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        Delivery Location
      </h3>
      
      {address ? (
        <div className="location-result">
          <div className="location-coords">
            <div className="coord-item">
              <span className="coord-label">Latitude</span>
              <span className="coord-value">{address.latitude.toFixed(6)}</span>
            </div>
            <div className="coord-item">
              <span className="coord-label">Longitude</span>
              <span className="coord-value">{address.longitude.toFixed(6)}</span>
            </div>
          </div>
          <div className="location-status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="success-icon">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Location set successfully
          </div>
          <button className="update-location-btn" onClick={handleGetLocation} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Location'}
          </button>
        </div>
      ) : (
        <div className="location-prompt">
          <p className="location-text">
            Share your location for accurate delivery
          </p>
          <button 
            className="get-location-btn" 
            onClick={handleGetLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Getting Location...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                Use My Current Location
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

