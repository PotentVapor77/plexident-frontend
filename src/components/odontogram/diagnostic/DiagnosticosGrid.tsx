// src/components/odontograma/DiagnosticosGrid.tsx
import React, { useMemo, useState } from "react";
import { toothTranslations } from "../../../core/utils/toothTraslations";

const surfaceName = (id: string): string => {
  const names: Record<string, string> = {
    cara_vestibular: "Vestibular",
    cara_distal: "Distal",
    cara_mesial: "Mesial",
    cara_lingual: "Lingual",
    cara_oclusal: "Oclusal",
    "raiz:raiz-mesial": "Raíz Mesial",
    "raiz:raiz-distal": "Raíz Distal",
    "raiz:raiz-palatal": "Raíz Palatal",
    "raiz:raiz-vestibular": "Raíz Vestibular",
    "raiz:raiz-principal": "Raíz Principal",
  };
  if (id === 'diente_completo') return "Todo el Diente";


  return names[id] || id.replace("raiz:", "").replace(/_/g, " ");
};


type DiagnosticosGridProps = {
  selectedTooth: string | null;
  odontogramaData: Record<string, any>;
  removeDiagnostico: (toothId: string, surfaceId: string, diagId: string) => void;
};


type DiagReference = {
  surfaceId: string;
  diagId: string;
};


type GroupedEntry = {
  diag: any;
  references: DiagReference[];
  surfaceNames: string[];
};



export const DiagnosticosGrid: React.FC<DiagnosticosGridProps> = ({
  selectedTooth,
  odontogramaData,
  removeDiagnostico,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const toothData = selectedTooth ? odontogramaData[selectedTooth] : null;


  /** CORRECCIÓN: Agrupamos por contenido y guardamos las referencias únicas de eliminación. */
  const groupedDiags = useMemo(() => {
    if (!toothData) return [];


    const groups: Record<string, GroupedEntry> = {};


    Object.entries(toothData).forEach(([surfaceId, diags]) => {
      const diagList = diags as any[];


      diagList.forEach((diag: any) => {
        // Clave robusta incluyendo opciones secundarias
        const optionsString = JSON.stringify(diag.secondaryOptions || {});
        const key = `${diag.procedimientoId}-${diag.colorHex || ""}-${diag.descripcion || ""}-${optionsString}`;


        if (!groups[key]) {
          groups[key] = {
            diag,
            references: [],
            surfaceNames: [],
          };
        }


        // Almacenamos la referencia de eliminación única
        groups[key].references.push({ surfaceId, diagId: diag.id });


        // Almacenamos el nombre de la superficie para la visualización
        groups[key].surfaceNames.push(surfaceName(surfaceId));
      });
    });


    // Post-procesamiento: Eliminar nombres de superficie duplicados dentro de cada grupo
    return Object.values(groups).map(group => ({
      ...group,
      surfaceNames: Array.from(new Set(group.surfaceNames)),
    }));


  }, [toothData]);


  if (!selectedTooth || groupedDiags.length === 0) return null;


  const describeSurfaces = (surfaceNames: string[]): string => {
    // Si contiene el flag, devuelve la descripción completa
    if (surfaceNames.includes("Todo el Diente")) return "Todo el Diente";


    const allCrown = ["Vestibular", "Distal", "Mesial", "Lingual", "Oclusal"];
    const crownMatches = surfaceNames.filter(name => allCrown.includes(name));


    if (crownMatches.length === 5) {
      // Si el diagnóstico incluye las 5 caras de la corona, lo resumimos a "Toda la corona"
      const rootNames = surfaceNames.filter(name => !allCrown.includes(name));
      if (rootNames.length === 0) {
        return "Toda la corona";
      }
    }


    return surfaceNames.join(", ");
  };


  const toothInfo = toothTranslations[selectedTooth];
  const nombreDiente = toothInfo?.nombre || `Diente ${selectedTooth}`;


  return (
    <div
      className={`absolute bottom-6 right-[330px] z-40 transition-all ${collapsed ? "opacity-60 w-[140px] h-[40px]" : "w-[380px] max-h-[55vh]"
        } bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg shadow-md p-4`}
    >
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          {collapsed ? `#${toothTranslations[selectedTooth]?.numero || selectedTooth}` : nombreDiente}
        </h3>


        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-2 rounded-lg bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors flex items-center justify-center"
          title={collapsed ? "Expandir" : "Minimizar"}
        >
          {collapsed ? (
            <span className="text-xs">+</span>
          ) : (
            <span className="text-xs">−</span>
          )}
        </button>
      </div>


      {!collapsed && (
        <ul className="space-y-3 overflow-y-auto max-h-[45vh] pr-2">
          {groupedDiags.map(({ diag, references, surfaceNames }, i) => (
            <li
              key={i}
              className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-sm font-medium capitalize"
                  style={{ color: diag.colorHex }}
                >
                  {diag.procedimientoId?.replace(/_/g, " ") || "Sin especificar"}
                </span>
                <span
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: diag.colorHex || "#999" }}
                ></span>
              </div>


              <p className="text-xs text-gray-600">
                <span className="font-medium text-gray-700">Superficies:</span>{" "}
                {describeSurfaces(surfaceNames)}
              </p>


              {diag.descripcion && (
                <p className="text-xs text-gray-600 mt-2">
                  "{diag.descripcion}"
                </p>
              )}


              <div className="flex justify-end mt-3">
                <button
                  // LÓGICA DE ELIMINACIÓN CORREGIDA
                  onClick={() =>
                    references.forEach(({ surfaceId, diagId }) =>
                      removeDiagnostico(selectedTooth!, surfaceId, diagId)
                    )
                  }
                  className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 hover:text-red-700 transition-colors font-medium"
                  title="Eliminar diagnóstico"
                >
                  ✕ Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};