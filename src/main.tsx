import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Centralized Interceptor to translate relative API paths to absolute backend URLs for native Android WebView builds
try {
  const originalFetch = window.fetch;
  const customFetch = function (input: any, init?: any) {
    let url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (url.startsWith('/api/')) {
      // Check if running in a native Capacitor WebView (ends on localhost, starts with capacitor://, or windows.Capacitor present)
      const isNative = 
        window.location.origin.startsWith('capacitor://') || 
        window.location.origin.startsWith('http://localhost') || 
        (window as any).Capacitor;

      if (isNative) {
        // Directs Android traffic to the main cloud hosted backend server
        const hostUrl = (import.meta as any).env?.VITE_API_URL || "https://ais-dev-kndrls2zapsjsxmbbdflsc-58491837947.asia-southeast1.run.app";
        // Ensure no double slashes when prepending hostUrl
        url = `${hostUrl.replace(/\/$/, '')}${url}`;
      }
    }

    if (typeof input === 'string') {
      return originalFetch.call(window, url, init);
    } else if (input instanceof URL) {
      return originalFetch.call(window, new URL(url), init);
    } else {
      const requestCopy = new Request(url, input);
      return originalFetch.call(window, requestCopy, init);
    }
  };

  try {
    Object.defineProperty(window, 'fetch', {
      value: customFetch,
      writable: true,
      configurable: true,
      enumerable: true
    });
  } catch (err) {
    // Fallback if defineProperty fails/throws but direct assignment is possible
    try {
      (window as any).fetch = customFetch;
    } catch (innerErr) {
      console.warn("Could not assign window.fetch override - read-only property:", innerErr);
    }
  }
} catch (outerErr) {
  console.error("Failed to intercept window.fetch:", outerErr);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

