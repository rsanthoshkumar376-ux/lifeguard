import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Placeholder for i18n init
// import './i18n'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* ThemeProvider and AuthProvider would wrap App here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
