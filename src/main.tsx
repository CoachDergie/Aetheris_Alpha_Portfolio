import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TraditionProvider } from './contexts/TraditionContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TraditionProvider>
      <App />
    </TraditionProvider>
  </StrictMode>,
);
