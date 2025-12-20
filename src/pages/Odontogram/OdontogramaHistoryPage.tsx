// src/pages/odontogram/OdontogramaHistoryPage.tsx
import { OdontogramaTimeline } from "../../components/odontogram/history/OdontogramaTimeline";
import { OdontogramaHistoryViewer } from "../../components/odontogram/history/OdontogramaHistoryViewer";
import type { OdontogramaSnapshot } from "../../core/types/typeOdontogramaHistory";
import { useState, useEffect } from "react";

const MOCK_SNAPSHOTS: OdontogramaSnapshot[] = [
  {
    id: "snap-1",
    fecha: new Date(2025, 11, 17, 14, 30),
    descripcion: "Revisión inicial - Primera consulta del paciente",
    profesionalId: "prof-1",
    profesionalNombre: "María González",
    odontogramaData: {
      // Diente con caries en oclusal
      "upper_1_2": {
        "oclusal": [
          {
            id: "diag-1",
            procedimientoId: "caries_oclusal",
            colorHex: "#ef4444",
            priority: 1,
            siglas: "C",
            nombre: "Caries Oclusal",
            areas_afectadas: ["corona"],
            secondaryOptions: {},
            descripcion: "Caries detectada en superficie oclusal",
            superficieId: "oclusal",
            prioridadKey: "ALTA",
          }
        ]
      },
      // Diente con obturación antigua
      "upper_2_1": {
        "oclusal": [
          {
            id: "diag-2",
            procedimientoId: "obturacion_amalgama",
            colorHex: "#0ea5e9",
            priority: 4,
            siglas: "OA",
            nombre: "Obturación Amalgama",
            areas_afectadas: ["corona"],
            secondaryOptions: {
              material_restauracion: "Amalgama",
            },
            descripcion: "Obturación con amalgama en buen estado",
            superficieId: "oclusal",
            prioridadKey: "MEDIA",
          }
        ]
      },
      // Diente con caries mesial
      "lower_3_6": {
        "mesial": [
          {
            id: "diag-3",
            procedimientoId: "caries_proximal",
            colorHex: "#ef4444",
            priority: 1,
            siglas: "CP",
            nombre: "Caries Proximal",
            areas_afectadas: ["corona"],
            secondaryOptions: {},
            descripcion: "Caries en superficie mesial",
            superficieId: "mesial",
            prioridadKey: "ALTA",
          }
        ]
      },
    },
  },
  {
    id: "snap-2",
    fecha: new Date(2025, 11, 10, 10, 15),
    descripcion: "Post-tratamiento de caries dental",
    profesionalId: "prof-1",
    profesionalNombre: "María González",
    odontogramaData: {
      // Caries tratada - ahora tiene obturación con resina
      "upper_1_2": {
        "oclusal": [
          {
            id: "diag-4",
            procedimientoId: "obturacion_resina",
            colorHex: "#0ea5e9",
            priority: 4,
            siglas: "OR",
            nombre: "Obturación Resina",
            areas_afectadas: ["corona"],
            secondaryOptions: {
              material_restauracion: "Resina",
              estado_restauracion: "Nuevo",
            },
            descripcion: "Obturación recién realizada con resina compuesta",
            superficieId: "oclusal",
            prioridadKey: "MEDIA",
          }
        ]
      },
      // Obturación antigua sin cambios
      "upper_2_1": {
        "oclusal": [
          {
            id: "diag-2",
            procedimientoId: "obturacion_amalgama",
            colorHex: "#0ea5e9",
            priority: 4,
            siglas: "OA",
            nombre: "Obturación Amalgama",
            areas_afectadas: ["corona"],
            secondaryOptions: {
              material_restauracion: "Amalgama",
            },
            descripcion: "Obturación con amalgama en buen estado",
            superficieId: "oclusal",
            prioridadKey: "MEDIA",
          }
        ]
      },
      // Caries mesial también tratada
      "lower_3_6": {
        "mesial": [
          {
            id: "diag-5",
            procedimientoId: "obturacion_resina",
            colorHex: "#0ea5e9",
            priority: 4,
            siglas: "OR",
            nombre: "Obturación Resina",
            areas_afectadas: ["corona"],
            secondaryOptions: {
              material_restauracion: "Resina",
              estado_restauracion: "Nuevo",
            },
            descripcion: "Obturación mesial con resina",
            superficieId: "mesial",
            prioridadKey: "MEDIA",
          }
        ]
      },
    },
  },
  {
    id: "snap-3",
    fecha: new Date(2025, 10, 5, 16, 45),
    descripcion: "Evaluación ortodóntica completa",
    profesionalId: "prof-2",
    profesionalNombre: "Carlos Ramírez",
    odontogramaData: {
      "upper_1_2": {
        "oclusal": [
          {
            id: "diag-4",
            procedimientoId: "obturacion_resina",
            colorHex: "#0ea5e9",
            priority: 4,
            siglas: "OR",
            nombre: "Obturación Resina",
            areas_afectadas: ["corona"],
            secondaryOptions: {
              material_restauracion: "Resina",
              estado_restauracion: "Bueno",
            },
            descripcion: "Obturación en buen estado",
            superficieId: "oclusal",
            prioridadKey: "MEDIA",
          }
        ]
      },
      "upper_2_1": {
        "oclusal": [
          {
            id: "diag-2",
            procedimientoId: "obturacion_amalgama",
            colorHex: "#0ea5e9",
            priority: 4,
            siglas: "OA",
            nombre: "Obturación Amalgama",
            areas_afectadas: ["corona"],
            secondaryOptions: {
              material_restauracion: "Amalgama",
            },
            descripcion: "Obturación con amalgama",
            superficieId: "oclusal",
            prioridadKey: "MEDIA",
          }
        ]
      },
      // Diente ausente (extracción)
      "upper_1_3": {
        "tooth": [
          {
            id: "diag-6",
            procedimientoId: "ausente",
            colorHex: "#000000",
            priority: 5,
            siglas: "AUS",
            nombre: "Ausente",
            areas_afectadas: ["general"],
            secondaryOptions: {},
            descripcion: "Diente ausente - extracción previa",
            superficieId: "tooth",
            prioridadKey: "ESTRUCTURAL",
          }
        ]
      },
      "lower_3_6": {
        "mesial": [
          {
            id: "diag-5",
            procedimientoId: "obturacion_resina",
            colorHex: "#0ea5e9",
            priority: 4,
            siglas: "OR",
            nombre: "Obturación Resina",
            areas_afectadas: ["corona"],
            secondaryOptions: {
              material_restauracion: "Resina",
              estado_restauracion: "Bueno",
            },
            descripcion: "Obturación mesial",
            superficieId: "mesial",
            prioridadKey: "MEDIA",
          }
        ]
      },
    },
  },
  {
    id: "snap-4",
    fecha: new Date(2025, 9, 20, 9, 0),
    descripcion: "Control semestral - Estado general bueno",
    profesionalId: "prof-1",
    profesionalNombre: "María González",
    odontogramaData: {
      // Tratamiento de conducto + corona
      "upper_1_2": {
        "tooth": [
          {
            id: "diag-7",
            procedimientoId: "endodoncia",
            colorHex: "#ca8a04",
            priority: 3,
            siglas: "END",
            nombre: "Endodoncia",
            areas_afectadas: ["raiz"],
            secondaryOptions: {
              estado_procedimiento: "Completado",
            },
            descripcion: "Tratamiento de conducto realizado",
            superficieId: "tooth",
            prioridadKey: "ALTA",
          }
        ],
        "corona": [
          {
            id: "diag-8",
            procedimientoId: "corona_porcelana",
            colorHex: "#0ea5e9",
            priority: 4,
            siglas: "CP",
            nombre: "Corona Porcelana",
            areas_afectadas: ["corona"],
            secondaryOptions: {
              material_restauracion: "Porcelana",
            },
            descripcion: "Corona de porcelana sobre endodoncia",
            superficieId: "corona",
            prioridadKey: "MEDIA",
          }
        ]
      },
      "upper_2_1": {
        "oclusal": [
          {
            id: "diag-2",
            procedimientoId: "obturacion_amalgama",
            colorHex: "#0ea5e9",
            priority: 4,
            siglas: "OA",
            nombre: "Obturación Amalgama",
            areas_afectadas: ["corona"],
            secondaryOptions: {
              material_restauracion: "Amalgama",
            },
            descripcion: "Obturación con amalgama",
            superficieId: "oclusal",
            prioridadKey: "MEDIA",
          }
        ]
      },
      "upper_1_3": {
        "tooth": [
          {
            id: "diag-6",
            procedimientoId: "ausente",
            colorHex: "#000000",
            priority: 5,
            siglas: "AUS",
            nombre: "Ausente",
            areas_afectadas: ["general"],
            secondaryOptions: {},
            descripcion: "Diente ausente",
            superficieId: "tooth",
            prioridadKey: "ESTRUCTURAL",
          }
        ]
      },
      "lower_3_6": {
        "mesial": [
          {
            id: "diag-5",
            procedimientoId: "obturacion_resina",
            colorHex: "#0ea5e9",
            priority: 4,
            siglas: "OR",
            nombre: "Obturación Resina",
            areas_afectadas: ["corona"],
            secondaryOptions: {
              material_restauracion: "Resina",
              estado_restauracion: "Bueno",
            },
            descripcion: "Obturación mesial",
            superficieId: "mesial",
            prioridadKey: "MEDIA",
          }
        ]
      },
    },
  },
];

