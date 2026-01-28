// src/components/ui/refresh/RefreshButton.tsx
import React from "react";
import { RefreshCw, Loader2 } from "lucide-react";

interface RefreshButtonProps {
  onClick: () => void;
  color?: "blue" | "green" | "rose" | "amber" | "violet";
  size?: "sm" | "md";
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  showIcon?: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  color = "blue",
  size = "md",
  label = "Actualizar",
  loading = false,
  disabled = false,
  showIcon = true,
}) => {
  // Clases de color
  const colorClasses: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200",
    green: "text-green-600 bg-green-50 hover:bg-green-100 border-green-200",
    rose: "text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200",
    amber: "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200",
    violet: "text-violet-600 bg-violet-50 hover:bg-violet-100 border-violet-200",
  };

  // Clases de tamaño
  const sizeClasses: Record<string, string> = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-xs gap-1.5",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center font-medium border rounded-lg transition-colors
        ${colorClasses[color]} 
        ${sizeClasses[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm"}
        ${loading ? "cursor-wait" : ""}
      `}
      title="Refrescar con los últimos datos guardados"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : showIcon ? (
        <RefreshCw className="h-3 w-3" />
      ) : null}
      {label}
    </button>
  );
};

export default RefreshButton;