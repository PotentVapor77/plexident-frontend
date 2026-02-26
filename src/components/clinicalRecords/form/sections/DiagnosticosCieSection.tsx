// src/components/clinicalRecords/form/sections/DiagnosticosCieSection.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Filter, Pencil, RotateCcw, Save, Search } from "lucide-react";
import type {
  DiagnosticoCIEData,
  SincronizarDiagnosticosPayload,
} from "../../../../types/clinicalRecords/typeBackendClinicalRecord";
import {
  useDiagnosticosCIEAvailable,
  useDiagnosticosCIEByRecord,
  useSyncDiagnosticosCIEInRecord,
} from "../../../../hooks/clinicalRecord/useDiagnosticosCIE";
import { useNotification } from "../../../../context/notifications/NotificationContext";
import RefreshButton from "../../../ui/button/RefreshButton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Modo = "crear" | "editar";

interface DiagnosticosCieSectionProps {
  modo: Modo;
  /** Estado del historial: solo BORRADOR habilita la edición de código CIE-10 */
  estadoHistorial?: "BORRADOR" | "ABIERTO" | "CERRADO";
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

// Regex básica de validación CIE-10 en cliente
const CIE10_RE = /^[A-Z][0-9]{2}(\.[0-9A-Za-z]{1,4})?$/i;
const esCodigoCieValido = (v: string) => CIE10_RE.test(v.trim());

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DiagnosticosCieSection: React.FC<DiagnosticosCieSectionProps> = ({
  modo,
  estadoHistorial = "BORRADOR",
  pacienteId,
  historialId,
  onChangeDiagnosticosSeleccionados,
  refreshSection,
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
  const [isSaving, setIsSaving] = useState(false);
  const isInitialLoad = useRef(true);

  // Estado de edición inline de códigos CIE-10
  const [editandoCodigo, setEditandoCodigo] = useState<Record<string, string>>({});
  const [erroresCodigo, setErroresCodigo] = useState<Record<string, string>>({});

  // Solo BORRADOR permite editar los códigos
  const puedeEditarCodigo = estadoHistorial === "BORRADOR";

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  const {
    data: diagnosticosDisponibles,
    isLoading: loadingDisponibles,
    error: errorDisponibles,
    refetch: refetchDisponibles,
  } = useDiagnosticosCIEAvailable(pacienteId ?? null, tipoCargaActual);

  const {
    data: diagnosticosEnHistorial,
    isLoading: loadingEnHistorial,
    error: errorEnHistorial,
    refetch: refetchEnHistorial,
  } = useDiagnosticosCIEByRecord(historialId ?? null);

  const syncMutation = useSyncDiagnosticosCIEInRecord(historialId!);

  // ---------------------------------------------------------------------------
  // Fuente de datos normalizada
  // ---------------------------------------------------------------------------

  const diagnosticosFuente: DiagnosticoCIEData[] = useMemo(() => {
    const raw =
      modo === "editar" && historialId ? diagnosticosEnHistorial : diagnosticosDisponibles;

    if (!raw || !raw.success) return [];
    if (!raw.diagnosticos || raw.diagnosticos.length === 0) return [];

    return raw.diagnosticos.map((d: any) => ({
      id: d.id || `temp-${d.diagnostico_dental_id}`,
      fecha_creacion: d.fecha_creacion || new Date().toISOString(),
      diagnostico_dental_id: d.diagnostico_dental_id,
      diagnostico_nombre: d.diagnostico_nombre,
      diagnostico_siglas: d.diagnostico_siglas,
      codigo_cie: d.codigo_cie,                          // efectivo (personalizado o catálogo)
      codigo_cie_original: d.codigo_cie_original ?? d.codigo_cie,
      codigo_cie_personalizado: d.codigo_cie_personalizado ?? null,
      tiene_codigo_personalizado: d.tiene_codigo_personalizado ?? false,
      diente_fdi: d.diente_fdi,
      superficie_nombre: d.superficie_nombre,
      fecha_diagnostico: d.fecha_diagnostico,
      tipo_cie: d.tipo_cie || "PRE",
      tipo_cie_display: d.tipo_cie === "DEF" ? "Definitivo" : "Presuntivo",
      activo: d.activo !== undefined ? d.activo : true,
      descripcion: d.descripcion,
      prioridad_efectiva: d.prioridad_efectiva || 0,
      estado_tratamiento: d.estado_tratamiento || "",
    } as any));
  }, [modo, historialId, diagnosticosDisponibles, diagnosticosEnHistorial]);

  const getKey = (d: DiagnosticoCIEData) =>
    `${d.diente_fdi}-${d.codigo_cie}-${d.diagnostico_dental_id}`;

  // ---------------------------------------------------------------------------
  // Inicializar selección
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (isInitialLoad.current && diagnosticosFuente.length > 0) {
      const mapSel: SeleccionMap = {};
      if (modo === "crear") {
        diagnosticosFuente.forEach((d) => { if (d.activo) mapSel[getKey(d)] = d; });
      } else {
        diagnosticosFuente.forEach((d) => { mapSel[getKey(d)] = d; });
      }
      setSeleccionados(mapSel);
      onChangeDiagnosticosSeleccionados(Object.values(mapSel));
      isInitialLoad.current = false;
    }
  }, [diagnosticosFuente, modo, onChangeDiagnosticosSeleccionados]);

