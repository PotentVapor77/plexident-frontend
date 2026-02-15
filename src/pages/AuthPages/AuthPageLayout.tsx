import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col lg:flex-row">
      {/* Mitad izquierda - Formulario (siempre visible) */}
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          
          {/* Form Container */}
          <div className="bg-white dark:bg-gray-800 py-6 px-4 shadow sm:rounded-lg">
            {children}
          </div>

          </div>
      </div>

      {/* Mitad derecha - Imagen que cubre TODO el espacio */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <img
          src="/images/logo1/LogoLogin1.png"
          alt="Plexident Logo"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}