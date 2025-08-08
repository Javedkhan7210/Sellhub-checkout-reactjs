
import React, { useEffect, useRef, useState } from 'react';

const TapPayment = ({onSuccessTap, setPaymentResponse, onPaymentSuccess, amount = 1}) => {
  const cardRef = useRef(null);
  const sdkLoadedRef = useRef(false);
  const unmountRef = useRef(null);

  console.log("sdaghasdgsa",parseFloat(amount));
  
  const {
    tokenize,
    resetCardInputs,
    saveCard,
    updateCardConfiguration,
    updateTheme,
    loadSavedCard } = window.CardSDK
    
  useEffect(() => {
    // Prevent multiple initializations
    if (sdkLoadedRef.current) {
      return;
    }

    // Check if script is already loaded
    if (document.querySelector('script[src*="tap-sdks.b-cdn.net"]')) {
      // Script already exists, just initialize if SDK is available
      if (window.CardSDK && !sdkLoadedRef.current) {
        initializeSDK();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://tap-sdks.b-cdn.net/card/1.0.2/index.js';
    script.async = true;

    script.onload = () => {
      if (window.CardSDK && !sdkLoadedRef.current) {
        initializeSDK();
      }
    };

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      if (unmountRef.current && typeof unmountRef.current === 'function') {
        unmountRef.current();
        unmountRef.current = null;
      }
      sdkLoadedRef.current = false;
    };
  }, []); // Remove dependencies to prevent re-initialization

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      #card-sdk-id {
        color: #fff !important;
        opacity: 1 !important;
      }
      #card-sdk-id svg {
        filter: brightness(1);
      }
      #tap-card-iframe {
        border-radius: 10px !important;
        max-width: 100% !important;
      }
    `;
    document.head.appendChild(style);
  
    return () => {
      document.head.removeChild(style); // Cleanup
    };
  }, []);

  const initializeSDK = () => {
    if (sdkLoadedRef.current || !window.CardSDK) {
      return;
    }

    sdkLoadedRef.current = true;
    
    const {
      renderTapCard,
      Theme,
      Currencies,
      Direction,
      Edges,
      Locale,
    } = window.CardSDK;

    const { unmount } = renderTapCard(cardRef.current.id, {
      publicKey: 'pk_test_yJ5QwkWvqTHKOBVxFZstPECp',
      merchant: {
        id: '52502637',
      },
      transaction: {
        amount: parseFloat(amount),
        currency:"AED",
      },
      acceptance: {
        supportedBrands: ['AMERICAN_EXPRESS', 'VISA', 'MASTERCARD', 'MADA'],
        supportedCards: 'ALL',
      },
      fields: {
        cardHolder: true,
      },
      addons: {
        displayPaymentBrands: true,
        loader: true,
        saveCard: true,
      },
      interface: {
        locale: Locale.EN,
        theme: Theme.LIGHT,
        edges: Edges.CURVED,
        direction: Direction.LTR,
      },
      onSuccess: (data) => {
        console.log('Tap Payment onSuccess called with data:', data);
        sessionStorage.setItem('TapToken', data?.id);
        setPaymentResponse(data); // Store payment response
        
        // Call the parent's handleContinueToPayment function when payment is successful
        console.log('Calling onPaymentSuccess function...');
        if (onPaymentSuccess && typeof onPaymentSuccess === 'function') {
          console.log('onPaymentSuccess function exists, calling it...');
          onPaymentSuccess();
        } else {
          console.log('onPaymentSuccess function not found or not a function');
        }
      },
      onError: (data) => {
        console.log('Tap Payment onError:', data);
      },
      onReady: () => {
        console.log('Tap Payment SDK is ready');
      },
    });

    unmountRef.current = unmount;
  };



  // Debug function to manually trigger payment success
  const debugTriggerPaymentSuccess = () => {
    console.log('Debug: Manually triggering payment success');
    const mockData = { id: 'test_token_123', status: 'success' };
    sessionStorage.setItem('TapToken', mockData.id);
    setPaymentResponse(mockData);
    
    if (onPaymentSuccess && typeof onPaymentSuccess === 'function') {
      console.log('Debug: Calling onPaymentSuccess');
      onPaymentSuccess();
    }
  };

  return (

    <div style={{ backgroundColor: '#fff',  borderRadius: '10px',  }}>
      <div id="card-sdk-id" ref={cardRef} style={{  borderRadius: '10px', }}></div>
   </div>
  );
};

export default TapPayment;
