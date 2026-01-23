'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { PaymentResult, PermissionResult, LocationResult, OrderPayload, AuthPayload } from '../types';

// SDK Configuration - Replace with actual values from CBE
const SDK_CONFIG = {
  appCode: 'DEMO_SHOP_001',
  merchantCode: 'MERCHANT_001',
  apiKey: 'demo_api_key',
  appName: 'CBE Mini Shop',
};

interface CBESuperAppContextType {
  isSDKAvailable: boolean;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  location: LocationResult | null;
  permissions: PermissionResult[];
  paymentResult: PaymentResult | null;
  cameraPermission: 'granted' | 'rejected' | 'pending';
  login: () => void;
  logout: () => void;
  initiatePayment: (amount: number, reference: string, title: string) => void;
  requestLocationPermission: () => void;
  requestCameraPermission: () => void;
  getCurrentLocation: () => void;
  clearPaymentResult: () => void;
  openCamera: (callback: (result: string) => void) => void;
}

const CBESuperAppContext = createContext<CBESuperAppContextType | undefined>(undefined);

export function CBESuperAppProvider({ children }: { children: ReactNode }) {
  const [isSDKAvailable, setIsSDKAvailable] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [permissions, setPermissions] = useState<PermissionResult[]>([]);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'rejected' | 'pending'>('pending');
  const [cameraCallback, setCameraCallback] = useState<((result: string) => void) | null>(null);

  // Initialize SDK and set up callbacks
  useEffect(() => {
    // Check if SDK is available
    const checkSDK = () => {
      if (typeof window !== 'undefined' && window.cbesuperapp) {
        setIsSDKAvailable(true);
        return true;
      }
      return false;
    };

    // Set up callback handlers
    window.handleAccessToken = (token: string) => {
      console.log('Access Token received:', token);
      setAccessToken(token);
      setIsLoading(false);
      // Store in session for persistence
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('cbe_access_token', token);
      }
    };

    window.handlePaymentResult = (result: PaymentResult) => {
      console.log('Payment Result:', result);
      setPaymentResult(result);
    };

    window.handlePermissionResult = (result: PermissionResult[] | string) => {
      if (result === 'error') {
        console.error('Permission request failed');
        return;
      }
      setPermissions(result as PermissionResult[]);
      
      // Check for camera permission
      const cameraPerm = (result as PermissionResult[]).find(p => p.permission === 'Camera');
      if (cameraPerm) {
        setCameraPermission(cameraPerm.status);
      }
      
      // If location permission granted, fetch location
      const locationPerm = (result as PermissionResult[]).find(p => p.permission === 'Location');
      if (locationPerm?.status === 'granted') {
        getCurrentLocation();
      }
    };

    window.handleLocationResult = (result: LocationResult) => {
      console.log('Location Result:', result);
      setLocation(result);
    };

    // Camera scan result handler
    (window as any).handleCameraResult = (result: string) => {
      console.log('Camera/Scan Result:', result);
      if (cameraCallback) {
        cameraCallback(result);
        setCameraCallback(null);
      }
    };

    // Check SDK availability
    checkSDK();

    // Check for stored token
    if (typeof sessionStorage !== 'undefined') {
      const storedToken = sessionStorage.getItem('cbe_access_token');
      if (storedToken) {
        setAccessToken(storedToken);
      }
    }

    // Cleanup
    return () => {
      delete window.handleAccessToken;
      delete window.handlePaymentResult;
      delete window.handlePermissionResult;
      delete window.handleLocationResult;
      delete (window as any).handleCameraResult;
    };
  }, [cameraCallback]);

  const login = useCallback(() => {
    setIsLoading(true);
    
    if (!window.cbesuperapp) {
      console.log('SDK not available - simulating login');
      // Simulate login for testing
      setTimeout(() => {
        const demoToken = 'demo_token_' + Date.now();
        setAccessToken(demoToken);
        setIsLoading(false);
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('cbe_access_token', demoToken);
        }
      }, 1500);
      return;
    }

    const payload = JSON.stringify({
      functionName: 'fetchAccessToken',
      params: {
        appcode: SDK_CONFIG.appCode,
        callbackName: 'handleAccessToken',
      },
    });

    window.cbesuperapp.send(payload);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setPermissions([]);
    setLocation(null);
    setCameraPermission('pending');
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('cbe_access_token');
    }
  }, []);

  const initiatePayment = useCallback((amount: number, reference: string, title: string) => {
    if (!window.cbesuperapp) {
      console.log('SDK not available for payment');
      // Simulate payment for testing
      setTimeout(() => {
        setPaymentResult({
          success: true,
          ft_number: 'FT' + Date.now(),
          payment_details: {
            app_id: SDK_CONFIG.appCode,
            merchant_code: SDK_CONFIG.merchantCode,
            merchant_reference: reference,
            title: title,
            total_amount: amount.toFixed(2),
            currency: 'ETB',
          },
          message: 'Payment confirmed (Demo)',
          transaction_status: 'PAID',
        });
      }, 2000);
      return;
    }

    const orderPayload: OrderPayload = {
      app_code: SDK_CONFIG.appCode,
      merchant_code: SDK_CONFIG.merchantCode,
      merchant_reference: reference,
      title: title,
      total_amount: amount.toFixed(2),
      currency: 'ETB',
      sign: 'generated_signature_here',
      confirm_payload: {},
    };

    const authPayload: AuthPayload = {
      xApiKey: SDK_CONFIG.apiKey,
      xAccessToken: accessToken || '',
    };

    const paymentRequest = JSON.stringify({
      functionName: 'initiatePayment',
      params: {
        orderPayload,
        authPayload,
        callbackName: 'handlePaymentResult',
        appName: SDK_CONFIG.appName,
      },
    });

    window.cbesuperapp.send(paymentRequest);
  }, [accessToken]);

  const requestLocationPermission = useCallback(() => {
    if (!window.cbesuperapp) {
      console.log('SDK not available for permissions');
      setPermissions([{ permission: 'Location', status: 'granted' }]);
      return;
    }

    const permissionRequest = JSON.stringify({
      functionName: 'requestPermissions',
      params: {
        permissions: ['Location'],
        callbackName: 'handlePermissionResult',
      },
    });

    window.cbesuperapp.send(permissionRequest);
  }, []);

  const requestCameraPermission = useCallback(() => {
    if (!window.cbesuperapp) {
      console.log('SDK not available for camera permission - simulating');
      setCameraPermission('granted');
      setPermissions(prev => [...prev.filter(p => p.permission !== 'Camera'), { permission: 'Camera', status: 'granted' }]);
      return;
    }

    const permissionRequest = JSON.stringify({
      functionName: 'requestPermissions',
      params: {
        permissions: ['Camera'],
        callbackName: 'handlePermissionResult',
      },
    });

    window.cbesuperapp.send(permissionRequest);
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!window.cbesuperapp) {
      console.log('SDK not available for location');
      setLocation({ latitude: 9.0054, longitude: 38.7636 });
      return;
    }

    const locationRequest = JSON.stringify({
      functionName: 'fetchCurrentLocation',
      params: {
        callbackName: 'handleLocationResult',
      },
    });

    window.cbesuperapp.send(locationRequest);
  }, []);

  const openCamera = useCallback((callback: (result: string) => void) => {
    setCameraCallback(() => callback);
    
    if (!window.cbesuperapp) {
      console.log('SDK not available for camera - simulating scan');
      // Simulate a barcode scan result
      setTimeout(() => {
        callback('PRODUCT_' + Math.random().toString(36).substring(7).toUpperCase());
      }, 1500);
      return;
    }

    const cameraRequest = JSON.stringify({
      functionName: 'openCamera',
      params: {
        mode: 'scan', // or 'photo'
        callbackName: 'handleCameraResult',
      },
    });

    window.cbesuperapp.send(cameraRequest);
  }, []);

  const clearPaymentResult = useCallback(() => {
    setPaymentResult(null);
  }, []);

  return (
    <CBESuperAppContext.Provider
      value={{
        isSDKAvailable,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        location,
        permissions,
        paymentResult,
        cameraPermission,
        login,
        logout,
        initiatePayment,
        requestLocationPermission,
        requestCameraPermission,
        getCurrentLocation,
        clearPaymentResult,
        openCamera,
      }}
    >
      {children}
    </CBESuperAppContext.Provider>
  );
}

export function useCBESuperApp() {
  const context = useContext(CBESuperAppContext);
  if (context === undefined) {
    throw new Error('useCBESuperApp must be used within a CBESuperAppProvider');
  }
  return context;
}
