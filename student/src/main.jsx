import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { registerServiceWorker } from './registerSW.js';
import { initDB } from './utils/storage.js';
import { requestPersistentStorage } from './utils/helpers.js';

// Initialize IndexedDB
initDB().then(() => {
  console.log('IndexedDB initialized');
}).catch(error => {
  console.error('Failed to initialize IndexedDB:', error);
});

// Request persistent storage
requestPersistentStorage().then(isPersisted => {
  console.log('Persistent storage:', isPersisted ? 'granted' : 'denied');
}).catch(error => {
  console.error('Failed to request persistent storage:', error);
});

// Register service worker
registerServiceWorker();

// Render app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
