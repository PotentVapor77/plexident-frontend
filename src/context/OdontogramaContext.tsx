// src/contexts/OdontogramaContext.tsx
import React, { createContext, useContext } from "react";
import { useOdontogramaData } from "../hooks/odontogram/useOdontogramaData";


const OdontogramaContext = createContext<any>(null);

export const OdontogramaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const odontograma = useOdontogramaData();
  return (
    <OdontogramaContext.Provider value={odontograma}>
      {children}
    </OdontogramaContext.Provider>
  );
};

export const useOdontograma = () => useContext(OdontogramaContext);