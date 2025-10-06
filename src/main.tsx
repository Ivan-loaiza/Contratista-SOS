// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import '@/styles/global.css';

import { AuthProvider } from '@/context/AuthContext';

// Opcional: React Query
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// const queryClient = new QueryClient();

// Opcional: theming / toasts / i18n (deja aquí tus providers globales)

const container = document.getElementById('root');
if (!container) {
  throw new Error('No se encontró el elemento #root en index.html');
}

createRoot(container).render(
  <React.StrictMode>
    {/* Si desplegaras tu app en /subcarpeta, puedes usar basename */}
    {/* <BrowserRouter basename={import.meta.env.BASE_URL}> */}
    <BrowserRouter>
      {/* <QueryClientProvider client={queryClient}> */}
      <AuthProvider>
        <App />
      </AuthProvider>
      {/* </QueryClientProvider> */}
    </BrowserRouter>
  </React.StrictMode>
);
