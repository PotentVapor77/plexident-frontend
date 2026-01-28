import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { queryClient } from './config/queryClient';
import App from './App';
import './index.css';
import { AuthProvider } from './hooks/auth/useAuth';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <HelmetProvider>
          <AuthProvider>
            <ThemeProvider>  
              <App />
            </ThemeProvider>a
          </AuthProvider>
        </HelmetProvider>
      </BrowserRouter>
  
    </QueryClientProvider>
  </React.StrictMode>
);
