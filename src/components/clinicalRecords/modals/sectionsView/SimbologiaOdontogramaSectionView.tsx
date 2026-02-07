import React from "react";

export const SimbologiaOdontogramaSectionView: React.FC = () => {
  const simbolos = [
    { simbolo: "O", color: "#FF0000", desc: "Caries en superficies" },
    { simbolo: "O", color: "#0000FF", desc: "Obturado en superficies" },
    { simbolo: "A", color: "#000000", desc: "Ausente" },
    { simbolo: "X", color: "#FF0000", desc: "Extracción Indicada" },
    { simbolo: "X", color: "#0000FF", desc: "Pérdida por caries" },
    { simbolo: "ⓧ", color: "#0000FF", desc: "Pérdida (otra causa)" },
    { simbolo: "Ü", color: "#FF0000", desc: "Sellante Necesario" },
    { simbolo: "Ü", color: "#0000FF", desc: "Sellante Realizado" },
    { simbolo: "r", color: "#FF0000", desc: "Endodoncia Por Realizar" },
    { simbolo: "|", color: "#0000FF", desc: "Endodoncia Realizada" },
    { simbolo: "|", color: "#FF0000", desc: "Extraccion otra causa" },
    { simbolo: "¨-¨", color: "#FF0000", desc: "Prótesis Fija Indicada" },
    { simbolo: "¨-¨", color: "#0000FF", desc: "Prótesis Fija Realizada" },
    { simbolo: "(-)", color: "#FF0000", desc: "Prótesis Removible Indicada" },
    { simbolo: "(-)", color: "#0000FF", desc: "Prótesis Removible Realizada" },
    { simbolo: "ª", color: "#FF0000", desc: "Corona Indicada" },
    { simbolo: "ª", color: "#0000FF", desc: "Corona Realizada" },
    { simbolo: "═", color: "#FF0000", desc: "Prótesis Total Indicada" },
    { simbolo: "═", color: "#0000FF", desc: "Prótesis Total Realizada" },
    { simbolo: "✓", color: "#00AA00", desc: "Diente Sano" },
  ];

  return (
    <section className="space-y-4 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
      {/* Encabezado de sección */}
      <div className="border-b border-gray-300 pb-3">
        <h3 className="text-base font-semibold text-gray-900">
          K. Simbología del Odontograma
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Referencia de códigos y colores según estándar MSP Ecuador (Formulario 033)
        </p>
      </div>

      {/* Contenedor de la Simbología */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        {simbolos.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
          >
            <div
              className="w-7 h-7 border rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                borderColor: item.color,
                color: item.color,
                backgroundColor: `${item.color}10` // Transparencia del 10% (hex)
              }}
            >
              {item.simbolo}
            </div>
            <span className="text-[11px] leading-tight text-gray-600 font-medium">
              {item.desc}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};