// src/context/PacienteContext.tsx
import React, { createContext, useContext, useState } from "react";
import type { IPaciente } from "../types/patient/IPatient";

interface PacienteContextType {
    pacienteActivo: IPaciente | null;
    setPacienteActivo: (paciente: IPaciente | null) => void;
}

const PacienteContext = createContext<PacienteContextType | undefined>(undefined);

export const PacienteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pacienteActivo, setPacienteActivo] = useState<IPaciente | null>(null);

    return (
        <PacienteContext.Provider value={{ pacienteActivo, setPacienteActivo }}>
            {children}
        </PacienteContext.Provider>
    );
};

export const usePacienteActivo = () => {
    const context = useContext(PacienteContext);
    if (!context) throw new Error("usePacienteActivo debe usarse dentro de PacienteProvider");
    return context;
};