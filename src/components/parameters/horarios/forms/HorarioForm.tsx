// src/components/parameters/horarios/forms/HorarioForm.tsx

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import HorarioFormFields from './HorarioFormFields';
import type { IHorario, IHorarioBulkUpdate } from '../../../../types/parameters/IParameters';

interface HorarioFormProps {
  currentHorarios: IHorario[] | { horarios: IHorario[] }; // ← Permite ambos tipos
  onSubmit: (data: IHorarioBulkUpdate) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export interface HorarioDiaFormData {
  id?: string; 
  dia_semana: number;
  activo: boolean;
  apertura: string;
  cierre: string;
}

const HorarioForm = ({ currentHorarios, onSubmit, onCancel, loading }: HorarioFormProps) => {
  const [formData, setFormData] = useState<HorarioDiaFormData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Función para normalizar los horarios
  const normalizeHorarios = (horarios: IHorario[] | { horarios: IHorario[] }): IHorario[] => {
    if (Array.isArray(horarios)) {
      return horarios;
    }
    if (horarios && typeof horarios === 'object' && 'horarios' in horarios) {
      return horarios.horarios;
    }
    return [];
  };

  useEffect(() => {
    // Normalizar los horarios primero
    const normalizedHorarios = normalizeHorarios(currentHorarios);
    
    // Inicializar con horarios actuales o valores por defecto
    const initialData: HorarioDiaFormData[] = [];
    
    for (let dia = 0; dia < 7; dia++) {
      const existente = normalizedHorarios.find((h) => h.dia_semana === dia);
      initialData.push({
        id: existente?.id,
        dia_semana: dia,
        activo: existente?.activo ?? false,
        apertura: existente?.apertura ?? '08:00',
        cierre: existente?.cierre ?? '18:00',
      });
    }
    
    setFormData(initialData);
  }, [currentHorarios]);

  const handleChange = (dia: number, field: keyof HorarioDiaFormData, value: any) => {
    setFormData((prev) =>
      prev.map((item) =>
        item.dia_semana === dia ? { ...item, [field]: value } : item
      )
    );
    setErrors([]);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    const diasNombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    formData.forEach((dia) => {
      if (dia.activo) {
        if (!dia.apertura || !dia.cierre) {
          newErrors.push(`${diasNombres[dia.dia_semana]}: Debes especificar hora de apertura y cierre`);
        }
        
        if (dia.apertura >= dia.cierre) {
          newErrors.push(`${diasNombres[dia.dia_semana]}: La hora de apertura debe ser antes del cierre`);
        }

        const [aH, aM] = dia.apertura.split(':').map(Number);
        const [cH, cM] = dia.cierre.split(':').map(Number);
        
        // Validar formato
        if (isNaN(aH) || isNaN(aM) || isNaN(cH) || isNaN(cM)) {
          newErrors.push(`${diasNombres[dia.dia_semana]}: Formato de hora inválido (use HH:MM)`);
          return;
        }
        
        // Validar rango
        if (aH < 5 || aH > 23 || aM < 0 || aM > 59) {
          newErrors.push(`${diasNombres[dia.dia_semana]}: Hora de apertura inválida`);
        }
        
        if (cH < 5 || cH > 23 || cM < 0 || cM > 59) {
          newErrors.push(`${diasNombres[dia.dia_semana]}: Hora de cierre inválida`);
        }
        
        // Validar duración mínima
        const minutosApertura = aH * 60 + aM;
        const minutosCierre = cH * 60 + cM;
        const duracion = minutosCierre - minutosApertura;
        
        if (duracion < 60) { // Mínimo 1 hora
          newErrors.push(`${diasNombres[dia.dia_semana]}: Duración mínima debe ser 1 hora`);
        }
        
        if (duracion > 16 * 60) { // Máximo 16 horas
          newErrors.push(`${diasNombres[dia.dia_semana]}: Duración máxima no puede exceder 16 horas`);
        }
      }
    });
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const dataToSend: IHorarioBulkUpdate = {
      horarios: formData,
    };
    
    try {
      await onSubmit(dataToSend);
    } catch (error: any) {
      // Mostrar errores del servidor
      setErrors([error.message || 'Error al guardar los cambios']);
    }
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      {/* Errores */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              <span className="text-red-600 dark:text-red-400">⚠️</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                Se encontraron los siguientes errores:
              </h4>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 dark:text-red-400 pl-2">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Fields */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <HorarioFormFields
          formData={formData}
          onChange={handleChange}
          loading={loading}
        />
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            <span className="text-blue-600 dark:text-blue-400">💡</span>
          </div>
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Nota:</strong> Los días marcados como inactivos no permitirán agendar citas. 
              Asegúrate de configurar horarios coherentes para cada día de atención.
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              Horario sugerido: 08:00 - 18:00 (10 horas de atención)
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
                   border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 
                   dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
                   flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save size={18} />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default HorarioForm;