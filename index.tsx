import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/components/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const swUrl = '/service-worker.js';
      const resp = await fetch(swUrl, { method: 'HEAD' });
      if (resp.ok && resp.headers.get('content-type')?.includes('javascript')) {
        const registration = await navigator.serviceWorker.register(swUrl);
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      } else {
        console.warn('Service worker not registered: File not found or invalid content type.');
      }
    } catch (error) {
      console.warn('ServiceWorker registration failed: ', error);
    }
  });
}