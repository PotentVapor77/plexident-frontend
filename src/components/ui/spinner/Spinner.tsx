interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  ariaLabel?: string;
}

export default function Spinner({ 
  size = "md", 
  text = "Iniciando sesión, por favor espera...",
  ariaLabel = text
}: SpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-14 h-14 border-4"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-solid border-blue-500 border-t-transparent`}
          role="status"
          aria-label={ariaLabel}
        />
      </div>
      {text && (
        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
          {text}
        </p>
      )}
    </div>
  );
}