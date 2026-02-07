// src/components/clinicalRecords/form/sections/PlanTratamientoSection.tsx
import React, { useState, useEffect } from "react";
import { 
  RefreshCw, 
  FileText, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Pill,
  ClipboardList
} from "lucide-react";
import { formatDateOnly } from "../../../../mappers/clinicalRecordMapper";
import type { 
  SesionTratamientoData, 
  PlanTratamientoData 
} from "../../../../types/clinicalRecords/typeBackendClinicalRecord";
import clinicalRecordService from "../../../../services/clinicalRecord/clinicalRecordService";
import { useNotification } from "../../../../context/notifications/NotificationContext";
import api from "../../../../services/api/axiosInstance";
import Button from "../../../ui/button/Button";

export interface PlanTratamientoSectionProps {
  sesiones: SesionTratamientoData[] | null | undefined;
  odontogramaId: string | null | undefined;
  planTitulo?: string;
  planDescripcion?: string;
  onPlanSeleccionado?: (planData: {
    planId: string | null;
    titulo?: string;
    descripcion?: string;
    sesiones: SesionTratamientoData[];
    odontogramaId?: string | null;
  }) => void;
  mode: "create" | "edit";
  estadoHistorial: "BORRADOR" | "ABIERTO" | "CERRADO";
  pacienteId: string | null;
  historialId: string | null;
  onRefresh?: () => void;
  lastUpdated?: string | null;
}

interface PlanResumenCompleto {
  plan_id: string;
  plan_titulo: string;
  plan_notas_generales?: string;
  fecha_creacion: string;
  total_sesiones: number;
  sesiones_detalle: Array<{
    numero_sesion: number;
    fecha_programada: string | null;
    fecha_realizacion: string | null;
    estado: string;
    estado_display: string;
    diagnosticos_complicaciones: any[];
    procedimientos: any[];
    prescripciones: any[];
    notas: string;
    observaciones: string;
  }>;
  procedimientos_consolidados: any[];
  prescripciones_consolidadas: any[];
  texto_prescripciones_completo: string;
  resumen?: {
    total_diagnosticos: number;
    total_procedimientos: number;
    total_prescripciones: number;
  };
}

