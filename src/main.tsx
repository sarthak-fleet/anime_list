import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import '@/src/styles/globals.css';
import { router } from './router';
import { initVitals } from './lib/vitals';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

initVitals();

void import('@fontsource/inter/latin-400.css');
void import('@fontsource/inter/latin-600.css');
