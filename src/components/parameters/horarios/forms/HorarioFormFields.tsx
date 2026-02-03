// src/components/parameters/horarios/forms/HorarioFormFields.tsx

import type { HorarioDiaFormData } from './HorarioForm';

interface HorarioFormFieldsProps {
  formData: HorarioDiaFormData[];
  onChange: (dia: number, field: keyof HorarioDiaFormData, value: any) => void;
  loading: boolean;
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const HorarioFormFields = ({ formData, onChange, loading }: HorarioFormFieldsProps) => {
  return (
    <div className="space-y-4">
      {formData.map((dia) => {
        const [aH, aM] = dia.apertura.split(':').map(Number);
        const [cH, cM] = dia.cierre.split(':').map(Number);
        const totalMin = (cH * 60 + cM) - (aH * 60 + aM);
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        const duracion = totalMin > 0 ? `${h}h ${m}m` : '--';

        return (
          <div
            key={dia.dia_semana}
            className={`p-4 rounded-lg border-2 transition-all ${
              dia.activo
                ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20'
            }`}
          >
            <div className="flex items-center gap-4 flex-wrap">
              {/* Checkbox Activo */}
              <div className="flex items-center w-32">
                <input
                  type="checkbox"
                  id={`activo-${dia.dia_semana}`}
                  checked={dia.activo}
                  onChange={(e) => onChange(dia.dia_semana, 'activo', e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                           focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                           focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor={`activo-${dia.dia_semana}`}
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-white select-none"
                >
                  {DIAS_SEMANA[dia.dia_semana]}
                </label>
              </div>

              {/* Apertura */}
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Apertura:
                </label>
                <input
                  type="time"
                  value={dia.apertura}
                  onChange={(e) => onChange(dia.dia_semana, 'apertura', e.target.value)}
                  disabled={!dia.activo || loading}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 
                           focus:border-transparent dark:bg-gray-700 dark:text-white 
                           disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                           text-sm"
                />
              </div>

              {/* Cierre */}
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Cierre:
                </label>
                <input
                  type="time"
                  value={dia.cierre}
                  onChange={(e) => onChange(dia.dia_semana, 'cierre', e.target.value)}
                  disabled={!dia.activo || loading}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 
                           focus:border-transparent dark:bg-gray-700 dark:text-white 
                           disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                           text-sm"
                />
              </div>

              {/* Duración calculada */}
              {dia.activo && (
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[80px] text-right">
                  {duracion}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HorarioFormFields;