  useEffect(() => {
    onChangeDiagnosticosSeleccionados(Object.values(seleccionados));
  }, [seleccionados, tipoCargaActual, onChangeDiagnosticosSeleccionados]);

  // ---------------------------------------------------------------------------
  // Filtros y stats
  // ---------------------------------------------------------------------------

  const diagnosticosFiltrados = useMemo(() => {
    return diagnosticosFuente.filter((d) => {
      if (filtros.texto) {
        const b = filtros.texto.toLowerCase();
        const t = `${d.diagnostico_nombre ?? ""} ${d.diagnostico_siglas ?? ""} ${d.codigo_cie ?? ""} ${d.diente_fdi ?? ""} ${d.superficie_nombre ?? ""}`.toLowerCase();
        if (!t.includes(b)) return false;
      }
      if (filtros.tipoCIE !== "todos" && d.tipo_cie !== filtros.tipoCIE) return false;
      if (filtros.dienteFDI && d.diente_fdi !== filtros.dienteFDI) return false;
      if (!filtros.mostrarInactivos && !d.activo) return false;
      return true;
    });
  }, [diagnosticosFuente, filtros]);

  const dientesUnicos = useMemo(() =>
    [...new Set(diagnosticosFuente.map((d) => d.diente_fdi).filter(Boolean))].sort(),
    [diagnosticosFuente]
  );

  const estadisticas = useMemo(() => {
    const sel = Object.values(seleccionados);
    return {
      totalDiagnosticos: diagnosticosFuente.length,
      seleccionadosCount: sel.length,
      seleccionadosPresuntivos: sel.filter((d) => d.tipo_cie === "PRE").length,
      seleccionadosDefinitivos: sel.filter((d) => d.tipo_cie === "DEF").length,
    };
  }, [diagnosticosFuente, seleccionados]);

  // ---------------------------------------------------------------------------
  // Acciones de selección / tipo
  // ---------------------------------------------------------------------------