// ... resto del código del componente sin cambios


const OdontogramaHistoryPage = () => {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState(
    MOCK_SNAPSHOTS[0].id
  );
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareSnapshotId, setCompareSnapshotId] = useState<string | null>(null);

  const selectedSnapshot = MOCK_SNAPSHOTS.find(
    (s) => s.id === selectedSnapshotId
  );
  const compareSnapshot = MOCK_SNAPSHOTS.find(
    (s) => s.id === compareSnapshotId
  );

  useEffect(() => {
    const el = document.getElementById("layout-content");
    if (!el) return;

    const prev = {
      padding: el.style.padding,
      maxWidth: el.style.maxWidth,
      height: el.style.height,
      overflow: el.style.overflow,
    };

    el.style.padding = "0";
    el.style.maxWidth = "100%";
    el.style.height = "calc(100vh - 80px)";
    el.style.overflow = "hidden";

    return () => {
      el.style.padding = prev.padding;
      el.style.maxWidth = prev.maxWidth;
      el.style.height = prev.height;
      el.style.overflow = prev.overflow;
    };
  }, []);

  const handleSelectSnapshot = (id: string) => {
    if (comparisonMode && selectedSnapshotId !== id) {
      setCompareSnapshotId(id);
    } else {
      setSelectedSnapshotId(id);
      setCompareSnapshotId(null);
    }
  };

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
    if (!comparisonMode && MOCK_SNAPSHOTS.length > 1) {
      setCompareSnapshotId(MOCK_SNAPSHOTS[1].id);
    } else {
      setCompareSnapshotId(null);
    }
  };

  return (
    <div className="flex h-full w-full bg-gray-50 dark:bg-gray-900">
      {/* Timeline Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-gradient-to-br from-brand-50 to-white dark:from-gray-800 dark:to-gray-dark">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
              <svg
                className="w-5 h-5 text-brand-600 dark:text-brand-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                Historial Clínico
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {MOCK_SNAPSHOTS.length} {MOCK_SNAPSHOTS.length === 1 ? 'registro' : 'registros'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleComparisonMode}
            className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              comparisonMode
                ? "bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white shadow-lg shadow-error-500/30"
                : "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg shadow-brand-500/30"
            }`}
          >
            {comparisonMode ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar Comparación
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
                Modo Comparación
              </>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar" style={{ overflowY: 'auto' }}>
          <OdontogramaTimeline
            snapshots={MOCK_SNAPSHOTS}
            onSelectSnapshot={handleSelectSnapshot}
            selectedSnapshotId={selectedSnapshotId}
          />
        </div>
      </div>

      {/* Viewer Container */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {comparisonMode && compareSnapshot ? (
          // Modo Comparación - SIN CANVAS DUAL
          <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
            {/* Viewer Único Alternante */}
            <div className="bg-white dark:bg-gray-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 bg-blue-light-500 text-white text-sm font-bold rounded-lg shadow-sm">
                      ANTES
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-gray-800 dark:text-white">
                        {selectedSnapshot?.descripcion}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedSnapshot?.fecha.toLocaleDateString("es-EC", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} • Dr. {selectedSnapshot?.profesionalNombre}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-[400px]">
                  {selectedSnapshot && (
                    <OdontogramaHistoryViewer
                      odontogramaData={selectedSnapshot.odontogramaData}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 bg-success-500 text-white text-sm font-bold rounded-lg shadow-sm">
                      DESPUÉS
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-gray-800 dark:text-white">
                        {compareSnapshot.descripcion}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {compareSnapshot.fecha.toLocaleDateString("es-EC", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} • Dr. {compareSnapshot.profesionalNombre}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-[400px]">
                  <OdontogramaHistoryViewer
                    odontogramaData={compareSnapshot.odontogramaData}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Modo Vista Única
          <div className="flex flex-col h-full p-6">
            {selectedSnapshot && (
              <>
                <div className="mb-4 flex-shrink-0 bg-white dark:bg-gray-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {selectedSnapshot.descripcion}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {selectedSnapshot.fecha.toLocaleDateString("es-EC", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {selectedSnapshot.fecha.toLocaleTimeString("es-EC", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Dr. {selectedSnapshot.profesionalNombre}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <OdontogramaHistoryViewer
                    odontogramaData={selectedSnapshot.odontogramaData}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OdontogramaHistoryPage;
