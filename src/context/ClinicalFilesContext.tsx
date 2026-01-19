// src/context/ClinicalFilesContext.tsx
import React, { createContext, useContext } from 'react';
import { useClinicalFiles } from '../hooks/clinicalFiles/useClinicalFiles';

type ClinicalFilesContextValue = ReturnType<typeof useClinicalFiles>;

const ClinicalFilesContext = createContext<ClinicalFilesContextValue | null>(null);

export const ClinicalFilesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const clinicalFiles = useClinicalFiles();
    return (
        <ClinicalFilesContext.Provider value={clinicalFiles}>
            {children}
        </ClinicalFilesContext.Provider>
    );
};

export const useClinicalFilesContext = (): ClinicalFilesContextValue => {
    const ctx = useContext(ClinicalFilesContext);
    if (!ctx) {
        throw new Error('useClinicalFilesContext must be used within ClinicalFilesProvider');
    }
    return ctx;
};
