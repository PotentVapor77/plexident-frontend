// src/components/preview/ToothStatusDisplay.tsx
import React from "react";
import { ToothPreviewOverlay } from "./ToothPreviewOverlay";
import { useToothColorDecision } from "./hooks/useToothColorDecision";
import { useToothDiagnosticsFilter } from "./hooks/useToothDiagnosticsFilter";


// --- Tipos necesarios (Mantenemos la exportación) ---
export type Diagnostico = {
    id: string;
    procedimientoId?: string;
    siglas: string;
    nombre: string;
    prioridadKey: 'ALTA' | 'MEDIA' | 'BAJA' | 'INFORMATIVA' | 'ESTRUCTURAL';
    areas_afectadas: ('corona' | 'raiz' | 'general')[];
    categoria?: string; 
};

export type DatosDiente = {
    diagnósticos: Diagnostico[];
};

// --- Tipos de Props ---
interface ToothStatusDisplayProps {
    datosDiente: DatosDiente;
    nombreDiente: string; // Se mantiene solo para debug/contexto, ya no se usa en la lógica central
    superficieSeleccionada?: 'corona' | 'raiz';
    diagnosticoIdEnPreview?: string; 
    isToothUpper: boolean;
}

export const ToothStatusDisplay: React.FC<ToothStatusDisplayProps> = ({
    datosDiente,
    superficieSeleccionada,
    diagnosticoIdEnPreview, 
    isToothUpper,
}) => {
    
    // ********** PASO 1: Filtrado de Diagnósticos **********
    const { 
        diagnosticosFiltrados, 
        esFiltroPorSuperficie 
    } = useToothDiagnosticsFilter(
        datosDiente, 
        superficieSeleccionada, 
        diagnosticoIdEnPreview
    );

    if (!datosDiente || datosDiente.diagnósticos.length === 0 || diagnosticosFiltrados.length === 0) {
        return null;
    }

    // ********** PASO 2: Decisión de Color e Íconos **********
    const {
        svgsCorona,
        svgsRaiz,
        tooltipCorona,
        tooltipRaiz,
        colorGlobal,
        coberturaTotal,
        coberturaTotalSvg,
        coberturaTotalTooltip,
    } = useToothColorDecision(
        diagnosticosFiltrados, 
        esFiltroPorSuperficie
    );
    
    if (coberturaTotal && coberturaTotalSvg && coberturaTotalTooltip) {
        return (
            <ToothPreviewOverlay
                svgsCorona={[coberturaTotalSvg]}
                svgsRaiz={[coberturaTotalSvg]}
                tooltipCorona={coberturaTotalTooltip}
                color={colorGlobal}
                coberturaTotal={true}
                isToothUpper={isToothUpper}
            />
        );
    }
    
    // Si no hay SVGs de problemas, no renderizamos nada (solo si no es cobertura total)
    if (svgsCorona.length === 0 && svgsRaiz.length === 0) {
        return null;
    }

    // ********** PASO 3: Renderizado de Íconos de Problemas **********
    return (
        <ToothPreviewOverlay
            svgsCorona={svgsCorona}
            svgsRaiz={svgsRaiz}
            tooltipCorona={tooltipCorona}
            tooltipRaiz={tooltipRaiz}
            color={colorGlobal}
            isToothUpper={isToothUpper}
        />
    );
};