// src/config/odontograma.ts

import type { PrioridadKey, DiagnosticoCategory, DiagnosticoItem } from "../types/typeOdontograma";
import { ERUPCION, ESTADO_PROCEDIMIENTO, ESTADO_RESTAURACION, MATERIAL_RESTAURACION } from "./atributos_clinicos";

 
// --- Tipos auxiliares ---
export type OpcionAtributoClinico = { key: string; nombre: string };
export type OpcionSecundaria = OpcionAtributoClinico;

// --- Prioridades ---
const PRIORIDADES_MAP: Record<string, PrioridadKey> = {
    Ausencia: 'INFORMATIVA',
    'Patología Activa': 'ALTA',
    Restauración: 'BAJA',
    'Tratamiento de Conductos': 'MEDIA',
    Anomalía: 'ESTRUCTURAL',
};

// --- Categorías de Diagnóstico ---
