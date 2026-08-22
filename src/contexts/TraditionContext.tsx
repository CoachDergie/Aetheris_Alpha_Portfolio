import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TraditionMode, translate } from '../utils/tradition';

interface TraditionContextProps {
  tradition: TraditionMode;
  setTradition: (mode: TraditionMode) => void;
  t: (text: string | undefined | null) => string;
}

const TraditionContext = createContext<TraditionContextProps>({
  tradition: 'hermetic',
  setTradition: () => {},
  t: (text) => text || '',
});

export const TraditionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to hermetic (gentle) for broader audience onboarding
  const [tradition, setTradition] = useState<TraditionMode>('hermetic'); 

  const t = (text: string | undefined | null) => translate(text, tradition);

  return (
    <TraditionContext.Provider value={{ tradition, setTradition, t }}>
      {children}
    </TraditionContext.Provider>
  );
};

export const useTradition = () => useContext(TraditionContext);
