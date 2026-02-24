// src/core/utils/fullscreenLock.ts
//
// Solución definitiva al problema de scroll roto al navegar entre páginas.
//
// CAUSA RAÍZ DEL BUG:
// Había múltiples useEffect en OdontogramaPage y OdontogramaHistoryPage
// manipulando #layout-content directamente, compitiendo con FullScreenLayout.
// El orden de cleanup/mount en React es impredecible en navegación rápida,
// causando que los estilos quedaran en estado inconsistente.
//
// SOLUCIÓN:
// 1. Un único punto de manipulación de estilos (este módulo)
// 2. Ref-counting: los estilos solo se aplican cuando lockCount 0→1
//    y solo se restauran cuando lockCount 1→0
// 3. Snapshot del style attribute completo para restauración exacta
// 4. Los useEffect duplicados en las páginas fueron eliminados

let lockCount = 0;
let originalContainerStyle: string | null = null;
let originalBodyOverflow = "";
let originalHtmlOverflow = "";

const CONTAINER_ID = "layout-content";

function applyFullscreen() {
    const el = document.getElementById(CONTAINER_ID);
    if (!el) return;

    // Snapshot COMPLETO del atributo style antes de modificar nada
    originalContainerStyle = el.getAttribute("style") ?? "";
    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;

    el.style.setProperty("overflow", "hidden", "important");
    el.style.setProperty("padding", "0", "important");
    el.style.setProperty("height", "calc(100vh - 5.3rem)", "important");
    document.body.style.setProperty("overflow", "hidden", "important");
    document.documentElement.style.setProperty("overflow", "hidden", "important");
}

function removeFullscreen() {
    const el = document.getElementById(CONTAINER_ID);
    if (el) {
        // Restaurar el style attribute exactamente como estaba
        // setAttribute sobreescribe todo incluyendo !important
        if (originalContainerStyle) {
            el.setAttribute("style", originalContainerStyle);
        } else {
            el.removeAttribute("style");
        }
        originalContainerStyle = null;
    }

    // removeProperty es la única forma de eliminar un valor puesto con !important
    document.body.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("overflow");

    // Restaurar valores previos si los había
    if (originalBodyOverflow) document.body.style.overflow = originalBodyOverflow;
    if (originalHtmlOverflow) document.documentElement.style.overflow = originalHtmlOverflow;

    originalBodyOverflow = "";
    originalHtmlOverflow = "";
}

export function acquireFullscreenLock() {
    lockCount++;
    if (lockCount === 1) {
        applyFullscreen();
    }
}

export function releaseFullscreenLock() {
    if (lockCount <= 0) return;
    lockCount--;
    if (lockCount === 0) {
        removeFullscreen();
    }
}