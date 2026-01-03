// src/context/PacienteContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import type { IPaciente } from "../types/patient/IPatient";

interface PacienteContextType {
    pacienteActivo: IPaciente | null;
    setPacienteActivo: (paciente: IPaciente | null) => void;
}

const PacienteContext = createContext<PacienteContextType | undefined>(undefined);

const STORAGE_KEY = "plexident_paciente_activo";

export const PacienteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pacienteActivo, setPacienteActivoState] = useState<IPaciente | null>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error("Error al cargar paciente activo desde localStorage:", error);
        }
        return null;
    });

    useEffect(() => {
        try {
            if (pacienteActivo) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(pacienteActivo));
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (error) {
            console.error("Error al guardar paciente activo en localStorage:", error);
        }
    }, [pacienteActivo]);

    const setPacienteActivo = (paciente: IPaciente | null) => {
        setPacienteActivoState(paciente);
    };

    return (
        <PacienteContext.Provider value={{ pacienteActivo, setPacienteActivo }}>
            {children}
        </PacienteContext.Provider>
    );
};

export const usePacienteActivo = () => {
    const context = useContext(PacienteContext);
    if (!context) {
        throw new Error("usePacienteActivo debe usarse dentro de PacienteProvider");
    }
    return context;
};
