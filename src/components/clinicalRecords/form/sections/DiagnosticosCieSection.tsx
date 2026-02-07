import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Search, Filter, Plus } from "lucide-react";
import type { 
  DiagnosticoCIEData, 
  SincronizarDiagnosticosPayload 
} from "../../../../types/clinicalRecords/typeBackendClinicalRecord";
import { 
  useDiagnosticosCIEAvailable,
  useDiagnosticosCIEByRecord,
  useSyncDiagnosticosCIEInRecord
} from "../../../../hooks/clinicalRecord/useDiagnosticosCIE";
import { useNotification } from "../../../../context/notifications/NotificationContext";
import RefreshButton from "../../../ui/button/RefreshButton";

type Modo = "crear" | "editar";

interface DiagnosticosCieSectionProps {
  modo: Modo;
  pacienteId?: string | null;
  historialId?: string | null;
  onChangeDiagnosticosSeleccionados: (diagnosticos: DiagnosticoCIEData[]) => void;
  refreshSection?: () => void;
}

type SeleccionMap = Record<string, DiagnosticoCIEData>;

interface FiltroDiagnosticos {
  texto: string;
  tipoCIE: "todos" | "PRE" | "DEF";
  dienteFDI: string;
  mostrarInactivos: boolean;
}

const DiagnosticosCieSection: React.FC<DiagnosticosCieSectionProps> = ({
  modo,
  pacienteId,
  historialId,
  onChangeDiagnosticosSeleccionados,
}) => {
  const { notify } = useNotification();
  const [seleccionados, setSeleccionados] = useState<SeleccionMap>({});
  const [filtros, setFiltros] = useState<FiltroDiagnosticos>({
    texto: "",
    tipoCIE: "todos",
    dienteFDI: "",
    mostrarInactivos: false,
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [tipoCargaActual, setTipoCargaActual] = useState<"nuevos" | "todos">("nuevos");
  const isInitialLoad = useRef(true);

  // Obtener diagnósticos según el modo
  const { 
    data: diagnosticosDisponibles, 
    isLoading: loadingDisponibles,
    error: errorDisponibles,
    refetch: refetchDisponibles 
  } = useDiagnosticosCIEAvailable(
    pacienteId ?? null, 
    tipoCargaActual
  );

  // Obtener diagnósticos ya cargados en el historial (solo modo editar)
  const { 
    data: diagnosticosEnHistorial,
    isLoading: loadingEnHistorial,
    error: errorEnHistorial,
    refetch: refetchEnHistorial
  } = useDiagnosticosCIEByRecord(historialId ?? null);

  // Mutación para sincronizar
  const syncMutation = useSyncDiagnosticosCIEInRecord(historialId!);

  // DEBUG: Log para diagnóstico
  useEffect(() => {
    if (diagnosticosDisponibles) {
      console.log("Diagnósticos disponibles:", {
        modo,
        tipoCarga: tipoCargaActual,
        total: diagnosticosDisponibles.total_diagnosticos,
        disponible: diagnosticosDisponibles.disponible,
        diagnosticos: diagnosticosDisponibles.diagnosticos?.length || 0,
        tipoCargaData: diagnosticosDisponibles.tipo_carga,
      });
    }
    
    if (diagnosticosEnHistorial) {
      console.log("Diagnósticos en historial:", {
        total: diagnosticosEnHistorial.total_diagnosticos,
        diagnosticos: diagnosticosEnHistorial.diagnosticos?.length || 0,
      });
    }
  }, [diagnosticosDisponibles, diagnosticosEnHistorial, modo, tipoCargaActual]);

  // Determinar fuente de datos según el modo
  const diagnosticosFuente: DiagnosticoCIEData[] = useMemo(() => {
  let diagnosticosData: any;
  
  if (modo === "editar" && historialId) {
    // Modo editar: ya viene como DiagnosticosCIEResponse directo (después del hook)
    diagnosticosData = diagnosticosEnHistorial;
  } else {
    // Modo crear: diagnosticosDisponibles ya es DiagnosticosCIEResponse, usarlo directamente
    diagnosticosData = diagnosticosDisponibles;
  }
  
  // Verificar si tenemos datos válidos
  if (!diagnosticosData || !diagnosticosData.success) {
    console.log("No hay datos válidos de diagnósticos:", diagnosticosData);
    return [];
  }
  
  // Ahora diagnosticosData es DiagnosticosCIEResponse
  if (!diagnosticosData.diagnosticos || diagnosticosData.diagnosticos.length === 0) {
    return [];
  }
  
  // Mapear los diagnósticos (el resto del código permanece igual)
  return diagnosticosData.diagnosticos.map((d: any) => ({
    id: d.id || `temp-${d.diagnostico_dental_id}`,
    fecha_creacion: d.fecha_creacion || new Date().toISOString(),
    diagnostico_dental_id: d.diagnostico_dental_id,
    diagnostico_nombre: d.diagnostico_nombre,
    diagnostico_siglas: d.diagnostico_siglas,
    codigo_cie: d.codigo_cie,
    diente_fdi: d.diente_fdi,
    superficie_nombre: d.superficie_nombre,
    fecha_diagnostico: d.fecha_diagnostico,
    tipo_cie: d.tipo_cie || "PRE",
    tipo_cie_display: d.tipo_cie === "DEF" ? "Definitivo" : "Presuntivo",
    activo: d.activo !== undefined ? d.activo : true,
    descripcion: d.descripcion,
    prioridad_efectiva: d.prioridad_efectiva || 0,
    estado_tratamiento: d.estado_tratamiento || "",
  } as DiagnosticoCIEData));
}, [modo, historialId, diagnosticosDisponibles, diagnosticosEnHistorial]);

  // Clave única para selección
  const getKey = (d: DiagnosticoCIEData) =>
    `${d.diente_fdi}-${d.codigo_cie}-${d.diagnostico_dental_id}`;

  // Inicializar selección según el modo
  useEffect(() => {
    if (isInitialLoad.current && diagnosticosFuente.length > 0) {
      console.log("Inicializando selección para modo:", modo);
      
      const mapSel: SeleccionMap = {};
      
      if (modo === "crear") {
        // En modo crear: seleccionar todos los activos por defecto
        diagnosticosFuente.forEach((d) => {
          if (d.activo) {
            const key = getKey(d);
            mapSel[key] = d;
          }
        });
      } else {
        // En modo editar: seleccionar todos los que ya están en el historial
        diagnosticosFuente.forEach((d) => {
          const key = getKey(d);
          mapSel[key] = d;
        });
      }
      
      setSeleccionados(mapSel);
      onChangeDiagnosticosSeleccionados(Object.values(mapSel));
      isInitialLoad.current = false;
    }
  }, [diagnosticosFuente, modo, onChangeDiagnosticosSeleccionados]);
// useEffect(() => {
//   // Preparar estructura de datos para el formulario padre
//   const seleccionadosArray = Object.values(seleccionados);
  
//   const payloadParaFormulario = {
//     diagnosticos: seleccionadosArray.map((diag) => ({
//       diagnostico_dental_id: diag.diagnostico_dental_id,
//       tipo_cie: diag.tipo_cie || "PRE",
//     })),
//     tipo_carga: tipoCargaActual,
//   };

//   console.log("[DiagnosticosCieSection] Sincronizando con formulario padre:", {
//     cantidad_seleccionados: payloadParaFormulario.diagnosticos.length,
//     tipo_carga: payloadParaFormulario.tipo_carga,
//     primer_diagnostico: payloadParaFormulario.diagnosticos[0],
//   });

  // Notificar al componente padre usando el prop correcto
//   onChangeDiagnosticosSeleccionados(seleccionadosArray);
// }, [seleccionados, tipoCargaActual, onChangeDiagnosticosSeleccionados]);

  // useEffect(() => {
  //   const seleccionadosArray = Object.values(seleccionados);
  //   onChangeDiagnosticosSeleccionados(seleccionadosArray);
  // }, [seleccionados, onChangeDiagnosticosSeleccionados]);
useEffect(() => {
  const seleccionadosArray = Object.values(seleccionados);
  
  // Crear estructura compatible con DiagnosticosCIEResponse
  const diagnosticosResponse = {
    success: true,
    message: "Diagnósticos seleccionados",
    disponible: true,
    tipo_carga: tipoCargaActual,
    total_diagnosticos: seleccionadosArray.length,
    diagnosticos: seleccionadosArray,
    paciente_nombre: "",
    paciente_cedula: "",
    estadisticas: {
      presuntivos: seleccionadosArray.filter(d => d.tipo_cie === "PRE").length,
      definitivos: seleccionadosArray.filter(d => d.tipo_cie === "DEF").length,
    },
  };

  console.log("[DiagnosticosCieSection] Propagando cambios al formulario:", {
    cantidad: seleccionadosArray.length,
    tipo_carga: tipoCargaActual,
  });

  // Notificar al componente padre
  onChangeDiagnosticosSeleccionados(diagnosticosResponse.diagnosticos);
  
}, [seleccionados, tipoCargaActual, onChangeDiagnosticosSeleccionados]);
  // Aplicar filtros
  const diagnosticosFiltrados = useMemo(() => {
    return diagnosticosFuente.filter((diag) => {
      // Filtro por texto
      if (filtros.texto) {
        const busqueda = filtros.texto.toLowerCase();
        const textoCompleto = `
          ${diag.diagnostico_nombre?.toLowerCase() || ""}
          ${diag.diagnostico_siglas?.toLowerCase() || ""}
          ${diag.codigo_cie?.toLowerCase() || ""}
          ${diag.diente_fdi?.toLowerCase() || ""}
          ${diag.superficie_nombre?.toLowerCase() || ""}
          ${diag.descripcion?.toLowerCase() || ""}
        `;
        
        if (!textoCompleto.includes(busqueda)) return false;
      }

      // Filtro por tipo CIE
      if (filtros.tipoCIE !== "todos" && diag.tipo_cie !== filtros.tipoCIE) {
        return false;
      }

      // Filtro por diente FDI
      if (filtros.dienteFDI && diag.diente_fdi !== filtros.dienteFDI) {
        return false;
      }

      // Filtro por estado activo
      if (!filtros.mostrarInactivos && !diag.activo) {
        return false;
      }

      return true;
    });
  }, [diagnosticosFuente, filtros]);

  // Extraer dientes únicos
  const dientesUnicos = useMemo(() => {
    const dientes = diagnosticosFuente
      .map(d => d.diente_fdi)
      .filter(Boolean)
      .filter((diente, index, self) => self.indexOf(diente) === index)
      .sort((a, b) => a.localeCompare(b));
    
    return dientes;
  }, [diagnosticosFuente]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const totalDiagnosticos = diagnosticosFuente.length;
    const seleccionadosCount = Object.keys(seleccionados).length;
    const activos = diagnosticosFuente.filter(d => d.activo).length;
    const inactivos = diagnosticosFuente.filter(d => !d.activo).length;
    const presuntivos = diagnosticosFuente.filter(d => d.tipo_cie === "PRE").length;
    const definitivos = diagnosticosFuente.filter(d => d.tipo_cie === "DEF").length;
    const seleccionadosPresuntivos = Object.values(seleccionados).filter(d => d.tipo_cie === "PRE").length;
    const seleccionadosDefinitivos = Object.values(seleccionados).filter(d => d.tipo_cie === "DEF").length;

    return {
      totalDiagnosticos,
      seleccionadosCount,
      activos,
      inactivos,
      presuntivos,
      definitivos,
      seleccionadosPresuntivos,
      seleccionadosDefinitivos,
    };
  }, [diagnosticosFuente, seleccionados]);

  // Función para sincronizar diagnósticos (solo modo editar)
  const handleSincronizar = async () => {
    if (modo !== "editar" || !historialId) return;
    
    try {
      const payload: SincronizarDiagnosticosPayload = {
        diagnosticos_finales: Object.values(seleccionados).map(d => ({
          diagnostico_dental_id: d.diagnostico_dental_id,
          tipo_cie: d.tipo_cie
        })),
        tipo_carga: tipoCargaActual
      };

      await syncMutation.mutateAsync(payload);
      
      notify({
        type: "success",
        title: "Diagnósticos sincronizados",
        message: `Se guardaron ${Object.keys(seleccionados).length} diagnósticos en el historial.`,
      });

      // Refrescar datos después de sincronizar
      refetchEnHistorial();
      
    } catch (error) {
      notify({
        type: "error",
        title: "Error al sincronizar",
        message: "No se pudieron guardar los cambios en los diagnósticos.",
      });
    }
  };

  // Función para cambiar tipo de carga
  const handleCambiarTipoCarga = (tipo: "nuevos" | "todos") => {
    setTipoCargaActual(tipo);
    setFiltros(prev => ({ ...prev, mostrarInactivos: tipo === "todos" }));
    refetchDisponibles();
    // En modo crear, cambiar el tipo de carga no requiere recargar
    // En modo editar, recargaríamos desde el historial
    if (modo === "crear") {
      refetchDisponibles();
    }
  };

  const toggleSeleccion = (diag: DiagnosticoCIEData) => {
  const key = getKey(diag);
  setSeleccionados((prev) => {
    const next = { ...prev };
    if (next[key]) {
      delete next[key];
    } else {
      next[key] = diag;
    }
    
    const nextArray = Object.values(next);
    onChangeDiagnosticosSeleccionados(nextArray);
    
    return next;
  });
};

  const cambiarTipo = (diag: DiagnosticoCIEData, tipo: "PRE" | "DEF") => {
    const key = getKey(diag);
    setSeleccionados((prev) => {
      const existe = prev[key];
      if (!existe) {
        return prev;
      }
      
      const actualizado = {
        ...existe,
        tipo_cie: tipo,
        tipo_cie_display: tipo === "PRE" ? "Presuntivo" : "Definitivo",
      };
      
      return {
        ...prev,
        [key]: actualizado,
      };
    });
  };

  const cambiarTipoTodos = (tipo: "PRE" | "DEF") => {
    setSeleccionados((prev) => {
      const nuevos: SeleccionMap = {};
      Object.keys(prev).forEach(key => {
        const diag = prev[key];
        nuevos[key] = {
          ...diag,
          tipo_cie: tipo,
          tipo_cie_display: tipo === "PRE" ? "Presuntivo" : "Definitivo",
        };
      });
      return nuevos;
    });
  };

  const seleccionarTodos = () => {
  const mapSel: SeleccionMap = {};
  diagnosticosFuente.forEach((d) => {
    const key = getKey(d);
    mapSel[key] = d;
  });
  setSeleccionados(mapSel);
  onChangeDiagnosticosSeleccionados(Object.values(mapSel));
};

const deseleccionarTodos = () => {
  setSeleccionados({});
  onChangeDiagnosticosSeleccionados([]);
};

const seleccionarSoloActivos = () => {
  const mapSel: SeleccionMap = {};
  diagnosticosFuente.forEach((d) => {
    if (d.activo) {
      const key = getKey(d);
      mapSel[key] = d;
    }
  });
  setSeleccionados(mapSel);
  onChangeDiagnosticosSeleccionados(Object.values(mapSel));
};


  const resetearFiltros = () => {
    setFiltros({
      texto: "",
      tipoCIE: "todos",
      dienteFDI: "",
      mostrarInactivos: false,
    });
  };

  // Determinar estado de carga
  const isLoading = modo === "editar" ? loadingEnHistorial : loadingDisponibles;
  const error = modo === "editar" ? errorEnHistorial : errorDisponibles;

  if (isLoading) {
    return (
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-sm text-slate-600">Cargando diagnósticos CIE-10...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-slate-800">
            No hay diagnósticos CIE-10 nuevos para mostrar
          </p>
          <p className="text-sm text-slate-600 mt-1">
            En este momento no se encontraron diagnósticos CIE-10 adicionales asociados al paciente.
            Puedes intentar actualizar la lista si se han registrado nuevos diagnósticos recientemente.
          </p>
          <div className="mt-2">
            <RefreshButton
              onClick={() =>
                modo === "editar" ? refetchEnHistorial() : refetchDisponibles()
              }
              color="blue"
              size="sm"
              label="Actualizar lista"
            />
          </div>
        </div>
      </div>
    </section>
  );
}


  if (!diagnosticosFuente || diagnosticosFuente.length === 0) {
    return (
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-sm text-slate-700 mb-1">
          No se encontraron diagnósticos CIE-10.
        </p>
        <p className="text-xs text-slate-500 mb-3">
          {modo === "editar"
            ? "Este historial clínico aún no tiene diagnósticos CIE-10 asociados."
            : "No hay diagnósticos CIE-10 disponibles en el último snapshot del paciente."}
        </p>
        <div className="flex gap-2 mt-3">
          {modo === "crear" && (
            <>
              <button
                onClick={() => handleCambiarTipoCarga("nuevos")}
                className={`text-xs px-3 py-1.5 rounded-lg border ${tipoCargaActual === "nuevos" ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-slate-100 text-slate-700 border-slate-300"}`}
              >
                Nuevos
              </button>
              <button
                onClick={() => handleCambiarTipoCarga("todos")}
                className={`text-xs px-3 py-1.5 rounded-lg border ${tipoCargaActual === "todos" ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-slate-100 text-slate-700 border-slate-300"}`}
              >
                Todos
              </button>
            </>
          )}
          <RefreshButton
  onClick={() => modo === "editar" ? refetchEnHistorial() : refetchDisponibles()}
  color="rose"
  size="sm"
  label="Reintentar"
/>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      {/* Header con estadísticas */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              J. Diagnósticos CIE-10 ({modo === "crear" ? "Nuevos" : "En historial"})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {modo === "crear" 
                ? "Diagnósticos activos disponibles para cargar en el historial" 
                : "Diagnósticos actualmente en este historial clínico"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {modo === "crear" && (
              <div className="flex border border-slate-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleCambiarTipoCarga("nuevos")}
                  className={`px-3 py-1.5 text-xs ${tipoCargaActual === "nuevos" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  Nuevos
                </button>
                <button
                  type="button"
                  onClick={() => handleCambiarTipoCarga("todos")}
                  className={`px-3 py-1.5 text-xs ${tipoCargaActual === "todos" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  Todos
                </button>
              </div>
            )}
            
            {modo === "editar" && (
              <button
                type="button"
                onClick={handleSincronizar}
                disabled={syncMutation.isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg border border-emerald-700 disabled:opacity-50"
              >
                {syncMutation.isPending ? (
                  <>
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Guardar cambios
                  </>
                )}
              </button>
            )}
            
            <button
              type="button"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300"
            >
              <Filter className="h-3.5 w-3.5" />
              Filtros
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-3">
          <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
            <p className="text-[10px] text-blue-700">Total</p>
            <p className="text-sm font-semibold text-blue-900">{estadisticas.totalDiagnosticos}</p>
          </div>
          <div className="bg-violet-50 p-2 rounded-lg border border-violet-200">
            <p className="text-[10px] text-violet-700">Seleccionados</p>
            <p className="text-sm font-semibold text-violet-900">{estadisticas.seleccionadosCount}</p>
          </div>
          <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
            <p className="text-[10px] text-emerald-700">Activos</p>
            <p className="text-sm font-semibold text-emerald-900">{estadisticas.activos}</p>
          </div>
          {filtros.mostrarInactivos && (
            <div className="bg-rose-50 p-2 rounded-lg border border-rose-200">
              <p className="text-[10px] text-rose-700">Inactivos</p>
              <p className="text-sm font-semibold text-rose-900">{estadisticas.inactivos}</p>
            </div>
          )}
          <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
            <p className="text-[10px] text-amber-700">PRE</p>
            <p className="text-sm font-semibold text-amber-900">{estadisticas.presuntivos}</p>
          </div>
          <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-200">
            <p className="text-[10px] text-indigo-700">DEF</p>
            <p className="text-sm font-semibold text-indigo-900">{estadisticas.definitivos}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Búsqueda por texto */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Buscar diagnóstico
              </label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={filtros.texto}
                  onChange={(e) => setFiltros(prev => ({ ...prev, texto: e.target.value }))}
                  placeholder="Nombre, código, diente..."
                  className="pl-8 w-full text-xs border border-slate-300 rounded px-2 py-1.5"
                />
              </div>
            </div>

            {/* Filtro por tipo CIE */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tipo CIE
              </label>
              <select
                value={filtros.tipoCIE}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipoCIE: e.target.value as any }))}
                className="w-full text-xs border border-slate-300 rounded px-2 py-1.5"
              >
                <option value="todos">Todos los tipos</option>
                <option value="PRE">Presuntivos (PRE)</option>
                <option value="DEF">Definitivos (DEF)</option>
              </select>
            </div>

            {/* Filtro por diente FDI */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Diente FDI
              </label>
              <select
                value={filtros.dienteFDI}
                onChange={(e) => setFiltros(prev => ({ ...prev, dienteFDI: e.target.value }))}
                className="w-full text-xs border border-slate-300 rounded px-2 py-1.5"
              >
                <option value="">Todos los dientes</option>
                {dientesUnicos.map((diente) => (
                  <option key={diente} value={diente}>
                    Diente {diente}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={filtros.mostrarInactivos}
                  onChange={(e) => setFiltros(prev => ({ ...prev, mostrarInactivos: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Mostrar inactivos
              </label>
            </div>
          </div>

          {/* Botones de filtros */}
          <div className="flex justify-between items-center mt-3">
            <div className="text-xs text-slate-500">
              Mostrando {diagnosticosFiltrados.length} de {diagnosticosFuente.length} diagnósticos
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetearFiltros}
                className="text-xs px-3 py-1 border border-slate-300 rounded hover:bg-slate-100"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={seleccionarTodos}
          className="text-xs px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg border border-blue-300"
        >
          Seleccionar todos
        </button>
        <button
          type="button"
          onClick={seleccionarSoloActivos}
          className="text-xs px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg border border-emerald-300"
        >
          Solo activos
        </button>
        <button
          type="button"
          onClick={deseleccionarTodos}
          className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300"
        >
          Deseleccionar todos
        </button>
        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            onClick={() => cambiarTipoTodos("PRE")}
            className="text-xs px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg border border-amber-300"
          >
            Cambiar todos a PRE
          </button>
          <button
            type="button"
            onClick={() => cambiarTipoTodos("DEF")}
            className="text-xs px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg border border-indigo-300"
          >
            Cambiar todos a DEF
          </button>
        </div>
      </div>

      {/* Tabla de diagnósticos */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">Estado</th>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">Selección</th>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">Diente</th>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">Diagnóstico</th>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">CIE-10</th>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">Tipo CIE</th>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {diagnosticosFiltrados.map((diag) => {
              const key = getKey(diag);
              const seleccionado = !!seleccionados[key];
              const tipoActual = seleccionados[key]?.tipo_cie || diag.tipo_cie || "PRE";
              const tipoDisplay = tipoActual === "PRE" ? "Presuntivo" : "Definitivo";

              return (
                <tr
                  key={key}
                  className={`border-t border-slate-100 ${seleccionado ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-slate-50'} ${!diag.activo ? 'opacity-60' : ''}`}
                >
                  <td className="px-3 py-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${diag.activo ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                          title={diag.activo ? "Activo" : "Inactivo"} />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={seleccionado}
                      onChange={() => toggleSeleccion(diag)}
                      disabled={!diag.activo && modo === "crear"}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${seleccionado ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {diag.diente_fdi || "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="font-medium text-slate-800">
                        {diag.diagnostico_nombre}
                      </div>
                      {diag.diagnostico_siglas && (
                        <div className="text-[10px] text-slate-500">
                          {diag.diagnostico_siglas}
                        </div>
                      )}
                      {diag.superficie_nombre && (
                        <div className="text-[10px] text-slate-500">
                          Superficie: {diag.superficie_nombre}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">
                      {diag.codigo_cie}
                    </code>
                  </td>
                  <td className="px-3 py-2">
                    {seleccionado ? (
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tipoActual === 'PRE' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                          {tipoDisplay}
                        </span>
                        <select
                          value={tipoActual}
                          onChange={(e) => cambiarTipo(diag, e.target.value as "PRE" | "DEF")}
                          className="text-xs border border-slate-300 rounded px-1 py-0.5 ml-1"
                        >
                          <option value="PRE">Presuntivo</option>
                          <option value="DEF">Definitivo</option>
                        </select>
                      </div>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${diag.tipo_cie === 'DEF' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}`}>
                        {diag.tipo_cie === "DEF" ? "Definitivo" : "Presuntivo"}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-600 text-[11px]">
                    {diag.fecha_diagnostico
                      ? new Date(diag.fecha_diagnostico).toLocaleDateString("es-ES")
                      : "Sin fecha"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumen final */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-[10px] text-slate-500">Total encontrados</p>
            <p className="text-sm font-semibold text-slate-800">{diagnosticosFuente.length}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500">Seleccionados</p>
            <p className="text-sm font-semibold text-slate-800">{estadisticas.seleccionadosCount}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500">Presuntivos selec.</p>
            <p className="text-sm font-semibold text-amber-700">{estadisticas.seleccionadosPresuntivos}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500">Definitivos selec.</p>
            <p className="text-sm font-semibold text-indigo-700">{estadisticas.seleccionadosDefinitivos}</p>
          </div>
        </div>
        
        <p className="text-[11px] text-slate-500 mt-3">
          {modo === "crear" 
            ? `Los diagnósticos seleccionados (activos por defecto) se cargarán automáticamente al crear el historial clínico. 
               Tipo de carga actual: ${tipoCargaActual}.`
            : `Los cambios en la selección y tipos CIE se guardarán al hacer clic en "Guardar cambios". 
               Actualmente hay ${estadisticas.seleccionadosCount} diagnósticos seleccionados.`}
        </p>
      </div>
    </section>
  );
};

export default DiagnosticosCieSection;