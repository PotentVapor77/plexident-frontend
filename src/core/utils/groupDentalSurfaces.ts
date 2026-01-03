// src/core/utils/groupDentalSurfaces.ts
export type GroupedSurface =
    | {
        type: "group";
        label: string;
        surfaces: string[];
        isRoot: boolean;
    }
    | {
        type: "single";
        label: string;
        surface: string;
        isRoot: boolean;
    };

export const CROWN_SURFACES = [
    "cara_oclusal",
    "cara_vestibular",
    "cara_distal",
    "cara_mesial",
    "cara_lingual",
] as const;

export const ROOT_SURFACES_BY_TYPE: Record<string, string[]> = {
    raiz_molar_superior: [
        "raiz:raiz-mesial",
        "raiz:raiz-distal",
        "raiz:raiz-palatal",
    ],
    raiz_molar_inferior: [
        "raiz:raiz-mesial",
        "raiz:raiz-distal",
    ],
    raiz_premolar: [
        "raiz:raiz-vestibular",
        "raiz:raiz-palatal",
    ],
    raiz_canino: ["raiz:raiz-principal"],
    raiz_incisivo: ["raiz:raiz-principal"],
    raiz_dental: ["raiz:raiz-principal"],
};
const ROOT_COUNT_BY_TYPE: Record<string, number> = {
    raiz_molar_superior: 3,   // mesial, distal, palatal
    raiz_molar_inferior: 2,   // mesial, distal
    raiz_premolar: 2,         // vestibular, palatal
    raiz_canino: 1,           // principal
    raiz_incisivo: 1,         // principal
    raiz_dental: 1,           // fallback
};
const normalize = (s: string) => {
    let normalized = s.toLowerCase();
    // Reemplazar todos los separadores
    normalized = normalized.replace(/[-_:]/g, "_");
    // Eliminar prefijo duplicado "raiz_raiz_" -> "raiz_"
    normalized = normalized.replace(/^raiz_raiz_/, "raiz_");
    return normalized;
};

const includesNormalized = (arr: string[], value: string) =>
    arr.map(normalize).includes(normalize(value));

const formatSurfaceLabel = (surface: string, isRoot: boolean): string => {
    let clean = surface;

    if (isRoot) {
        clean = clean.replace(/^raiz[:-]/, "");
    } else {
        clean = clean.replace(/^cara_/, "");
    }

    return clean
        .replace(/[-_:]/g, " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
};

export function groupDentalSurfaces(
    selectedSurfaces: string[],
    rootType?: string | null,
): GroupedSurface[] {
    if (!selectedSurfaces?.length) return [];

    const result: GroupedSurface[] = [];

    const crownSurfaces = selectedSurfaces.filter((s) => s.startsWith("cara_"));
    const hasAllCrown = CROWN_SURFACES.length > 0 &&
        CROWN_SURFACES.every((cs) => includesNormalized(crownSurfaces, cs));

    if (hasAllCrown) {
        result.push({
            type: "group" as const,
            label: "Corona completa",
            surfaces: crownSurfaces,
            isRoot: false,
        });
    } else {
        crownSurfaces.forEach((surface) =>
            result.push({
                type: "single" as const,
                label: formatSurfaceLabel(surface, false),
                surface,
                isRoot: false,
            }),
        );
    }
    const rootSurfaces = selectedSurfaces.filter(
        s => s.startsWith("raiz:")
    );

    const normalizedRootType = normalize(rootType || "raiz_dental");

    const expectedRootSurfaces =
        Object.entries(ROOT_SURFACES_BY_TYPE).find(
            ([key]) => normalize(key) === normalizedRootType
        )?.[1] ?? ROOT_SURFACES_BY_TYPE.raiz_dental;

    const hasAllRoot =
        expectedRootSurfaces.length > 0 &&
        expectedRootSurfaces.every(rs =>
            rootSurfaces.some(sel => normalize(sel) === normalize(rs))
        ) &&
        rootSurfaces.length === expectedRootSurfaces.length;

    console.log("DEBUG RAÍZ:", {
        rootType,
        expected: expectedRootSurfaces,
        actual: rootSurfaces,
        hasAllRoot,
        normalizedExpected: expectedRootSurfaces.map(normalize),
        normalizedActual: rootSurfaces.map(normalize)
    });

    if (hasAllRoot) {
        result.push({
            type: "group" as const,
            label: "Raíz completa",
            surfaces: rootSurfaces,
            isRoot: true,
        });
    } else {
        rootSurfaces.forEach((surface) =>
            result.push({
                type: "single" as const,
                label: formatSurfaceLabel(surface, true),
                surface,
                isRoot: true,
            }),
        );
    }

    //console.log(" RESULTADO:", result);
    return result;
}

export function formatSurfacesForUI(groupedSurfaces: GroupedSurface[]): string {
    if (!groupedSurfaces.length) return "";
    return groupedSurfaces.map((gs) => gs.label).join(", ");
}
