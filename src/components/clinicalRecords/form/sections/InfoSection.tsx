// src/components/clinicalRecords/form/sections/InfoSection.tsx
import React from "react";
import { 
  Building2, 
  Hash, 
  Hospital, 
  FileDigit, 
  FileArchive,
  CalendarDays,
  ShieldCheck,
  BookOpen
} from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";

interface InfoSectionProps {
  formData: ClinicalRecordFormData;
  mode: "create" | "edit";
}

const InfoSection: React.FC<InfoSectionProps> = ({
  formData,
  mode,
}) => {
  
  console.log('=== InfoSection Debug ===');
  console.log('formData recibido:', formData);
  console.log('campos específicos:', {
    institucion_sistema: formData.institucion_sistema,
    unicodigo: formData.unicodigo,
    establecimiento_salud: formData.establecimiento_salud,
    numero_historia_clinica_unica: formData.numero_historia_clinica_unica,
    numero_archivo: formData.numero_archivo,
    numero_hoja: formData.numero_hoja,
  });
  // Usar directamente los datos del formData que vienen del mapeador
  const datosAutomaticos = {
  institucion_sistema: formData.institucion_sistema !== undefined 
    ? formData.institucion_sistema 
    : "SISTEMA NACIONAL DE SALUD",
  numero_historia_clinica_unica: formData.numero_historia_clinica_unica !== undefined 
    ? formData.numero_historia_clinica_unica 
    : "Se generará al guardar",
    numero_archivo: formData.numero_archivo || "ARCH-XXXXX",
    numero_hoja: formData.numero_hoja?.toString() || "1",
    establecimiento_salud: formData.establecimiento_salud || "No especificado",
    unicodigo: formData.unicodigo || "Sin código asignado",
    // La fecha de atención podría venir del backend o usar la actual
    fecha_atencion: new Date().toLocaleDateString('es-ES'),
  };

  // Determinar si se muestra como "sin asignar" o con valor
  const getUnicodigoDisplay = () => {
    if (!datosAutomaticos.unicodigo || datosAutomaticos.unicodigo === "Sin código asignado") 
      return "Sin código asignado";
    return datosAutomaticos.unicodigo;
  };

  const getEstablecimientoDisplay = () => {
    if (!datosAutomaticos.establecimiento_salud || datosAutomaticos.establecimiento_salud === "No especificado") 
      return "No especificado";
    return datosAutomaticos.establecimiento_salud;
  };

  const getNumeroHistoriaColor = () => {
    if (!datosAutomaticos.numero_historia_clinica_unica || datosAutomaticos.numero_historia_clinica_unica === "Se generará al guardar") {
      return "text-amber-700 bg-amber-50 border-amber-200";
    }
    return "text-blue-800 bg-blue-50 border-blue-200";
  };

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      {/* Header de la sección */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              A. Datos Institucionales
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Información institucional del historial clínico
            </p>
          </div>
        </div>
        
        {mode === "create" && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
            Nuevo Historial
          </span>
        )}
      </div>

      {/* Grid de datos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Columna 1: Sistema */}
        <div className="space-y-4">
          {/* Institución del Sistema */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              INSTITUCIÓN DEL SISTEMA
            </label>
            <div className="relative">
              <input
                type="text"
                value={datosAutomaticos.institucion_sistema}
                readOnly
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ShieldCheck className="h-5 w-5 text-slate-400" />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Sistema de salud configurado por defecto
            </p>
          </div>

          {/* UNICÓDIGO */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Hash className="h-4 w-4 text-slate-500" />
              UNICÓDIGO
            </label>
            <div className={`p-4 bg-slate-50 border ${!datosAutomaticos.unicodigo || datosAutomaticos.unicodigo === "Sin código asignado" ? 'border-dashed border-slate-200' : 'border-slate-200'} rounded-lg`}>
              <p className={`text-sm font-medium ${!datosAutomaticos.unicodigo || datosAutomaticos.unicodigo === "Sin código asignado" ? 'text-slate-500 italic' : 'text-slate-800 font-mono'}`}>
                {getUnicodigoDisplay()}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Código único institucional
            </p>
          </div>
        </div>

        {/* Columna 2: Establecimiento */}
        <div className="space-y-4">
          {/* Establecimiento de Salud */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Hospital className="h-4 w-4 text-slate-500" />
              ESTABLECIMIENTO DE SALUD
            </label>
            <div className={`p-4 bg-slate-50 border ${!datosAutomaticos.establecimiento_salud || datosAutomaticos.establecimiento_salud === "No especificado" ? 'border-dashed border-slate-200' : 'border-slate-200'} rounded-lg`}>
              <p className={`text-sm font-medium ${!datosAutomaticos.establecimiento_salud || datosAutomaticos.establecimiento_salud === "No especificado" ? 'text-slate-500 italic' : 'text-slate-800'}`}>
                {getEstablecimientoDisplay()}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Unidad de salud donde se atiende al paciente
            </p>
          </div>

          {/* Número de Archivo */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <FileArchive className="h-4 w-4 text-slate-500" />
              NÚMERO DE ARCHIVO
            </label>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm font-medium text-slate-800 font-mono">
                {datosAutomaticos.numero_archivo}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Identificador único del archivo físico/digital
            </p>
          </div>
        </div>

        {/* Columna 3: Identificadores */}
        <div className="space-y-4">
          {/* Número de Historia Clínica Única */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <FileDigit className="h-4 w-4 text-slate-500" />
              NÚMERO DE HISTORIA CLÍNICA ÚNICA
            </label>
            <div className={`p-4 border rounded-lg font-mono font-semibold ${getNumeroHistoriaColor()}`}>
              <p className="text-sm">
                {datosAutomaticos.numero_historia_clinica_unica}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {datosAutomaticos.numero_historia_clinica_unica && datosAutomaticos.numero_historia_clinica_unica !== "Se generará al guardar" 
                ? "Identificador único del historial"
                : "Se generará automáticamente al guardar"}
            </p>
          </div>

          {/* Fecha de Atención */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              FECHA DE ATENCIÓN
            </label>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm font-medium text-slate-800">
                {datosAutomaticos.fecha_atencion}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Fecha de creación/atención
            </p>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <p className="text-xs text-slate-600">
            <span className="font-medium">Nota:</span> Todos los campos en esta sección son generados automáticamente por el sistema y no requieren edición manual.
          </p>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;