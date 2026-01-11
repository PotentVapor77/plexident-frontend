// schemas/treatmentPlan.schema.ts
import { z } from 'zod';

// ============================================================================
// SCHEMAS DE VALIDACIÓN
// ============================================================================

export const procedimientoSchema = z.object({
    id: z.string().optional(),
    descripcion: z.string()
        .min(3, "Descripción debe tener al menos 3 caracteres")
        .max(500, "Descripción muy larga"),
    diente: z.string()
        .regex(/^[1-8][1-8]$/, "Código FDI inválido (ej: 11, 46)")
        .optional(),
    superficie: z.string()
        .max(50, "Superficie muy larga")
        .optional(),
    codigo: z.string().max(20).optional(),
    costo_estimado: z.number()
        .positive("Costo debe ser positivo")
        .optional(),
    duracion_estimada: z.number()
        .int()
        .positive("Duración debe ser positiva")
        .max(480, "Duración máxima 8 horas")
        .optional(),
    completado: z.boolean().default(false),
    notas: z.string().max(1000).optional()
});

export const prescripcionSchema = z.object({
    id: z.string().optional(),
    medicamento: z.string()
        .min(2, "Nombre de medicamento requerido")
        .max(200),
    dosis: z.string()
        .min(1, "Dosis requerida")
        .max(100),
    frecuencia: z.string()
        .min(1, "Frecuencia requerida")
        .max(100),
    duracion: z.string()
        .min(1, "Duración requerida")
        .max(100),
    via_administracion: z.string().max(50).optional(),
    indicaciones: z.string().max(1000).optional()
});

export const sessionFormSchema = z.object({
    plan_tratamiento: z.string()
        .uuid("ID de plan inválido"),
    fecha_programada: z.string()
        .date("Fecha inválida")
        .optional()
        .or(z.literal("")),
    autocompletar_diagnosticos: z.boolean().default(true),
    procedimientos: z.array(procedimientoSchema)
        .min(0)
        .max(50, "Máximo 50 procedimientos por sesión"),
    prescripciones: z.array(prescripcionSchema)
        .min(0)
        .max(20, "Máximo 20 prescripciones por sesión"),
    notas: z.string()
        .max(5000, "Notas muy largas")
        .optional(),
    cita_id: z.string().uuid().nullable().optional(),
    estado: z.enum(['planificada', 'en_progreso', 'completada', 'cancelada'])
        .default('planificada')
});

export const treatmentPlanFormSchema = z.object({
    paciente: z.string()
        .uuid("Debe seleccionar un paciente válido"),
    titulo: z.string()
        .min(5, "Título debe tener al menos 5 caracteres")
        .max(200, "Título muy largo")
        .refine(val => val.trim().length >= 5, {
            message: "Título no puede ser solo espacios"
        }),
    notas_generales: z.string()
        .max(10000, "Notas muy largas")
        .optional(),
    usar_ultimo_odontograma: z.boolean().default(true)
});

// ============================================================================
// TIPOS INFERIDOS
// ============================================================================

export type ProcedimientoFormData = z.infer<typeof procedimientoSchema>;
export type PrescripcionFormData = z.infer<typeof prescripcionSchema>;
export type SessionFormData = z.infer<typeof sessionFormSchema>;
export type TreatmentPlanFormData = z.infer<typeof treatmentPlanFormSchema>;
