// src/components/clinicalRecord/form/sections/ExamenEstomatognaticoSection.tsx
import React, { useState, useEffect } from "react";
import { HeartPulse, AlertCircle } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import SectionHeader from "../ClinicalRecordSectionHeader";
import { getExamenHallazgos } from "../../../../core/utils/clinicalRecordUtils";
import api from "../../../../services/api/axiosInstance";
import { ENDPOINTS } from "../../../../config/api";

interface ExamenEstomatognaticoSectionProps {
  formData: ClinicalRecordFormData;
  lastUpdated?: string | null;
  mode: "create" | "edit";
  refreshSection: () => Promise<void>;
  isRefreshing?: boolean;
  recordId?: string;
}

const ExamenEstomatognaticoSection: React.FC<ExamenEstomatognaticoSectionProps> = ({
  formData,
  lastUpdated,
  refreshSection,
  isRefreshing = false,
  mode,
  recordId,
}) => {
  const [hayVersionMasReciente, setHayVersionMasReciente] = useState(false);
  const [fechaVersionReciente, setFechaVersionReciente] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);

  // Verificar si hay una versión más reciente disponible (solo en modo editar)
  useEffect(() => {
    if (mode === 'edit' && recordId && formData.examen_estomatognatico_data) {
      verificarVersionMasReciente();
    }
  }, [mode, recordId, formData.examen_estomatognatico_data?.id]);

  const verificarVersionMasReciente = async () => {
    try {
      setVerificando(true);
      
      // Obtener el ID del paciente del formData
      const pacienteId = formData.paciente;
      if (!pacienteId) return;

      const response = await api.get(
        ENDPOINTS.clinicalRecords.examenEstomatognatico.latestByPaciente(pacienteId)
      );

      if (response.data.success && response.data.data) {
        const versionReciente = response.data.data;
        const fechaActual = formData.examen_estomatognatico_data?.fecha_modificacion;

        // Comparar IDs primero (más confiable)
        if (versionReciente.id !== formData.examen_estomatognatico_data?.id) {
          // Son diferentes - verificar si la versión reciente es más nueva
          if (fechaActual && versionReciente.fecha_modificacion) {
            const fechaActualDate = new Date(fechaActual);
            const fechaRecienteDate = new Date(versionReciente.fecha_modificacion);

            if (fechaRecienteDate > fechaActualDate) {
              setHayVersionMasReciente(true);
              setFechaVersionReciente(versionReciente.fecha_modificacion);
            } else {
              setHayVersionMasReciente(false);
              setFechaVersionReciente(null);
            }
          }
        } else {
          // Es la misma versión
          setHayVersionMasReciente(false);
          setFechaVersionReciente(null);
        }
      }
    } catch (error) {
      console.error('Error verificando versión más reciente del examen:', error);
      // No mostramos error al usuario, solo no mostramos la advertencia
    } finally {
      setVerificando(false);
    }
  };

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Barra de progreso sutil superior cuando está cargando */}
      {(isRefreshing || verificando) && (
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-100 overflow-hidden">
          <div className="w-full h-full bg-rose-500 animate-progress-buffer origin-left"></div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div className="flex-1">
          <SectionHeader
            icon={<HeartPulse className="text-rose-500" />}
            title="G. Examen del Sistema Estomatognático"
            subtitle={
              lastUpdated 
                ? mode === 'edit'
                  ? `Datos del historial del: ${lastUpdated}`
                  : `Cargado del: ${lastUpdated}`
                : "No existen registros previos"
            }
          />
          
          {/* ADVERTENCIA: Versión más reciente disponible */}
          {mode === 'edit' && hayVersionMasReciente && !verificando && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-800">
                  Hay una versión más reciente del examen disponible
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Última actualización: {new Date(fechaVersionReciente!).toLocaleString('es-EC', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Presione el botón de actualizar <span className="font-semibold">↻</span> para cargar la versión más reciente.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Botón de Refresh */}
        <button
          type="button"
          onClick={refreshSection}
          disabled={isRefreshing || verificando}
          className={`p-2 rounded-lg transition-all ml-3 ${
            isRefreshing || verificando
              ? "bg-slate-100 cursor-not-allowed opacity-50" 
              : hayVersionMasReciente 
                ? "bg-amber-100 hover:bg-amber-200 text-amber-700 border-2 border-amber-300 shadow-sm hover:shadow-md"
                : "hover:bg-rose-50 text-slate-400 hover:text-rose-600 active:scale-95 border border-transparent hover:border-rose-100"
          }`}
          title={
            mode === 'edit' && hayVersionMasReciente
              ? "⚠ Cargar versión más reciente del examen (requiere confirmación)"
              : mode === 'edit'
                ? "Actualizar examen con la versión más reciente del paciente"
                : "Actualizar examen"
          }
        >
          <svg 
            className={`w-5 h-5 ${isRefreshing || verificando ? "animate-spin" : hayVersionMasReciente ? "animate-pulse" : ""}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
      </div>

      <div className="mt-4">
        {/* Mostramos un esqueleto si está refrescando y no hay datos */}
        {(isRefreshing || verificando) && !formData.examen_estomatognatico_data ? (
          <div className="animate-pulse flex space-x-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-slate-200 rounded"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : !formData.examen_estomatognatico_data ? (
          <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-sm text-slate-500 italic">
              No se encontraron exámenes previos registrados para este paciente.
            </p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-opacity ${
            isRefreshing || verificando ? 'opacity-50' : 'opacity-100'
          }`}>
            {getExamenHallazgos(formData.examen_estomatognatico_data).map((hallazgo, idx) => (
              <div
                key={idx}
                className="flex flex-col p-3 bg-rose-50/50 border border-rose-100 rounded-lg"
              >
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                  {hallazgo.region}
                </span>
                <span className="text-sm text-slate-700 mt-1 italic">{hallazgo.detalle}</span>
              </div>
            ))}
            
            {formData.examen_estomatognatico_data.examen_sin_patologia && (
              <div className="col-span-full p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-emerald-800 font-medium">
                  El examen clínico no presenta patologías detectadas.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer con ID del examen para debugging */}
      {formData.examen_estomatognatico_data && mode === 'edit' && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            ID del examen: {formData.examen_estomatognatico_data.id}
          </p>
        </div>
      )}
    </section>
  );
};

export default ExamenEstomatognaticoSection;