// src/components/odontogram/indicator/PiezaIndicadorInput.tsx
// NUEVO: Componente para mostrar input de pieza con indicador de alternativa

import React from "react";
import { ArrowRight, Info } from "lucide-react";
import type { PiezaInfo } from "../../../types/odontogram/typeBackendOdontograma";

interface PiezaIndicadorInputProps {
  piezaOriginal: string;
  piezaInfo: PiezaInfo;
  tipo: "placa" | "calculo" | "gingivitis";
  valor: number | null;
  onChange: (valor: number | null) => void;
  disabled?: boolean;
}

const LABELS = {
  placa: "Placa",
  calculo: "Cálculo",
  gingivitis: "Gingivitis"
};

const SCALES = {
  placa: [0, 1, 2, 3],
  calculo: [0, 1, 2, 3],
  gingivitis: [0, 1]
};

const DESCRIPTIONS = {
  placa: {
    0: "Sin placa",
    1: "Placa delgada",
    2: "Placa moderada",
    3: "Placa abundante"
  },
  calculo: {
    0: "Sin cálculo",
    1: "Cálculo supragingival",
    2: "Cálculo moderado",
    3: "Cálculo abundante"
  },
  gingivitis: {
    0: "Normal",
    1: "Inflamación"
  }
};

export const PiezaIndicadorInput: React.FC<PiezaIndicadorInputProps> = ({
  piezaOriginal,
  piezaInfo,
  tipo,
  valor,
  onChange,
  disabled = false
}) => {
  const piezaUsada = piezaInfo.codigo_usado || piezaOriginal;
  const esAlternativa = piezaInfo.es_alternativa;
  const disponible = piezaInfo.disponible;

  if (!disponible) {
    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-900">
            Pieza {piezaOriginal}
          </span>
          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
            No disponible
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Esta pieza no está disponible para evaluación
        </p>
      </div>
    );
  }

  return (
    <div className={`p-3 border rounded-lg transition-colors ${
      esAlternativa 
        ? "bg-amber-50/50 border-amber-200" 
        : "bg-white border-gray-200"
    }`}>
      {/* Header con indicador de alternativa */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            Pieza {piezaOriginal}
          </span>
          
          {esAlternativa && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              <ArrowRight className="w-3 h-3" />
              <span>{piezaUsada}</span>
              <div className="group relative">
                <Info className="w-3 h-3 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                  Usando pieza {piezaUsada} como alternativa porque la pieza {piezaOriginal} no está disponible
                </div>
              </div>
            </div>
          )}
        </div>
        
        <span className="text-xs text-gray-500">{LABELS[tipo]}</span>
      </div>

      {/* Input de valores */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {SCALES[tipo].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              disabled={disabled}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                valor === option
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {option}
            </button>
          ))}
        </div>
        
        {valor !== null && (
          <p className="text-xs text-gray-600">
            {DESCRIPTIONS[tipo][valor as keyof typeof DESCRIPTIONS[typeof tipo]]}
          </p>
        )}
      </div>
    </div>
  );
};

export default PiezaIndicadorInput;