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
      className={`
    absolute bottom-6 right-[330px] z-40
    bg-white/90 backdrop-blur-md
    border border-gray-200 rounded-xl shadow-theme-md
    transition-[width,height,opacity,transform] duration-300 ease-out
    ${
      collapsed
        ? "w-[180px] h-[52px] opacity-80 hover:opacity-100"
        : "w-[420px] max-h-[60vh]"
    }
  `}
    >
      {/* Encabezado */}
      <div
  className={`flex items-center justify-between gap-2 px-4 py-3 ${
    collapsed ? "border-0" : "border-b border-gray-200"
  }`}
>
  <h3 className="text-sm font-semibold text-gray-900 truncate">
    {collapsed
      ? `#${toothTranslations[selectedTooth]?.numero} · ${groupedDiags.length}`
      : nombreDiente}
  </h3>

  <button
    onClick={() => setCollapsed(c => !c)}
    className={`
      flex items-center justify-center rounded-lg border transition
      ${
        collapsed
          ? "w-7 h-7 bg-brand-50 text-brand-500 border-brand-200 hover:bg-brand-100"
          : "w-8 h-8 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
      }
    `}
    title={collapsed ? "Expandir" : "Minimizar"}
  >
    {collapsed ? "+" : "−"}
  </button>
</div>


      {!collapsed && (
        <ul
  className="
    grid gap-3 px-4 pb-4
    grid-cols-[repeat(auto-fit,minmax(180px,1fr))]
    overflow-y-auto max-h-[50vh]
    custom-scrollbar
  "
>
          {groupedDiags.map(({ diag, references, surfaceNames }) => (
            <li
              key={`${diag.procedimientoId}-${diag.id}`}
              className="group relative p-3 bg-white border border-gray-200 rounded-xl shadow-theme-xs hover:shadow-theme-sm transition"
            >
              {/* Encabezado */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span
                    className="text-sm font-semibold capitalize leading-tight"
                    style={{ color: diag.colorHex }}
                  >
                    {diag.procedimientoId?.replace(/_/g, " ") || "Sin especificar"}
                  </span>

                  <span className="text-[11px] text-gray-500 mt-0.5">
                    {describeSurfaces(surfaceNames)}
                  </span>
                </div>

                <span
                  className="mt-1 w-3 h-3 rounded-full border border-gray-300 shrink-0"
                  style={{ backgroundColor: diag.colorHex || "#999" }}
                />
              </div>

              {/* Descripción */}
              {diag.descripcion && (
                <p className="text-xs text-gray-600 mt-2 italic line-clamp-3">
                  “{diag.descripcion}”
                </p>
              )}

              {/* Acciones */}
              <div className="flex justify-end mt-3 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => {
  if (!confirm("¿Eliminar este diagnóstico del diente?")) return;
  references.forEach(({ surfaceId, diagId }) =>
    removeDiagnostico(selectedTooth!, surfaceId, diagId)
  );
}}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};