const PlanTratamientoSection: React.FC<PlanTratamientoSectionProps> = ({

  onPlanSeleccionado,
  mode,
  estadoHistorial,
  pacienteId,
  historialId,
  onRefresh,
  lastUpdated,
}) => {
  const { notify } = useNotification();
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanTratamientoData | null>(null);
  const [planesDisponibles, setPlanesDisponibles] = useState<PlanTratamientoData[]>([]);
  const [cargandoPlanes, setCargandoPlanes] = useState(false);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [refrescando, setRefrescando] = useState(false);
  const [resumenCompleto, setResumenCompleto] = useState<PlanResumenCompleto | null>(null);
  const [sesionesExpandidas, setSesionesExpandidas] = useState<Record<number, boolean>>({});
  const [errorResumen, setErrorResumen] = useState<string | null>(null);
  
  const isReadOnly = mode === "edit" && estadoHistorial !== "BORRADOR";
  const puedeSeleccionarPlan = !isReadOnly && !!pacienteId;
  const tienePlanSeleccionado = !!planSeleccionado;
  const tieneSesiones = planSeleccionado?.sesiones && planSeleccionado.sesiones.length > 0;

  // Cargar planes disponibles
  useEffect(() => {
    if (pacienteId && !isReadOnly) {
      cargarPlanesDisponibles();
    }
  }, [pacienteId, isReadOnly, mode]);

  // Cargar datos del plan si ya hay uno seleccionado
  useEffect(() => {
    if (historialId && planSeleccionado?.id) {
      cargarResumenCompleto();
    }
  }, [historialId, planSeleccionado?.id]);

  // Inicializar con datos del historial (modo edición)
  useEffect(() => {
    if (mode === "edit" && historialId) {
      cargarPlanDelHistorial();
    }
  }, [mode, historialId]);

  const cargarPlanesDisponibles = async () => {
    if (!pacienteId) return;
    
    try {
      setCargandoPlanes(true);
      const planes = await clinicalRecordService.getPlanesTratamientoPaciente(pacienteId);
      setPlanesDisponibles(Array.isArray(planes) ? planes : []);
    } catch (error) {
      console.error("Error cargando planes:", error);
      setPlanesDisponibles([]);
      notify({
        type: "error",
        title: "Error",
        message: "No se pudieron cargar los planes disponibles"
      });
    } finally {
      setCargandoPlanes(false);
    }
  };

  const cargarPlanDelHistorial = async () => {
    if (!historialId) return;
    
    try {
      const plan = await clinicalRecordService.getPlanTratamientoByHistorial(historialId);
      if (plan) {
        setPlanSeleccionado(plan);
        if (onPlanSeleccionado) {
          onPlanSeleccionado({
            planId: plan.id,
            titulo: plan.titulo,
            descripcion: plan.descripcion,
            sesiones: plan.sesiones || [],
            odontogramaId: plan.version_odontograma || null
          });
        }
      }
    } catch (error) {
      console.error("Error cargando plan del historial:", error);
    }
  };

  const cargarResumenCompleto = async () => {
    if (!historialId || !planSeleccionado?.id) return;
    
    try {
      setErrorResumen(null);
      const response = await api.get(
        `/clinical-records/${historialId}/resumen-plan-tratamiento/`
      );
      
      if (response.data && response.data.success) {
        const data = response.data.data || response.data;
        
        if (data && typeof data === 'object') {
          setResumenCompleto(data);
        } else {
          console.warn("Estructura de resumen inesperada:", response.data);
          setErrorResumen("Estructura de datos inesperada");
        }
      } else {
        console.warn("Respuesta sin success o sin data:", response.data);
        setErrorResumen("No se pudo cargar el resumen del plan");
      }
    } catch (error: any) {
      console.error("Error cargando resumen completo:", error);
      setErrorResumen(error.message || "Error al cargar el resumen");
      setResumenCompleto(null);
    }
  };

  const handleSeleccionarPlan = (plan: PlanTratamientoData) => {
    setPlanSeleccionado(plan);
    
    if (onPlanSeleccionado) {
      onPlanSeleccionado({
        planId: plan.id,
        titulo: plan.titulo,
        descripcion: plan.descripcion,
        sesiones: plan.sesiones || [],
        odontogramaId: plan.version_odontograma || null
      });
    }
    
    setMostrarSelector(false);
    notify({
      type: "success",
      title: "Plan seleccionado",
      message: `Plan "${plan.titulo}" seleccionado correctamente`
    });
  };

  const handleLimpiarPlan = () => {
    setPlanSeleccionado(null);
    setResumenCompleto(null);
    setErrorResumen(null);
    
    if (onPlanSeleccionado) {
      onPlanSeleccionado({
        planId: null,
        titulo: "",
        descripcion: "",
        sesiones: [],
        odontogramaId: null
      });
    }
    
    notify({
      type: "info",
      title: "Plan removido",
      message: "Se ha removido el plan de tratamiento"
    });
  };

  const handleRefresh = async () => {
    if (!historialId) return;
    
    try {
      setRefrescando(true);
      setErrorResumen(null);
      
      const planActualizado = await clinicalRecordService.getPlanTratamientoByHistorial(historialId);
      
      if (planActualizado) {
        setPlanSeleccionado(planActualizado);
        
        try {
          const sesionesActualizadas = await clinicalRecordService.getSesionesByHistorial(historialId);
          
          if (onPlanSeleccionado) {
            onPlanSeleccionado({
              planId: planActualizado.id,
              titulo: planActualizado.titulo,
              descripcion: planActualizado.descripcion,
              sesiones: sesionesActualizadas,
              odontogramaId: planActualizado.version_odontograma || null
            });
          }
        } catch (sesionesError) {
          console.warn("Error cargando sesiones:", sesionesError);
        }
        
        await cargarResumenCompleto();
        
        notify({
          type: "success",
          title: "Datos actualizados",
          message: "Plan de tratamiento actualizado correctamente"
        });
        
        if (onRefresh) {
          onRefresh();
        }
      } else {
        setPlanSeleccionado(null);
        if (onPlanSeleccionado) {
          onPlanSeleccionado({
            planId: null,
            titulo: "",
            descripcion: "",
            sesiones: [],
            odontogramaId: null
          });
        }
      }
    } catch (error) {
      console.error("Error refrescando plan:", error);
      notify({
        type: "error",
        title: "Error",
        message: "No se pudieron actualizar los datos del plan"
      });
    } finally {
      setRefrescando(false);
    }
  };

  const toggleSesionExpandida = (sesionNumero: number) => {
    setSesionesExpandidas(prev => ({
      ...prev,
      [sesionNumero]: !prev[sesionNumero]
    }));
  };

  // ============================================================================
  // FUNCIONES HELPER MEJORADAS PARA FORMATEAR DATOS
  // ============================================================================

  /**
   * Formatea diagnósticos y complicaciones con mejor estructura
   */
  const renderDiagnosticos = (numeroSesion: number) => {
  // Buscar la sesión en el resumenCompleto
  const sesionData = resumenCompleto?.sesiones_detalle?.find(
    s => s.numero_sesion === numeroSesion
  );
  
  // Si no hay resumenCompleto, intentar obtener de planSeleccionado
  const sesionFallback = planSeleccionado?.sesiones?.find(
    s => s.numero_sesion === numeroSesion
  );
  
  const diagnosticos = sesionData?.diagnosticos_complicaciones || 
                      sesionFallback?.diagnosticos_complicaciones ||
                      sesionFallback?.diagnosticos_y_complicaciones;
  
  if (!diagnosticos || !Array.isArray(diagnosticos) || diagnosticos.length === 0) {
    return (
      <div className="text-center py-4 text-slate-500 italic text-sm">
        Sin diagnósticos o complicaciones registrados
      </div>
    );
  }
  
  // Agrupar diagnósticos por diagnóstico y diente
  const diagnosticosAgrupados: Record<string, {
    diagnostico: string;
    diente: string;
    tipo: string;
    superficies: string[];
    elementosOriginales: any[];
  }> = {};
  
  diagnosticos.forEach((diag: any) => {
    const diagnostico = diag.diagnostico || diag.diagnostico_nombre || diag.nombre || 'Sin descripción';
    const tipo = diag.tipo || diag.categoria;
    const diente = diag.diente;
    const superficie = diag.superficie || diag.superficie_nombre;
    
    // Crear una clave única por diagnóstico y diente
    const clave = `${diagnostico}-${diente}-${tipo}`;
    
    if (!diagnosticosAgrupados[clave]) {
      diagnosticosAgrupados[clave] = {
        diagnostico,
        diente,
        tipo,
        superficies: [],
        elementosOriginales: []
      };
    }
    
    // Agregar superficie si existe y no está duplicada
    if (superficie && !diagnosticosAgrupados[clave].superficies.includes(superficie)) {
      diagnosticosAgrupados[clave].superficies.push(superficie);
    }
    
    // Guardar el elemento original
    diagnosticosAgrupados[clave].elementosOriginales.push(diag);
  });
  
  // Convertir el objeto agrupado a array para renderizar
  const gruposRender = Object.values(diagnosticosAgrupados);
  
  return (
    <div className="space-y-3">
      {gruposRender.map((grupo, grupoIndex) => {
        const tieneMultiplesSuperficies = grupo.superficies.length > 1;
        
        return (
          <div 
            key={`grupo-${grupoIndex}`}
            className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-700">{grupoIndex + 1}</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Diagnóstico principal */}
              <div className="font-medium text-slate-800 text-sm mb-1">
                {grupo.diagnostico}
              </div>
              
              {/* Información agrupada */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {/* Tipo de diagnóstico */}
                {grupo.tipo && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                    {grupo.tipo}
                  </span>
                )}
                
                {/* Diente */}
                {grupo.diente && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-700">
                    FDI: {grupo.diente}
                  </span>
                )}
                
                {/* Superficies agrupadas */}
                {grupo.superficies.length > 0 && (
                  <div className="inline-flex items-center gap-1">
                    <span className="text-xs text-slate-600 font-medium">Superficies:</span>
                    <div className="flex flex-wrap gap-1">
                      {grupo.superficies.map((superficie, idx) => (
                        <span 
                          key={`superficie-${idx}`}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700"
                        >
                          {superficie}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Indicador de agrupación */}
                {tieneMultiplesSuperficies && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Agrupado
                  </span>
                )}
              </div>
              
              {/* Información detallada (opcional - mostrar al hacer hover o clic) */}
              {tieneMultiplesSuperficies && (
                <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="font-medium mb-1">Detalle por superficie:</div>
                  <div className="space-y-1">
                    {grupo.elementosOriginales.map((diag, idx) => (
                      <div key={`detalle-${idx}`} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-300"></span>
                        <span>
                          {diag.superficie || 'Sin superficie'}: 
                          {diag.descripcion && ` - ${diag.descripcion}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Descripción del primer diagnóstico si existe */}
              {grupo.elementosOriginales[0]?.descripcion && (
                <div className="mt-2 text-xs text-slate-600">
                  {grupo.elementosOriginales[0].descripcion}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

  /**
   * Formatea procedimientos con mejor estructura visual
   */
  const renderProcedimientos = (numeroSesion: number) => {
    // Buscar la sesión en el resumenCompleto
    const sesionData = resumenCompleto?.sesiones_detalle?.find(
      s => s.numero_sesion === numeroSesion
    );
    
    // Si no hay resumenCompleto, intentar obtener de planSeleccionado
    const sesionFallback = planSeleccionado?.sesiones?.find(
      s => s.numero_sesion === numeroSesion
    );
    
    const procedimientos = sesionData?.procedimientos || sesionFallback?.procedimientos;
    
    console.log(`[Procedimientos] Sesión ${numeroSesion}:`, procedimientos);
    
    if (!procedimientos || !Array.isArray(procedimientos) || procedimientos.length === 0) {
      return (
        <div className="text-center py-4 text-slate-500 italic text-sm">
          Sin procedimientos registrados
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {procedimientos.map((proc: any, index: number) => {
          const nombre = proc.nombre || proc.descripcion || 'Procedimiento sin descripción';
          const diente = proc.diente;
          const codigo = proc.codigo;
          const estado = proc.estado;
          const observaciones = proc.observaciones || proc.notas;
          
          return (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-emerald-300 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-emerald-700">{index + 1}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-slate-800 text-sm flex-1">
                    {codigo && <span className="text-blue-600 font-mono mr-2">[{codigo}]</span>}
                    {nombre}
                  </div>
                  {estado && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      estado === 'completado' ? 'bg-green-100 text-green-700' :
                      estado === 'en_progreso' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {estado}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {diente && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-700">
                      FDI: {diente}
                    </span>
                  )}
                </div>
                {observaciones && (
                  <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                    {observaciones}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Formatea prescripciones con mejor estructura visual
   */
  const renderPrescripciones = (numeroSesion: number) => {
    // Buscar la sesión en el resumenCompleto
    const sesionData = resumenCompleto?.sesiones_detalle?.find(
      s => s.numero_sesion === numeroSesion
    );
    
    // Si no hay resumenCompleto, intentar obtener de planSeleccionado
    const sesionFallback = planSeleccionado?.sesiones?.find(
      s => s.numero_sesion === numeroSesion
    );
    
    const prescripciones = sesionData?.prescripciones || sesionFallback?.prescripciones;
    
    console.log(`[Prescripciones] Sesión ${numeroSesion}:`, prescripciones);
    
    if (!prescripciones || !Array.isArray(prescripciones) || prescripciones.length === 0) {
      return (
        <div className="text-center py-4 text-slate-500 italic text-sm">
          Sin prescripciones registradas
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {prescripciones.map((pres: any, index: number) => {
          const medicamento = pres.medicamento || 'Medicamento no especificado';
          const dosis = pres.dosis;
          const frecuencia = pres.frecuencia;
          const duracion = pres.duracion;
          const via = pres.via || pres.via_administracion;
          const observaciones = pres.observaciones || pres.indicaciones;
          
          return (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-violet-300 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-violet-700">{index + 1}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 text-sm">{medicamento}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {dosis && (
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-medium">Dosis</span>
                      <span className="text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded mt-0.5">
                        {dosis}
                      </span>
                    </div>
                  )}
                  {frecuencia && (
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-medium">Frecuencia</span>
                      <span className="text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded mt-0.5">
                        {frecuencia}
                      </span>
                    </div>
                  )}
                  {duracion && (
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-medium">Duración</span>
                      <span className="text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded mt-0.5">
                        {duracion}
                      </span>
                    </div>
                  )}
                  {via && (
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-medium">Vía</span>
                      <span className="text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded mt-0.5">
                        {via}
                      </span>
                    </div>
                  )}
                </div>
                {observaciones && (
                  <div className="mt-2 text-xs text-slate-600 bg-violet-50 p-2 rounded border border-violet-100">
                    <span className="font-medium">Indicaciones:</span> {observaciones}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Valores por defecto para el resumen
  const resumenData = {
    total_diagnosticos: resumenCompleto?.resumen?.total_diagnosticos || 0,
    total_procedimientos: resumenCompleto?.resumen?.total_procedimientos || 0,
    total_prescripciones: resumenCompleto?.resumen?.total_prescripciones || 0,
  };

  // Debug logs mejorados
  useEffect(() => {
    console.group("[PlanTratamiento] Debug de Datos");
    console.log("Resumen completo:", resumenCompleto);
    console.log("Plan seleccionado:", planSeleccionado);
    
    if (resumenCompleto?.sesiones_detalle) {
      console.log("📊 Total sesiones en resumen:", resumenCompleto.sesiones_detalle.length);
      resumenCompleto.sesiones_detalle.forEach((sesion, idx) => {
        console.group(`  📝 Sesión ${sesion.numero_sesion}`);
        console.log("    - Diagnósticos:", sesion.diagnosticos_complicaciones?.length || 0, sesion.diagnosticos_complicaciones);
        console.log("    - Procedimientos:", sesion.procedimientos?.length || 0, sesion.procedimientos);
        console.log("    - Prescripciones:", sesion.prescripciones?.length || 0, sesion.prescripciones);
        console.groupEnd();
      });
    }
    
    if (planSeleccionado?.sesiones) {
      console.log("Total sesiones en plan:", planSeleccionado.sesiones.length);
      planSeleccionado.sesiones.forEach((sesion, idx) => {
        console.group(`  Sesión ${sesion.numero_sesion} (fallback)`);
        console.log("    - Diagnósticos:", sesion.diagnosticos_complicaciones?.length || 0);
        console.log("    - Procedimientos:", sesion.procedimientos?.length || 0);
        console.log("    - Prescripciones:", sesion.prescripciones?.length || 0);
        console.groupEnd();
      });
    }
    
    console.groupEnd();
  }, [resumenCompleto, planSeleccionado]);

  // ============================================================================
  // RENDER: Sin plan seleccionado
  // ============================================================================
  if (!tienePlanSeleccionado && puedeSeleccionarPlan) {
    return (
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Plan de Tratamiento
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Asocie un plan de tratamiento al historial clínico
              </p>
              {lastUpdated && (
                <p className="text-xs text-slate-400 mt-1">
                  Última actualización: {lastUpdated}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <AlertCircle className="h-3 w-3" />
            <span>No seleccionado</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-medium text-slate-700 mb-2">
              No hay plan de tratamiento seleccionado
            </h4>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
              {mode === "edit" 
                ? "Este historial no tiene un plan de tratamiento asociado."
                : "Seleccione un plan de tratamiento para este nuevo historial."}
            </p>
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => setMostrarSelector(true)}
              disabled={cargandoPlanes}
              startIcon={<Plus className="h-4 w-4" />}
            >
              {cargandoPlanes ? "Cargando..." : "Seleccionar Plan"}
            </Button>

            {planesDisponibles.length > 0 && (
              <p className="text-sm text-blue-600 mt-3">
                {planesDisponibles.length} planes disponibles para este paciente
              </p>
            )}
          </div>
        </div>

        {/* Modal selector */}
        {mostrarSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">
                      Seleccionar Plan de Tratamiento
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Elija un plan existente para este paciente
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarSelector(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {cargandoPlanes ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-gray-600">Cargando planes disponibles...</p>
                  </div>
                ) : planesDisponibles.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                    <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-2">
                      No hay planes disponibles
                    </p>
                    <p className="text-sm text-slate-500">
                      Este paciente no tiene planes de tratamiento creados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {planesDisponibles.map((plan) => (
                      <div
                        key={plan.id}
                        className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                        onClick={() => handleSeleccionarPlan(plan)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{plan.titulo}</h5>
                            {plan.descripcion && (
                              <p className="text-slate-600 mt-1 text-sm">{plan.descripcion}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(plan.fecha_creacion).toLocaleDateString()}
                              </span>
                              <span className="px-2 py-1 bg-slate-100 rounded text-slate-700">
                                {(plan.sesiones?.length || 0)} sesiones
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Seleccionar
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarSelector(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  // ============================================================================
  // RENDER: Con plan seleccionado
  // ============================================================================
  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Plan de Tratamiento
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {planSeleccionado?.titulo || "Plan asociado al historial"}
            </p>
            {lastUpdated && (
              <p className="text-xs text-slate-400 mt-1">
                Última actualización: {lastUpdated}
              </p>
            )}
            {planSeleccionado?.descripcion && (
              <p className="text-sm text-slate-600 mt-2">{planSeleccionado.descripcion}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            tienePlanSeleccionado 
              ? "bg-emerald-100 text-emerald-700" 
              : "bg-amber-100 text-amber-700"
          }`}>
            {tienePlanSeleccionado ? (
              <>
                <CheckCircle className="h-3 w-3" />
                <span>Asociado</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                <span>Sin plan</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refrescando}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            title="Refrescar datos del plan"
          >
            <RefreshCw className={`h-4 w-4 ${refrescando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información del plan */}
        {tienePlanSeleccionado && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">
                  {planSeleccionado.titulo}
                </h4>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Creado: {new Date(planSeleccionado.fecha_creacion).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>ID: {planSeleccionado.id?.substring(0, 8)}...</span>
                  <span>•</span>
                  <span>Sesiones: {planSeleccionado.sesiones?.length || 0}</span>
                </div>
              </div>
              
              {puedeSeleccionarPlan && !isReadOnly && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMostrarSelector(true)}
                  >
                    Cambiar Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLimpiarPlan}
                    className="text-rose-600 hover:text-rose-700 hover:border-rose-300"
                  >
                    Quitar
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resumen ejecutivo */}
        {resumenCompleto && !errorResumen && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <h4 className="font-semibold text-slate-700">Resumen Ejecutivo</h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Stethoscope className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-600">DIAGNÓSTICOS</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {resumenData.total_diagnosticos}
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardList className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-600">PROCEDIMIENTOS</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {resumenData.total_procedimientos}
                  </div>
                </div>
                <div className="bg-violet-50 border border-violet-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Pill className="h-4 w-4 text-violet-600" />
                    <span className="text-xs font-medium text-violet-600">PRESCRIPCIONES</span>
                  </div>
                  <div className="text-2xl font-bold text-violet-600">
                    {resumenData.total_prescripciones}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error cargando resumen */}
        {errorResumen && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Error en el resumen</p>
              <p className="text-sm text-amber-700 mt-1">{errorResumen}</p>
            </div>
          </div>
        )}

        {/* Lista de sesiones MEJORADA */}
        {tieneSesiones ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-700">
                Sesiones del Plan ({planSeleccionado!.sesiones!.length})
              </h4>
              <button
                type="button"
                onClick={() => {
                  const allExpanded = Object.values(sesionesExpandidas).every(v => v);
                  const newState: Record<number, boolean> = {};
                  planSeleccionado!.sesiones!.forEach(s => {
                    newState[s.numero_sesion] = !allExpanded;
                  });
                  setSesionesExpandidas(newState);
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {Object.values(sesionesExpandidas).every(v => v) ? 'Colapsar todo' : 'Expandir todo'}
              </button>
            </div>
            
            {planSeleccionado!.sesiones!.map((sesion, index) => (
              <div key={sesion.id || index} className="border border-slate-200 rounded-lg overflow-hidden">
                {/* Header de la sesión */}
                <div 
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    sesion.estado === 'COMPLETADA' ? 'bg-emerald-50 hover:bg-emerald-100' : 
                    sesion.estado === 'EN_PROGRESO' ? 'bg-amber-50 hover:bg-amber-100' : 
                    'bg-blue-50 hover:bg-blue-100'
                  }`}
                  onClick={() => toggleSesionExpandida(sesion.numero_sesion)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 flex items-center justify-center rounded-full font-semibold ${
                        sesion.estado === 'COMPLETADA' ? 'bg-emerald-100 text-emerald-700' : 
                        sesion.estado === 'EN_PROGRESO' ? 'bg-amber-100 text-amber-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {sesion.numero_sesion}
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-800">
                          Sesión {sesion.numero_sesion}
                        </h5>
                        {sesion.fecha_programada && (
                          <p className="text-xs text-slate-600 mt-0.5">
                            Programada: {formatDateOnly(sesion.fecha_programada)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        sesion.estado === 'COMPLETADA' ? 'bg-emerald-100 text-emerald-700' :
                        sesion.estado === 'EN_PROGRESO' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {sesion.estado}
                      </span>
                      {sesionesExpandidas[sesion.numero_sesion] ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Contenido expandido MEJORADO */}
                {sesionesExpandidas[sesion.numero_sesion] && (
                  <div className="p-5 bg-white border-t border-slate-200 space-y-5">
                    {/* Diagnósticos y Complicaciones */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                        <h6 className="font-semibold text-slate-700 text-sm">
                          Diagnósticos y Complicaciones
                        </h6>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {renderDiagnosticos(sesion.numero_sesion)}
                      </div>
                    </div>
                    
                    {/* Procedimientos */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ClipboardList className="h-4 w-4 text-emerald-600" />
                        <h6 className="font-semibold text-slate-700 text-sm">
                          Procedimientos Realizados
                        </h6>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {renderProcedimientos(sesion.numero_sesion)}
                      </div>
                    </div>
                    
                    {/* Prescripciones */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Pill className="h-4 w-4 text-violet-600" />
                        <h6 className="font-semibold text-slate-700 text-sm">
                          Prescripciones Médicas
                        </h6>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {renderPrescripciones(sesion.numero_sesion)}
                      </div>
                    </div>
                    
                    {/* Notas y Observaciones */}
                    {(sesion.notas || sesion.observaciones) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                        {sesion.notas && (
                          <div>
                            <h6 className="font-semibold text-slate-700 mb-2 text-sm">Notas Clínicas</h6>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-slate-700">
                              {sesion.notas}
                            </div>
                          </div>
                        )}
                        
                        {sesion.observaciones && (
                          <div>
                            <h6 className="font-semibold text-slate-700 mb-2 text-sm">Observaciones</h6>
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm text-slate-700">
                              {sesion.observaciones}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
            <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-medium text-slate-700 mb-2">
              Sin sesiones definidas
            </h4>
            <p className="text-slate-500 text-sm">
              El plan seleccionado no contiene sesiones de tratamiento.
            </p>
          </div>
        )}

        
        </div>

      {/* Modal para cambiar plan */}
      {mostrarSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900">
                    Cambiar Plan de Tratamiento
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Seleccione un nuevo plan para este historial
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarSelector(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cargandoPlanes ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-3 text-gray-600">Cargando planes disponibles...</p>
                </div>
              ) : planesDisponibles.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                  <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-2">
                    No hay otros planes disponibles
                  </p>
                  <p className="text-sm text-slate-500">
                    Este paciente no tiene otros planes de tratamiento.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {planesDisponibles
                    .filter(plan => plan.id !== planSeleccionado?.id)
                    .map((plan) => (
                      <div
                        key={plan.id}
                        className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                        onClick={() => handleSeleccionarPlan(plan)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900">{plan.titulo}</h5>
                            {plan.descripcion && (
                              <p className="text-sm text-slate-600 mt-1">{plan.descripcion}</p>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            {plan.sesiones?.length || 0} sesiones
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          <span>Creado: {new Date(plan.fecha_creacion).toLocaleDateString()}</span>
                        </div>
                      </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarSelector(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PlanTratamientoSection;