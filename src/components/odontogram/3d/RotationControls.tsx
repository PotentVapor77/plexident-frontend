// src/components/odontograma/RotationControls.tsx
import React from "react";

// Definición de la interfaz para las props del componente
interface RotationControlsProps {
    // Callback para aplicar la rotación: 'x' es para rotación vertical.
    onRotate: (axis: 'x', angleDelta: number) => void;
}

// Icono SVG para la Raíz (flecha hacia arriba, rota la vista hacia la raíz)
const SvgRoot = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-5 h-5"
    >
        {/* Flecha hacia arriba */}
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
);

// Icono SVG para la Corona (flecha hacia abajo, rota la vista hacia la corona)
const SvgCrown = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-5 h-5"
    >
        {/* Flecha hacia abajo */}
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const RotationControls: React.FC<RotationControlsProps> = ({ onRotate }) => {

    // Delta de rotación en radianes por cada click (aproximadamente 11.25 grados)
    const ROTATION_DELTA = Math.PI / 16; 

    const rotateX = (direction: 'up' | 'down') => {
        // En three.js, rotateUp con valor negativo (up) mueve la vista hacia la raíz.
        const angleDelta = direction === 'up' ? -ROTATION_DELTA : ROTATION_DELTA;
        onRotate('x', angleDelta);
    };

    return (
        // Contenedor flotante: Centrado verticalmente a la izquierda del Canvas.
        <div className="absolute top-1/2 -translate-y-1/2 left-2 z-10 flex flex-col items-center space-y-3">
            
            {/* Botón para enfocar la Raíz (Rotación vertical hacia arriba) */}
            <button
                className="p-1 rounded-full text-white bg-blue-500/80 hover:bg-blue-600 shadow-md transition-all duration-150 active:scale-95"
                onClick={() => rotateX('up')}
                title="Rotar para ver la Raíz"
            >
                <SvgRoot />
            </button>

            {/* Botón para enfocar la Corona (Rotación vertical hacia abajo) */}
            <button
                className="p-1 rounded-full text-white bg-orange-500/80 hover:bg-orange-600 shadow-md transition-all duration-150 active:scale-95"
                onClick={() => rotateX('down')}
                title="Rotar para ver la Corona"
            >
                <SvgCrown />
            </button>
        </div>
    );
};

export default RotationControls;