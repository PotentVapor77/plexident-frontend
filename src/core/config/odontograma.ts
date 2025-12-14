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
export const DIAGNOSTICO_CATEGORIES: DiagnosticoCategory[] = [
    {
        id: "Ausencia",
        nombre: "Ausencia",
        colorKey: "AUSENCIA",
        prioridadKey: PRIORIDADES_MAP.Ausencia,
        diagnosticos: [
            {
                id: "ausencia_congenita",
                nombre: "Ausencia Congénita",
                simboloColor: "AUSENCIA",
                siglas: "AC",
                categoria: "Ausencia",
                areas_afectadas: ['general'], 
                atributos_clinicos: { erupcion: ERUPCION },
            },
            {
                id: "extraccion",
                nombre: "Extracción",
                siglas: "Ext",
                simboloColor: "AUSENCIA",
                categoria: "Ausencia",
                areas_afectadas: ['general'], 
                atributos_clinicos: { estado_procedimiento: ESTADO_PROCEDIMIENTO },
            },
        ],
    },
    {
        id: "Patología Activa",
        nombre: "Patología Activa",
        colorKey: "PATOLOGIA",
        prioridadKey: PRIORIDADES_MAP['Patología Activa'],
        diagnosticos: [
            {
                id: "caries_icdas_3",
                nombre: "Caries Profunda (ICDAS 3)",
                siglas: "C3",
                simboloColor: "PATOLOGIA",
                categoria: "Patología Activa",
                areas_afectadas: ['corona'], 
                atributos_clinicos: { erupcion: ERUPCION },
            
            },
            
            {
                id: "movilidad",
                nombre: "Movilidad",
                siglas: "Mov",  
                simboloColor: "PATOLOGIA",
                categoria: "Patología Activa",
                areas_afectadas: ['general'], 
                atributos_clinicos: { estado_procedimiento: ESTADO_PROCEDIMIENTO },
            },

            {
                id: "fractura_corona",
                nombre: "Fractura de Corona",
                siglas: "FracC",
                simboloColor: "PATOLOGIA",
                categoria: "Patología Activa",
                areas_afectadas: ['corona'], 
                atributos_clinicos: { estado_procedimiento: ESTADO_PROCEDIMIENTO },
            },
            {
                id: "fractura_raiz",
                nombre: "Fractura de Raíz",
                siglas: "FracR",
                simboloColor: "PATOLOGIA",
                categoria: "Patología Activa",
                areas_afectadas: ['raiz'], 
                atributos_clinicos: { estado_procedimiento: ESTADO_PROCEDIMIENTO },
            },
        ],
    },
    {
        id: "Restauración",
        nombre: "Restauración",
        colorKey: "REALIZADO",
        prioridadKey: PRIORIDADES_MAP.Restauración,
        diagnosticos: [
            {
                id: "restauracion_resina",
                nombre: "Restauración Existente",
                siglas: "RestE",
                simboloColor: "REALIZADO",
                categoria: "Restauración",
                areas_afectadas: ['corona'], 
                atributos_clinicos: {
                    material_restauracion: MATERIAL_RESTAURACION,
                    estado_restauracion: ESTADO_RESTAURACION,
                },
            },
            {
                id: "restauracion_gran_extension", 
                nombre: "Restauración de Gran Extensión",
                siglas: "RestG", 
                simboloColor: "REALIZADO",
                categoria: "Restauración",
                areas_afectadas: ['corona', 'raiz'], 
                atributos_clinicos: {
                    material_restauracion: MATERIAL_RESTAURACION,
                    estado_restauracion: ESTADO_RESTAURACION,
                    estado_procedimiento: ESTADO_PROCEDIMIENTO,
                },
            },
            {
                id: "corona_provisional",
                nombre: "Corona Provisional",
                siglas: "CorP",
                simboloColor: "REALIZADO",
                categoria: "Restauración",
                areas_afectadas: ['corona'], 
                atributos_clinicos: {
                    material_restauracion: MATERIAL_RESTAURACION,
                    estado_restauracion: ESTADO_RESTAURACION,
                    estado_procedimiento: ESTADO_PROCEDIMIENTO,
                },
            },
            {
                id: "corona_definitiva",
                nombre: "Corona Definitiva",
                siglas: "CorD",
                simboloColor: "REALIZADO",
                categoria: "Restauración",
                areas_afectadas: ['corona'], 
                atributos_clinicos: {
                    material_restauracion: MATERIAL_RESTAURACION,
                    estado_restauracion: ESTADO_RESTAURACION,
                    estado_procedimiento: ESTADO_PROCEDIMIENTO,
                },
            },
        ],
    },
    {
        id: "Tratamiento de Conductos",
        nombre: "Tratamiento de Conductos",
        colorKey: "ENDODONCIA",
        prioridadKey: PRIORIDADES_MAP['Tratamiento de Conductos'],
        diagnosticos: [
            {
                id: "endodoncia_completa",
                nombre: "Tratamiento de Conductos",
                siglas: "Endo",
                simboloColor: "ENDODONCIA",
                categoria: "Tratamiento de Conductos",
                areas_afectadas: ['corona', 'raiz'], 
                atributos_clinicos: { estado_procedimiento: ESTADO_PROCEDIMIENTO },
            },
        ],
    },
    {
        id: "Anomalía",
        nombre: "Anomalía",
        colorKey: "ANOMALIA",
        prioridadKey: PRIORIDADES_MAP.Anomalía,
        diagnosticos: [
            {
                id: "diente_impactado",
                nombre: "Diente Impactado",
                siglas: "Imp",
                categoria: "Anomalía",
                simboloColor: "ANOMALIA",
                areas_afectadas: ['general'],
                atributos_clinicos: { erupcion: ERUPCION },
            },
            {
                id: "supernumerario",
                nombre: "Diente Supernumerario",
                siglas: "Sup",
                categoria: "Anomalía",
                simboloColor: "ANOMALIA",
                areas_afectadas: ['general'],
                atributos_clinicos: { erupcion: ERUPCION },
            },
            {
                id: "diente_duplicado",
                nombre: "Diente Duplicado",
                siglas: "Dup",
                categoria: "Anomalía",
                simboloColor: "ANOMALIA",
                areas_afectadas: ['general'],
                atributos_clinicos: { erupcion: ERUPCION },
            },
            {
                id: "malposicion",
                nombre: "Malposición",
                siglas: "MalP",
                categoria: "Anomalía",
                simboloColor: "ANOMALIA",
                areas_afectadas: ['general'],
                atributos_clinicos: { erupcion: ERUPCION },
            },
            {
                id: "rotacion",
                nombre: "Rotación",
                siglas: "Rot",
                categoria: "Anomalía",
                simboloColor: "ANOMALIA",
                areas_afectadas: ['general'],
                atributos_clinicos: { erupcion: ERUPCION },
            },
            {
                id: "diente_gemelo",
                nombre: "Diente Gemelo",
                siglas: "Gem",
                categoria: "Anomalía",
                simboloColor: "ANOMALIA",
                areas_afectadas: ['general'],
                atributos_clinicos: { erupcion: ERUPCION },
            },
        ],
    },
];

export type { DiagnosticoItem };