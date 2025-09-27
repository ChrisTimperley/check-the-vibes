import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import MuiApp from './MuiApp.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MuiApp />
  </StrictMode>
);
