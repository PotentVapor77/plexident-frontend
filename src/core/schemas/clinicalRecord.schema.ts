// src/core/schemas/clinicalRecord.schema.ts

import { z } from "zod";

export const clinicalRecordCreateSchema = z.object({
    paciente: z.string().uuid({ message: "Debe seleccionar un paciente válido" }),

    odontologo_responsable: z.string().uuid({
        message: "Debe seleccionar un odontólogo responsable"
    }),

    motivo_consulta: z.string()
        .min(10, { message: "El motivo de consulta debe tener al menos 10 caracteres" })
        .max(500, { message: "El motivo de consulta no puede exceder 500 caracteres" }),

    embarazada: z.enum(["SI", "NO", ""], {
        message: "Seleccione una opción válida"
    }).optional(),

    enfermedad_actual: z.string().max(1000).optional(),

    observaciones: z.string().max(2000).optional(),

    unicodigo: z.string().max(50).optional(),

    establecimiento_salud: z.string().max(200).optional(),

    estado: z.enum(["BORRADOR", "ABIERTO", "CERRADO"]).optional(),

    usar_ultimos_datos: z.boolean().default(true),
});

/**
 * Schema para actualizar un historial clínico
 */
export const clinicalRecordUpdateSchema = z.object({
    motivo_consulta: z.string()
        .min(10, { message: "El motivo de consulta debe tener al menos 10 caracteres" })
        .max(500)
        .optional(),

    embarazada: z.enum(["SI", "NO", ""]).optional(),

    enfermedad_actual: z.string().max(1000).optional(),

    observaciones: z.string().max(2000).optional(),

    estado: z.enum(["BORRADOR", "ABIERTO"]).optional(),
});

/**
 * Schema para cerrar un historial
 */
export const clinicalRecordCloseSchema = z.object({
    observaciones_cierre: z.string()
        .max(500, { message: "Las observaciones no pueden exceder 500 caracteres" })
        .optional(),
});

/**
 * Schema para reabrir un historial
 */
export const clinicalRecordReopenSchema = z.object({
    motivo_reapertura: z.string()
        .min(20, { message: "Debe especificar un motivo de al menos 20 caracteres" })
        .max(500, { message: "El motivo no puede exceder 500 caracteres" }),
});

/**
 * Schema para filtros
 */
export const clinicalRecordFiltersSchema = z.object({
    search: z.string().optional(),
    estado: z.enum(["BORRADOR", "ABIERTO", "CERRADO", ""]).optional(),
    paciente: z.string().uuid().optional(),
    odontologo: z.string().uuid().optional(),
    fecha_desde: z.string().datetime().optional(),
    fecha_hasta: z.string().datetime().optional(),
    activo: z.boolean().optional(),
});

// Tipos inferidos de los schemas
export type ClinicalRecordCreateInput = z.infer<typeof clinicalRecordCreateSchema>;
export type ClinicalRecordUpdateInput = z.infer<typeof clinicalRecordUpdateSchema>;
export type ClinicalRecordCloseInput = z.infer<typeof clinicalRecordCloseSchema>;
export type ClinicalRecordReopenInput = z.infer<typeof clinicalRecordReopenSchema>;