  const toggleSeleccion = (diag: DiagnosticoCIEData) => {
    const key = getKey(diag);
    setSeleccionados((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key]; else next[key] = diag;
      onChangeDiagnosticosSeleccionados(Object.values(next));
      return next;
    });
  };

  const cambiarTipo = (diag: DiagnosticoCIEData, tipo: "PRE" | "DEF") => {
  const key = getKey(diag);
  setSeleccionados((prev) => {
    if (!prev[key]) return prev;
    const updated = { 
      ...prev, 
      [key]: { 
        ...prev[key], 
        tipo_cie: tipo, 
        tipo_cie_display: tipo === "PRE" ? "Presuntivo" : "Definitivo" 
      } 
    };
    onChangeDiagnosticosSeleccionados(Object.values(updated));
    return updated;
  });
};

  const cambiarTipoTodos = (tipo: "PRE" | "DEF") => {
    setSeleccionados((prev) => {
      const next: SeleccionMap = {};
      Object.keys(prev).forEach((k) => { next[k] = { ...prev[k], tipo_cie: tipo, tipo_cie_display: tipo === "PRE" ? "Presuntivo" : "Definitivo" }; });
      return next;
    });
  };

  const seleccionarTodos = () => {
    const m: SeleccionMap = {};
    diagnosticosFuente.forEach((d) => { m[getKey(d)] = d; });
    setSeleccionados(m);
    onChangeDiagnosticosSeleccionados(Object.values(m));
  };

  const deseleccionarTodos = () => { setSeleccionados({}); onChangeDiagnosticosSeleccionados([]); };

  const seleccionarSoloActivos = () => {
    const m: SeleccionMap = {};
    diagnosticosFuente.filter((d) => d.activo).forEach((d) => { m[getKey(d)] = d; });
    setSeleccionados(m);
    onChangeDiagnosticosSeleccionados(Object.values(m));
  };

  const resetearFiltros = () => setFiltros({ texto: "", tipoCIE: "todos", dienteFDI: "", mostrarInactivos: false });

  // ---------------------------------------------------------------------------
  // Edición inline de código CIE-10
  // ---------------------------------------------------------------------------

  const iniciarEdicionCodigo = useCallback((diag: any) => {
    if (!puedeEditarCodigo) return;
    const key = getKey(diag);
    const actual = (seleccionados[key] as any)?.codigo_cie_personalizado?.trim()
      || diag.codigo_cie_personalizado?.trim()
      || diag.codigo_cie || "";
    setEditandoCodigo((p) => ({ ...p, [key]: actual }));
    setErroresCodigo((p) => { const n = { ...p }; delete n[key]; return n; });
  }, [puedeEditarCodigo, seleccionados]);

  const cancelarEdicion = useCallback((key: string) => {
    setEditandoCodigo((p) => { const n = { ...p }; delete n[key]; return n; });
    setErroresCodigo((p) => { const n = { ...p }; delete n[key]; return n; });
  }, []);

  const confirmarEdicion = useCallback((diag: any, key: string) => {
  const valor = (editandoCodigo[key] ?? "").trim();

  if (valor === "") {
    // Restaurar al catálogo
    setSeleccionados((prev) => {
      if (!prev[key]) return prev;
      const updated = {
        ...prev,
        [key]: { 
          ...prev[key], 
          codigo_cie: diag.codigo_cie_original ?? diag.codigo_cie, 
          codigo_cie_personalizado: null, 
          tiene_codigo_personalizado: false 
        }
      };
      // Notificar cambios inmediatamente
      onChangeDiagnosticosSeleccionados(Object.values(updated));
      return updated;
    });
    cancelarEdicion(key);
    return;
  }

  if (!esCodigoCieValido(valor)) {
    setErroresCodigo((p) => ({ ...p, [key]: "Formato inválido. Ej: K08 o K08.1 (letra + 2 dígitos + decimales opcionales)" }));
    return;
  }

  const final = valor.toUpperCase();
  setSeleccionados((prev) => {
    if (!prev[key]) return prev;
    const updated = { 
      ...prev, 
      [key]: { 
        ...prev[key], 
        codigo_cie: final, 
        codigo_cie_personalizado: final, 
        tiene_codigo_personalizado: true 
      } 
    };
    // Notificar cambios inmediatamente
    onChangeDiagnosticosSeleccionados(Object.values(updated));
    return updated;
  });
  cancelarEdicion(key);
  notify({ type: "success", title: "Código actualizado", message: `CIE-10 cambiado a ${final}. Se persistirá al guardar.` });
}, [editandoCodigo, cancelarEdicion, notify, onChangeDiagnosticosSeleccionados]);

  const restaurarCatalogo = useCallback((diag: any, key: string) => {
  if (!puedeEditarCodigo) return;
  const original = diag.codigo_cie_original ?? diag.codigo_cie;
  setSeleccionados((prev) => {
    if (!prev[key]) return prev;
    const updated = { 
      ...prev, 
      [key]: { 
        ...prev[key], 
        codigo_cie: original, 
        codigo_cie_personalizado: null, 
        tiene_codigo_personalizado: false 
      } 
    };
    // Notificar cambios inmediatamente
    onChangeDiagnosticosSeleccionados(Object.values(updated));
    return updated;
  });
  cancelarEdicion(key);
  notify({ type: "info", title: "Código restaurado", message: `Usando código del catálogo: ${original}` });
}, [puedeEditarCodigo, cancelarEdicion, notify, onChangeDiagnosticosSeleccionados]);

  // ---------------------------------------------------------------------------
  // Guardar cambios (para modo crear)
  // ---------------------------------------------------------------------------

  const handleGuardarCambios = async () => {
    if (modo !== "crear") return;

    setIsSaving(true);
    try {
      // En modo crear, simplemente notificamos que los cambios están listos
      // El padre (ClinicalRecordForm) se encargará de guardar al hacer submit
      notify({
        type: "success",
        title: "Cambios aplicados",
        message: `${Object.keys(seleccionados).length} diagnósticos seleccionados. Se guardarán al crear el historial.`
      });

      // Llamar a refreshSection si existe para actualizar la UI
      if (refreshSection) {
        refreshSection();
      }
    } catch (error) {
      notify({
        type: "error",
        title: "Error",
        message: "No se pudieron aplicar los cambios."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Sincronizar (modo editar)
  // ---------------------------------------------------------------------------

  const handleSincronizar = async () => {
    if (modo !== "editar" || !historialId) return;

    setIsSaving(true);
    try {
      const payload: SincronizarDiagnosticosPayload = {
        diagnosticos_finales: Object.values(seleccionados).map((d: any) => ({
          diagnostico_dental_id: d.diagnostico_dental_id,
          tipo_cie: d.tipo_cie,
          ...(d.codigo_cie_personalizado ? { codigo_cie_personalizado: d.codigo_cie_personalizado } : {}),
        })),
        tipo_carga: tipoCargaActual,
      };

      await syncMutation.mutateAsync(payload);
      notify({
        type: "success",
        title: "Diagnósticos guardados",
        message: `${Object.keys(seleccionados).length} diagnósticos sincronizados.`
      });

      await refetchEnHistorial();
      if (refreshSection) refreshSection();

    } catch (error) {
      notify({
        type: "error",
        title: "Error al guardar",
        message: "No se pudieron sincronizar los diagnósticos."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCambiarTipoCarga = (tipo: "nuevos" | "todos") => {
    setTipoCargaActual(tipo);
    setFiltros((p) => ({ ...p, mostrarInactivos: tipo === "todos" }));
    if (modo === "crear") refetchDisponibles();
  };

  // ---------------------------------------------------------------------------
  // Loading / error
  // ---------------------------------------------------------------------------

  const isLoading = modo === "editar" ? loadingEnHistorial : loadingDisponibles;
  const error = modo === "editar" ? errorEnHistorial : errorDisponibles;

  if (isLoading) {
    return (
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
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
          <AlertCircle className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600">
            {modo === "editar"
              ? "Este historial no tiene diagnósticos CIE-10 cargados aún."
              : "No se encontraron diagnósticos CIE-10 para este paciente."}
          </p>
        </div>
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Diagnósticos CIE-10</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {modo === "crear"
              ? "Seleccione los diagnósticos que se incluirán en el historial."
              : "Administre los diagnósticos CIE-10 de este historial."}
          </p>
        </div>
        <div className="flex items-center gap-2">
  <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
    {(["nuevos", "todos"] as const).map((tipo) => (
      <button
        key={tipo}
        type="button"
        onClick={() => handleCambiarTipoCarga(tipo)}
        className={`px-3 py-1.5 ${tipoCargaActual === tipo ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
      >
        {tipo === "nuevos" ? "Solo nuevos" : "Todos"}
      </button>
    ))}
  </div>
          <button
    type="button"
    onClick={() => setMostrarFiltros((v) => !v)}
    className={`p-1.5 rounded-lg border ${mostrarFiltros ? "border-blue-300 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
    title="Filtros"
  >
    <Filter className="h-4 w-4" />
  </button>

          <RefreshButton
    onClick={() => modo === "editar" ? refetchEnHistorial() : refetchDisponibles()}
    size="sm"
  />

          {/* Botón de guardar SOLO en modo editar */}
          <button
    type="button"
    onClick={modo === "editar" ? handleSincronizar : handleGuardarCambios}
    disabled={modo === "editar" && syncMutation.isPending}
    className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
      modo === "editar" 
        ? "bg-blue-600 hover:bg-blue-700 text-white" 
        : "bg-emerald-600 hover:bg-emerald-700 text-white"
    } disabled:opacity-50`}
  >
    <Save className="h-3.5 w-3.5" />
    {modo === "editar" 
      ? (syncMutation.isPending ? "Guardando..." : "Guardar en Servidor") 
      : "Aplicar cambios"}
  </button>
</div>
        
      </div>

      {/* ── Aviso edición códigos ── */}
      {puedeEditarCodigo && (
        <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <Pencil className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Modo borrador:</strong> puede personalizar el código CIE-10 haciendo clic en{" "}
            <Pencil className="h-3 w-3 inline" />. Esto solo afecta a este historial; el catálogo
            y otros historiales no se modifican.
          </p>
        </div>
      )}

      {/* ── Búsqueda ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por diagnóstico, código, diente..."
          value={filtros.texto}
          onChange={(e) => setFiltros((p) => ({ ...p, texto: e.target.value }))}
          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
      </div>

      {/* ── Panel filtros ── */}
      {mostrarFiltros && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mb-1 block">Tipo CIE</label>
            <select
              value={filtros.tipoCIE}
              onChange={(e) => setFiltros((p) => ({ ...p, tipoCIE: e.target.value as any }))}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5"
            >
              <option value="todos">Todos</option>
              <option value="PRE">Presuntivos</option>
              <option value="DEF">Definitivos</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mb-1 block">Diente FDI</label>
            <select
              value={filtros.dienteFDI}
              onChange={(e) => setFiltros((p) => ({ ...p, dienteFDI: e.target.value }))}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5"
            >
              <option value="">Todos</option>
              {dientesUnicos.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.mostrarInactivos}
                onChange={(e) => setFiltros((p) => ({ ...p, mostrarInactivos: e.target.checked }))}
                className="h-3.5 w-3.5 rounded border-slate-300"
              />
              Mostrar inactivos
            </label>
          </div>
          <div className="col-span-full flex justify-between items-center">
            <span className="text-xs text-slate-500">Mostrando {diagnosticosFiltrados.length} de {diagnosticosFuente.length}</span>
            <button
              type="button"
              onClick={resetearFiltros}
              className="text-xs px-3 py-1 border border-slate-300 rounded hover:bg-slate-100"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* ── Acciones rápidas ── */}
      <div className="flex flex-wrap gap-2">
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

      {/* ── Tabla ── */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">Estado</th>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">Sel.</th>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">Diente</th>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">Diagnóstico</th>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">
                CIE-10
                {puedeEditarCodigo && <span className="ml-1 text-[10px] text-amber-600 font-normal">(editable)</span>}
              </th>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">Tipo CIE</th>
              <th className="px-3 py-2 text-left text-slate-600 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {diagnosticosFiltrados.map((diag) => {
              const key = getKey(diag);
              const seleccionado = !!seleccionados[key];
              const tipoActual = (seleccionados[key]?.tipo_cie ?? diag.tipo_cie ?? "PRE") as "PRE" | "DEF";
              const estaEditando = key in editandoCodigo;
              const errorCodigo = erroresCodigo[key];
              const diagExt = diag as any;

              // Código a mostrar: prioriza lo que está en seleccionados (puede haber sido editado)
              const codigoMostrado = (seleccionados[key] as any)?.codigo_cie ?? diag.codigo_cie;
              const tienePersonalizado = (seleccionados[key] as any)?.tiene_codigo_personalizado ?? diagExt.tiene_codigo_personalizado ?? false;
              const codigoOriginal = diagExt.codigo_cie_original ?? diag.codigo_cie;

              return (
                <tr
                  key={key}
                  className={`border-t border-slate-100 ${seleccionado ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-slate-50"} ${!diag.activo ? "opacity-60" : ""}`}
                >

                  {/* Estado */}
                  <td className="px-3 py-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${diag.activo ? "bg-emerald-500" : "bg-rose-500"}`} title={diag.activo ? "Activo" : "Inactivo"} />
                  </td>

                  {/* Checkbox */}
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={seleccionado}
                      onChange={() => toggleSeleccion(diag)}
                      disabled={!diag.activo && modo === "crear"}
                    />
                  </td>

                  {/* Diente FDI */}
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${seleccionado ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                      {diag.diente_fdi || "-"}
                    </span>
                  </td>

                  {/* Diagnóstico */}
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-800">{diag.diagnostico_nombre}</div>
                    {diag.diagnostico_siglas && <div className="text-[10px] text-slate-500">{diag.diagnostico_siglas}</div>}
                    {diag.superficie_nombre && <div className="text-[10px] text-slate-500">Sup.: {diag.superficie_nombre}</div>}
                  </td>

                  {/* ── CIE-10 editable ── */}
                  <td className="px-3 py-2 min-w-[160px]">
                    {estaEditando ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editandoCodigo[key]}
                            onChange={(e) => setEditandoCodigo((p) => ({ ...p, [key]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") confirmarEdicion(diagExt, key);
                              if (e.key === "Escape") cancelarEdicion(key);
                            }}
                            placeholder={codigoOriginal}
                            maxLength={10}
                            autoFocus
                            className={`w-24 px-2 py-0.5 border rounded font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${errorCodigo ? "border-rose-400 bg-rose-50" : "border-slate-300"}`}
                          />
                          <button
                            type="button"
                            onClick={() => confirmarEdicion(diagExt, key)}
                            className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] hover:bg-blue-700"
                            title="Confirmar (Enter)"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelarEdicion(key)}
                            className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] hover:bg-slate-300"
                            title="Cancelar (Esc)"
                          >
                            ✗
                          </button>
                        </div>
                        {errorCodigo && <p className="text-[10px] text-rose-600">{errorCodigo}</p>}
                        <p className="text-[10px] text-slate-400">Original: <code>{codigoOriginal}</code> · Vacío=restaurar</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 flex-wrap">
                        <code
                          className={`px-1.5 py-0.5 rounded font-mono ${tienePersonalizado ? "bg-amber-100 ring-1 ring-amber-300 text-amber-900" : "bg-slate-100 text-slate-700"}`}
                          title={tienePersonalizado ? `Personalizado · original: ${codigoOriginal}` : "Código del catálogo"}
                        >
                          {codigoMostrado}
                        </code>

                        {puedeEditarCodigo && (
                          <>
                            <button
                              type="button"
                              onClick={() => iniciarEdicionCodigo(diagExt)}
                              className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
                              title="Editar código CIE-10"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            {tienePersonalizado && (
                              <button
                                type="button"
                                onClick={() => restaurarCatalogo(diagExt, key)}
                                className="p-0.5 text-amber-500 hover:text-slate-600 rounded transition-colors"
                                title={`Restaurar código del catálogo (${codigoOriginal})`}
                              >
                                <RotateCcw className="h-3 w-3" />
                              </button>
                            )}
                          </>
                        )}

                        {tienePersonalizado && (
                          <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1">editado</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Tipo CIE */}
                  <td className="px-3 py-2">
                    {seleccionado ? (
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tipoActual === "PRE" ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-800"}`}>
                          {tipoActual === "PRE" ? "Presuntivo" : "Definitivo"}
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
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${diag.tipo_cie === "DEF" ? "bg-indigo-100 text-indigo-800" : "bg-amber-100 text-amber-800"}`}>
                        {diag.tipo_cie === "DEF" ? "Definitivo" : "Presuntivo"}
                      </span>
                    )}
                  </td>

                  {/* Fecha */}
                  <td className="px-3 py-2 text-slate-600 text-[11px]">
                    {diag.fecha_diagnostico ? new Date(diag.fecha_diagnostico).toLocaleDateString("es-ES") : "Sin fecha"}
                  </td>
                </tr>
              );
            })}

            {diagnosticosFiltrados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-400">
                  No hay diagnósticos que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Resumen ── */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><p className="text-[10px] text-slate-500">Total encontrados</p><p className="text-sm font-semibold text-slate-800">{estadisticas.totalDiagnosticos}</p></div>
          <div><p className="text-[10px] text-slate-500">Seleccionados</p><p className="text-sm font-semibold text-slate-800">{estadisticas.seleccionadosCount}</p></div>
          <div><p className="text-[10px] text-slate-500">Presuntivos selec.</p><p className="text-sm font-semibold text-amber-700">{estadisticas.seleccionadosPresuntivos}</p></div>
          <div><p className="text-[10px] text-slate-500">Definitivos selec.</p><p className="text-sm font-semibold text-indigo-700">{estadisticas.seleccionadosDefinitivos}</p></div>
        </div>
        <p className="text-[11px] text-slate-500 mt-3">
          {modo === "crear"
            ? `Los diagnósticos seleccionados se cargarán al crear el historial. Tipo de carga: ${tipoCargaActual}.`
            : `Los cambios se guardan al hacer clic en "Guardar cambios". ${estadisticas.seleccionadosCount} diagnósticos seleccionados.`}
        </p>
      </div>
    </section>
  );
};

export default DiagnosticosCieSection;