import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../index.css'; //

try {
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
} catch (e) {
  console.error('Error rendering app:', e);
  document.getElementById('root').innerHTML = '<h1>EatSmart</h1><p>Error loading application.</p>';
} 