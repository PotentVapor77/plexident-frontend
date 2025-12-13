// src/components/preview/ToothPreviewOverlay.tsx
import React from "react";

type ToothPreviewOverlayProps = {
    svgsCorona?: React.ReactNode[]; // SVGs de la Corona (máx. 3)
    svgsRaiz?: React.ReactNode[];   // SVGs de la Raíz (máx. 3)
    tooltipCorona?: string;         // Tooltip para Corona
    tooltipRaiz?: string;           // Tooltip para Raíz
    color?: string;                 // Color principal
    coberturaTotal?: boolean;       // Cobertura completa
    isToothUpper?: boolean;
};

// --- Tooltip y contenedor de estado ---
const ContenedorEstado: React.FC<{
    children: React.ReactNode;
    tooltip?: string;
    coberturaTotal?: boolean;
}> = ({ children, tooltip, coberturaTotal = false }) => {
    if (!tooltip && !coberturaTotal) return <>{children}</>;

    return (
        <div
            className={`group relative flex justify-center items-center w-full ${
                coberturaTotal ? "h-full" : ""
            }`}
        >
            {children}
            {tooltip && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full mt-1 p-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-30 shadow-lg">
                    {tooltip}
                </span>
            )}
        </div>
    );
};

// --- Componente principal ---
export const ToothPreviewOverlay: React.FC<ToothPreviewOverlayProps> = ({
    svgsCorona,
    svgsRaiz,
    tooltipCorona,
    tooltipRaiz,
    color = "#333",
    coberturaTotal = false,
    isToothUpper = false,

}) => {
    const flexDirectionClass = isToothUpper ? "flex-col" : "flex-col-reverse";
    if (coberturaTotal) {
        return (
            <div
                // 💡 Aplicar clase condicional
                className={`absolute inset-0 flex ${flexDirectionClass} justify-between items-center select-none p-3 animate-pulse-slow`}
                style={{
                    zIndex: 25,
                    color,
                    textAlign: "center",
                    pointerEvents: "none",
                }}
            >
                {/* --- Raíz --- */}
                <ContenedorEstado tooltip={tooltipRaiz} coberturaTotal>
                    <div
                        className="flex justify-center items-center gap-1 p-1 rounded-md bg-white/70 shadow-sm pointer-events-auto"
                        style={{
                            color,
                            filter: "drop-shadow(0 0 2px rgba(0,0,0,0.2))",
                        }}
                    >
                        {svgsRaiz?.map((svg, idx) => (
                            <div
                                key={idx}
                                className="w-4 h-4 flex-shrink-0"
                                style={{ color }}
                            >
                                {svg}
                            </div>
                        ))}
                    </div>
                </ContenedorEstado>

                {/* --- Indicador central --- */}
                <div className="my-1 text-[10px] text-gray-700 bg-yellow-100 px-2 py-0.5 rounded-full font-medium shadow-sm">
                    Afecta todo el diente
                </div>

                {/* --- Corona --- */}
                <ContenedorEstado tooltip={tooltipCorona} coberturaTotal>
                    <div
                        className="flex justify-center items-center gap-1 p-1 rounded-md bg-white/70 shadow-sm pointer-events-auto"
                        style={{
                            color,
                            filter: "drop-shadow(0 0 2px rgba(0,0,0,0.2))",
                        }}
                    >
                        {svgsCorona?.map((svg, idx) => (
                            <div
                                key={idx}
                                className="w-4 h-4 flex-shrink-0"
                                style={{ color }}
                            >
                                {svg}
                            </div>
                        ))}
                    </div>
                </ContenedorEstado>
            </div>
        );
    }

    return (
        <div
            className={`absolute inset-0 flex ${flexDirectionClass} justify-between items-center select-none p-2`}
            style={{
                zIndex: 20,
                color,
                textAlign: "center",
                pointerEvents: "none",
            }}
        >
            {/* Raíz*/}
            <ContenedorEstado tooltip={tooltipRaiz}>
                <div className="flex justify-center items-center gap-0.5 mb-1 p-1 rounded-md bg-white/70 shadow-sm pointer-events-auto">
                    {svgsRaiz?.map((svg, idx) => (
                        <div key={idx} className="w-4 h-4 flex-shrink-0" style={{ color }}>
                            {svg}
                        </div>
                    ))}
                </div>
            </ContenedorEstado>

            {/* Corona */}
            <ContenedorEstado tooltip={tooltipCorona}>
                <div className="flex justify-center items-center gap-0.5 mt-1 p-1 rounded-md bg-white/70 shadow-sm pointer-events-auto">
                    {svgsCorona?.map((svg, idx) => (
                        <div key={idx} className="w-4 h-4 flex-shrink-0" style={{ color }}>
                            {svg}
                        </div>
                    ))}
                </div>
            </ContenedorEstado>
        </div>
    );
};

const style = document.createElement("style");
style.textContent = `
@keyframes pulseSlow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.03); }
}
.animate-pulse-slow {
  animation: pulseSlow 2s ease-in-out infinite;
}
`;
document.head.appendChild(style);