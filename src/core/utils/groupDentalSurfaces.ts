// core/utils/groupDentalSurfaces.ts

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

// -----------------------------
// FUENTE ÚNICA DE SUPERFICIES
// -----------------------------

export const CROWN_SURFACES = [
    "cara_oclusal",
    "cara_vestibular",
    "cara_distal",
    "cara_mesial",
    "cara_lingual",
] as const;

export const ROOT_SURFACES_BY_TYPE: Record<string, string[]> = {
    raiz_molar_superior: [
        "raiz:raiz_mesial",
        "raiz:raiz_distal",
        "raiz:raiz_palatal",
    ],
    raiz_molar_inferior: [
        "raiz:raiz_mesial",
        "raiz:raiz_distal",
    ],
    raiz_premolar: [
        "raiz:raiz_vestibular",
        "raiz:raiz_palatal",
    ],
    raiz_canino: ["raiz:raiz_principal"],
    raiz_incisivo: ["raiz:raiz_principal"],
    raiz_dental: ["raiz:raiz_principal"],
};

// -----------------------------
// HELPERS INTERNOS
// -----------------------------

const normalize = (s: string) => s.replace(/-/g, "_");

const includesNormalized = (arr: string[], value: string) =>
    arr.map(normalize).includes(normalize(value));

// -----------------------------
// FUNCIÓN PRINCIPAL
// -----------------------------

export function groupDentalSurfaces(
    selectedSurfaces: string[],
    rootType?: string | null,
): GroupedSurface[] {
    if (!selectedSurfaces || selectedSurfaces.length === 0) return [];

    const result: GroupedSurface[] = [];

    const crownSurfaces = selectedSurfaces.filter((s) =>
        s.startsWith("cara_"),
    );

    const rootSurfaces = selectedSurfaces.filter((s) =>
        s.startsWith("raiz:"),
    );

    // -------- CORONA --------
    const hasAllCrown =
        CROWN_SURFACES.length > 0 &&
        CROWN_SURFACES.every((cs) =>
            includesNormalized(crownSurfaces, cs),
        );

    if (hasAllCrown) {
        result.push({
            type: "group",
            label: "Corona completa",
            surfaces: crownSurfaces,
            isRoot: false,
        });
    } else {
        crownSurfaces.forEach((surface) =>
            result.push({
                type: "single",
                label: surface,
                surface,
                isRoot: false,
            }),
        );
    }

    // -------- RAÍZ --------
    const expectedRootSurfaces =
        ROOT_SURFACES_BY_TYPE[rootType || "raiz_dental"] || [];

    const hasAllRoot =
  expectedRootSurfaces.length > 0 &&
  rootSurfaces.length > 0 &&
  expectedRootSurfaces.every(rs =>
    includesNormalized(rootSurfaces, rs) ||
    rootSurfaces.includes("raiz:raiz_principal")
  );

    if (hasAllRoot) {
        result.push({
            type: "group",
            label: "Raíz completa",
            surfaces: rootSurfaces,
            isRoot: true,
        });
    } else {
        rootSurfaces.forEach((surface) =>
            result.push({
                type: "single",
                label: surface,
                surface,
                isRoot: true,
            }),
        );
    }

    return result;
}
