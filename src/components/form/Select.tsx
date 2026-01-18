import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value?: string;             // ✅ Agregado: Para control externo
  defaultValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;             // ✅ Agregado: Para mostrar errores
  helperText?: string;        // ✅ Agregado: Para mensajes de ayuda
  disabled?: boolean;         // ✅ Agregado: Para deshabilitar
}

const Select: React.FC<SelectProps> = ({
  options,
  value,                    // Destructuramos value
  defaultValue = "",
  onChange,
  placeholder = "Seleccione una opción",
  className = "",
  error,
  helperText,
  disabled = false,
}) => {
  
  // Manejador interno para el evento del select nativo
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  // Determinar el valor actual: usa 'value' si existe (controlado), sino 'defaultValue'
  // Si value es undefined/null, usamos string vacío para que el select no se queje
  const currentValue = value !== undefined ? value : defaultValue;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <select
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-full px-4 py-2 text-gray-700 bg-white border rounded-lg appearance-none 
            focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors
            disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
            dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600
            ${error 
              ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:focus:border-blue-400"
            }
          `}
        >
          {/* Opción placeholder deshabilitada y oculta para que actúe como placeholder real */}
          <option value="" disabled className="text-gray-400">
            {placeholder}
          </option>
          
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Icono de flecha (chevron down) */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
              fillRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {/* Mensaje de ayuda (si no hay error) */}
      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Select;

