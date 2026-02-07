/**
 * ============================================================================
 * API CONFIGURATION -
 * ============================================================================
 */


// Base URL desde variables de entorno
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

//  YA NO NECESITAMOS STORAGE_KEYS PARA TOKENS
export const STORAGE_KEYS = {
  theme: 'plexident_theme',
  sidebar: 'plexident_sidebar_collapsed',
} as const;

// Endpoints del API
export const ENDPOINTS = {
  auth: {
    login: '/auth/login/',
    logout: '/auth/logout/',
    refresh: '/auth/refresh/',
    me: '/auth/me/',
    register: '/auth/register/',
    passwordReset: '/auth/password-reset/',
    passwordResetConfirm: '/auth/password-reset-confirm/',
  },
  users: {
    base: '/users/usuarios/',
    byId: (id: string) => `/users/usuarios/${id}/`,

  },
  patients: {
    base: '/patients/pacientes/',
    byId: (id: string) => `/patients/pacientes/${id}/`,

  },

  // ANAMNESIS GENERAL
  anamnesis: {
    base: '/patients/anamnesis-general/',
    byId: (id: string) => `/patients/anamnesis-general/${id}/`,
    byPaciente: (pacienteId: string) => `/patients/anamnesis-general/by-paciente/${pacienteId}/`,
    resumenRiesgos: (id: string) => `/patients/anamnesis-general/${id}/resumen_riesgos/`,
  },

  // ============================================================================
  // ANTECEDENTES PERSONALES (Relacionado OneToOne con Patient)
  // ============================================================================
  personalBackgrounds: {
    base: '/patients/antecedentes-personales/',
    byId: (id: string) => `/patients/antecedentes-personales/${id}/`,
    byPaciente: (pacienteId: string) => `/patients/antecedentes-personales/?paciente=${pacienteId}`,
  },



  // ============================================================================
  // ANTECEDENTES Fammiliares (Relacionado OneToOne con Patient)
  // ============================================================================
  familyBackgrounds: {
    base: '/patients/antecedentes-familiares/',
    byId: (id: string) => `/patients/antecedentes-familiares/${id}/`,
    byPaciente: (pacienteId: string) => `/patients/antecedentes-familiares/?paciente=${pacienteId}`,
  },

  // ============================================================================
  // signo vitales
  // ============================================================================
  vitalSigns: {
    base: '/patients/constantes-vitales/',
    byId: (id: string) => `/patients/constantes-vitales/${id}/`,
    byPaciente: (pacienteId: string) => `/patients/constantes-vitales/?paciente=${pacienteId}`,
  },

  stomatognathicExam: {
    base: '/patients/examen-estomatognatico/',
    byId: (id: string) => `/patients/examen-estomatognatico/${id}/`,
    byPaciente: (pacienteId: string) => `/patients/examen-estomatognatico/by-paciente/${pacienteId}/`,
    resumenPatologias: (id: string) => `/patients/examen-estomatognatico/${id}/resumen_patologias/`,
  },

  complementaryExams: {
  base: '/patients/examenes-complementarios/',
  byId: (id: string) => `/patients/examenes-complementarios/${id}/`,
},


  // ✅ CONSULTAS
  consultations: {
    base: '/patients/consultas/',
    byId: (id: string) => `/patients/consultas/${id}/`,
    byPaciente: (pacienteId: string) => `/patients/consultas/by-paciente/${pacienteId}/`,
  },



clinicalRecords: {
    base: '/clinical-records/',
    byId: (id: string) => `/clinical-records/${id}/`,
    byPaciente: (pacienteId: string) => `/clinical-records/by-paciente/?paciente_id=${pacienteId}`,
    cargarDatosIniciales: (pacienteId: string) => `/clinical-records/cargar-datos-iniciales/?paciente_id=${pacienteId}`,
    cerrar: (id: string) => `/clinical-records/${id}/cerrar/`,
    reabrir: (id: string) => `/clinical-records/${id}/reabrir/`,

    antecedentesPersonales: {
      base: '/clinical-records/antecedentes-personales/',
      latestByPaciente: (pacienteId: string) => `/clinical-records/antecedentes-personales/${pacienteId}/latest/`,
    },
    antecedentesFamiliares: {
      base: '/clinical-records/antecedentes-familiares/',
      latestByPaciente: (pacienteId: string) => `/clinical-records/antecedentes-familiares/${pacienteId}/latest/`,
    },
    constantesVitales: {
      base: '/clinical-records/constantes-vitales/',
      latestByPaciente: (pacienteId: string) => `/clinical-records/constantes-vitales/${pacienteId}/latest/`,
    },
    examenEstomatognatico: {
      base: '/clinical-records/examen-estomatognatico/',
      latestByPaciente: (pacienteId: string) => `/clinical-records/examen-estomatognatico/${pacienteId}/latest/`,
    },
    odontograma2D: {
      base: '/clinical-records/odontograma-2d/',
      latestByPaciente: (pacienteId: string) => `/clinical-records/odontograma-2d/${pacienteId}/latest/`,
    },
    indicadoresSaludBucal: {
      latestByPaciente: (pacienteId: string) =>
        `/clinical-records/indicadores-salud-bucal/${pacienteId}/latest/`,
      recargarByPaciente: (pacienteId: string) =>
        `/clinical-records/indicadores-salud-bucal/${pacienteId}/recargar/`,
      byHistorial: (historialId: string) =>
        `/clinical-records/indicadores-salud-bucal/historial/${historialId}/`,
      indicadoresPorHistorial: (historialId: string) =>
        `/clinical-records/${historialId}/indicadores-salud-bucal/`,
    },
    indicesCaries: {
      latestByPaciente: (pacienteId: string) =>
        `/clinical-records/indices-caries/${pacienteId}/latest/`,
    },
    diagnosticosCIE: {
      getAvailable: (pacienteId: string, tipocarga: "nuevos" | "todos" = "nuevos") =>
        `/clinical-records/diagnosticos-cie/?pacienteid=${pacienteId}&tipocarga=${tipocarga}`,
    },
    planTratamiento: {
      
    }
  },


  appointment: {
    citas: {
      base: '/appointment/citas/',
      byId: (id: string) => `/appointment/citas/${id}/`,
      porOdontologo: (odontologoId: string) => `/appointment/citas/por-odontologo/${odontologoId}/`,
      porSemana: '/appointment/citas/por-semana/',

      hoy: '/appointment/citas/hoy/',

      historial: (id: string) => `/appointment/citas/${id}/historial/`,
      delDia: '/appointment/citas/del-dia/',
      proximas: '/appointment/citas/proximas/',



      porPaciente: (pacienteId: string) => `/appointment/citas/by-paciente/${pacienteId}/`,
      cancelar: (id: string) => `/appointment/citas/${id}/cancelar/`,
      reprogramar: (id: string) => `/appointment/citas/${id}/reprogramar/`,
      cambiarEstado: (id: string) => `/appointment/citas/${id}/cambiar-estado/`,
      horariosDisponibles: '/appointment/citas/horarios-disponibles/',

      enviarRecordatorio: (id: string) => `/appointment/citas/${id}/recordatorio/`,
      estadisticasRecordatorios: '/appointment/citas/estadisticas-recordatorios/',

    },
    horarios: {
      base: '/appointment/horarios/',
      byId: (id: string) => `/appointment/horarios/${id}/`,
      porOdontologo: (odontologoId: string) => `/appointment/horarios/por-odontologo/${odontologoId}/`,
    },
    recordatorios: {
      base: '/appointment/recordatorio/',
      byId: (id: string) => `/appointment/recordatorio/${id}/`,
    },
  },
  dashboard: {
    stats: '/dashboard/stats/',
    overview: '/dashboard/overview/',
    kpis: '/dashboard/kpis/',
    citasStats: '/dashboard/citas-stats/',
    diagnosticosFrecuentes: '/dashboard/diagnosticos-frecuentes/',
    estadisticasIndiceCaries: '/dashboard/estadisticas-indice-caries/',
    evolucionIndiceCaries: '/dashboard/evolucion-indice-caries/',
    estadisticasAvanzadas: '/dashboard/estadisticas-avanzadas/',
    periodosDisponibles: '/dashboard/periodos-disponibles/',

  },


  odontograma: {
    base: '/patients/odontograma/',
    byId: (id: string) => `/patients/odontograma/${id}/`,
    form033: {
      base: '/patients/form-033/',
      byId: (id: string) => `/patients/form-033/${id}/`,
      byPaciente: (pacienteId: string) => `/patients/form-033/by-paciente/${pacienteId}/`,
    },
    diagnosticos: {
      base: '/patients/diagnosticos-odontograma/',
      byId: (id: string) => `/patients/diagnosticos-odontograma/${id}/`,
    },
    export: {
      jsonExport: (pacienteId: string) => `/odontogram/export/form033/${pacienteId}/json/`,
      htmlPreview: (pacienteId: string) => `/odontogram/export/form033/${pacienteId}/html/`,
      pdfDownload: (pacienteId: string) => `/odontogram/export/form033/${pacienteId}/pdf/`,
      pdfSave: (pacienteId: string) => `/odontogram/export/form033/${pacienteId}/guardar-pdf/`,
    },

    clinicalRecords: {
      base: '/clinical-records/',
      byId: (id: string) => `/clinical-records/${id}/`,
      byPaciente: (pacienteId: string) => `/clinical-records/by-paciente/?paciente_id=${pacienteId}`,
      cargarDatosIniciales: (pacienteId: string) => `/clinical-records/cargar-datos-iniciales/?paciente_id=${pacienteId}`,
      cerrar: (id: string) => `/clinical-records/${id}/cerrar/`,
      reabrir: (id: string) => `/clinical-records/${id}/reabrir/`,

      // AGREGAR ESTOS NUEVOS ENDPOINTS:
      antecedentesPersonales: {
        base: '/clinical-records/antecedentes-personales/',
        latestByPaciente: (pacienteId: string) => `/clinical-records/antecedentes-personales/${pacienteId}/latest/`,
      },
      antecedentesFamiliares: {
        base: '/clinical-records/antecedentes-familiares/',
        latestByPaciente: (pacienteId: string) => `/clinical-records/antecedentes-familiares/${pacienteId}/latest/`,
      },
      constantesVitales: {
        base: '/clinical-records/constantes-vitales/',
        latestByPaciente: (pacienteId: string) => `/clinical-records/constantes-vitales/${pacienteId}/latest/`,
      },
      examenEstomatognatico: {
        base: '/clinical-records/examen-estomatognatico/',
        latestByPaciente: (pacienteId: string) => `/clinical-records/examen-estomatognatico/${pacienteId}/latest/`,
      },
      odontograma2D: {
        base: '/clinical-records/odontograma-2d/',
        latestByPaciente: (pacienteId: string) => `/clinical-records/odontograma-2d/${pacienteId}/latest/`,
      },
      indicadoresSaludBucal: {
        latestByPaciente: (pacienteId: string) =>
          `/api/clinical-records/indicadores-salud-bucal/${pacienteId}/latest/`,
        recargarByPaciente: (pacienteId: string) =>
          `/api/clinical-records/indicadores-salud-bucal/${pacienteId}/recargar/`,
        byHistorial: (historialId: string) =>
          `/api/clinical-records/indicadores-salud-bucal/historial/${historialId}/`,
      },
      indicesCaries: {
        base: '/clinical-records/indices-caries/',
        latestByPaciente: (pacienteId: string) =>
          `/clinical-records/indices-caries/${pacienteId}/latest/`,
        saveToHistorial: (historialId: string) =>
          `/clinical-records/${historialId}/guardar-indices-caries/`,
        updateInHistorial: (historialId: string) =>
          `/clinical-records/${historialId}/actualizar-indices-caries/`,
      },
      diagnosticosCIE: {
        getAvailable: (pacienteId: string, tipocarga: "nuevos" | "todos" = "nuevos") =>
          `/clinical-records/diagnosticos-cie/?paciente_id=${pacienteId}&tipocarga=${tipocarga}`,

        loadToRecord: (historialId: string) =>
          `/clinical-records/${historialId}/cargar-diagnosticos-cie/`,

        getByRecord: (historialId: string) =>
          `/clinical-records/${historialId}/obtener-diagnosticos-cie/`,

        deleteAllFromRecord: (historialId: string) =>
          `/clinical-records/${historialId}/eliminar-diagnosticos-cie/`,

        syncInRecord: (historialId: string) =>
          `/clinical-records/${historialId}/sincronizar-diagnosticos-cie/`,

        updateType: (historialId: string, diagnosticoId: string) =>
          `/clinical-records/${historialId}/diagnosticos-cie/${diagnosticoId}/actualizar-tipo/`,

        deleteIndividual: (historialId: string, diagnosticoId: string) =>
          `/clinical-records/${historialId}/diagnosticos-cie/${diagnosticoId}/`,
      },
      planTratamiento: {
        getByHistorial: (historialId: string) => `/clinical-records/${historialId}/plan-tratamiento/`,
        getResumenCompleto: (historialId: string) => `/clinical-records/${historialId}/resumen-plan-tratamiento/`,
        getSesiones: (historialId: string) => `/clinical-records/${historialId}/sesiones-plan-tratamiento/`,
        getDatosCompletos: (historialId: string) => `/clinical-records/${historialId}/datos-completos-plan/`,
        getPlanesByPaciente: (pacienteId: string) => `/clinical-records/planes-tratamiento/?pacienteid=${pacienteId}`,
      },
      planTratamientoByHistorial: (historialId: string) =>
        `clinical-records/${historialId}/plan-tratamiento`,
      sesionesTratamientoByHistorial: (historialId: string) =>
        `/clinical-records/${historialId}/sesiones-plan-tratamiento/`,
      planesTratamientoByPaciente: (pacienteId: string) =>
        `clinical-records/planes-tratamiento?pacienteid=${pacienteId}`,
    },
  },


      // ============================================================================
  // ✅ NUEVO: MÓDULO DE PARÁMETROS (RF-07)
  // ============================================================================
  parameters: {
    // RF-07.1: Horarios de atención
    horarios: {
      base: '/parameters/config-horarios/',
      byId: (id: string) => `/parameters/config-horarios/${id}/`,
      bulkUpdate: '/parameters/config-horarios/bulk-update/',
      porDia: (diaSemana: number) => `/parameters/config-horarios/por-dia/${diaSemana}/`,
    },
    
    // RF-07.2: Diagnósticos frecuentes
    diagnosticos: {
      base: '/parameters/diagnosticos/',
      byId: (id: string) => `/parameters/diagnosticos/${id}/`,
      porCategoria: (categoria: string) => `/parameters/diagnosticos/?categoria=${categoria}`,
      search: (query: string) => `/parameters/diagnosticos/?search=${query}`,
    },
    
    // RF-07.3: Medicamentos frecuentes
    medicamentos: {
      base: '/parameters/medicamentos/',
      byId: (id: string) => `/parameters/medicamentos/${id}/`,
      porCategoria: (categoria: string) => `/parameters/medicamentos/?categoria=${categoria}`,
      porVia: (via: string) => `/parameters/medicamentos/?via_administracion=${via}`,
      search: (query: string) => `/parameters/medicamentos/?search=${query}`,
    },
    
    // RF-07.4 y RF-07.5: Configuración de seguridad
    seguridad: '/parameters/seguridad/',
    
    // RF-07.7: Configuración de notificaciones
    notificaciones: {
      base: '/parameters/notificaciones/',
      testEmail: '/parameters/notificaciones/test-email/',
      testSms: '/parameters/notificaciones/test-sms/',
    },
    
    // Parámetros generales del sistema
    general: {
      base: '/parameters/general/',
      porClave: (clave: string) => `/parameters/general/${clave}/`,
      porCategoria: (categoria: string) => `/parameters/general/?categoria=${categoria}`,
    },
  },





} as const;

// Configuración de paginación
export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
} as const;

export const TIMEOUTS = {
  api: 10000,        // 10 segundos
  fileUpload: 30000, // 30 segundos
} as const;
