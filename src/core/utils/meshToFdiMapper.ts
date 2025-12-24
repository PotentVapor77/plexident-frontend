// src/core/utils/meshToFdiMapper.ts

/**
 * Convierte el nombre de la malla del modelo 3D al código FDI.
 * Mapeo basado en nomenclatura: [tipo]_[posicion]_[lado]-[indice]
 */
export const meshNameToFdi = (name: string): string | null => {
    if (!name) return null;

    const n = name.toLowerCase();

    // --- CUADRANTE 1: Superior Derecho (Upper Right) ---
    if (n.startsWith("molar_upper_right-")) {
        const idx = parseInt(n.split("-")[1], 10);
        if (idx === 1) return "16";
        if (idx === 2) return "17";
        if (idx === 3) return "18";
    }
    if (n.startsWith("premolar_upper_right-")) {
        const idx = parseInt(n.split("-")[1], 10);
        return idx === 1 ? "14" : "15"; // 1 -> 14, 2 -> 15
    }
    if (n === "canine_upper_right") return "13";
    if (n.startsWith("incisor_upper_right-")) {
        const idx = parseInt(n.split("-")[1], 10);
        return idx === 1 ? "11" : "12"; // Central -> 11, Lateral -> 12
    }

    // --- CUADRANTE 2: Superior Izquierdo (Upper Left) ---
    if (n.startsWith("incisor_upper_left-")) {
        const idx = parseInt(n.split("-")[1], 10);
        return idx === 1 ? "21" : "22";
    }
    if (n === "canine_upper_left") return "23";
    if (n.startsWith("premolar_upper_left-")) {
        const idx = parseInt(n.split("-")[1], 10);
        return idx === 1 ? "24" : "25";
    }
    if (n.startsWith("molar_upper_left-")) {
        const idx = parseInt(n.split("-")[1], 10);
        if (idx === 1) return "26";
        if (idx === 2) return "27";
        if (idx === 3) return "28";
    }

    // --- CUADRANTE 3: Inferior Izquierdo (Lower Left) ---
    if (n.startsWith("incisor_lower_left-")) {
        const idx = parseInt(n.split("-")[1], 10);
        return idx === 1 ? "31" : "32";
    }
    if (n === "canine_lower_left") return "33";
    if (n.startsWith("premolar_lower_left-")) {
        const idx = parseInt(n.split("-")[1], 10);
        return idx === 1 ? "34" : "35";
    }
    if (n.startsWith("molar_lower_left-")) {
        const idx = parseInt(n.split("-")[1], 10);
        if (idx === 1) return "36";
        if (idx === 2) return "37";
        if (idx === 3) return "38";
    }

    // --- CUADRANTE 4: Inferior Derecho (Lower Right) ---
    if (n.startsWith("incisor_lower_right-")) {
        const idx = parseInt(n.split("-")[1], 10);
        return idx === 1 ? "41" : "42";
    }
    if (n === "canine_lower_right") return "43";
    if (n.startsWith("premolar_lower_right-")) {
        const idx = parseInt(n.split("-")[1], 10);
        return idx === 1 ? "44" : "45";
    }
    if (n.startsWith("molar_lower_right-")) {
        const idx = parseInt(n.split("-")[1], 10);
        if (idx === 1) return "46";
        if (idx === 2) return "47";
        if (idx === 3) return "48";
    }

    return null;
};