// src/components/layout/FullScreenLayout.tsx
import { useEffect, useRef } from "react";

interface FullScreenLayoutProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Componente wrapper para páginas que deben ocupar toda la pantalla
 * sin generar scroll. Maneja automáticamente los estilos del layout-content.
 */
export const FullScreenLayout: React.FC<FullScreenLayoutProps> = ({
    children,
    className = "",
}) => {
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const el = document.getElementById("layout-content");
        if (!el) return;

        // Guardar estilos originales
        const originalStyles = {
            padding: el.style.padding,
            maxWidth: el.style.maxWidth,
            overflow: el.style.overflow,
            margin: el.style.margin,
            height: el.style.height,
            minHeight: el.style.minHeight,
            width: el.style.width,
        };

        // Aplicar estilos para pantalla completa
        el.style.cssText = `
      padding: 0 !important;
      max-width: 100% !important;
      overflow: hidden !important;
      margin: 0 !important;
      width: 100% !important;
      height: calc(100vh - 5.3rem) !important;
      min-height: calc(100vh - 5.3rem) !important;
    `;

        // También prevenir scroll en body/html
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        // Función de limpieza
        cleanupRef.current = () => {
            // Restaurar estilos del layout-content
            Object.assign(el.style, originalStyles);

            // Restaurar overflow del body/html
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
        };

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, []);

    return (
        <div
            className={`w-full h-full ${className}`}
            style={{
                height: 'calc(100vh - 5.3rem)',
                minHeight: 'calc(100vh - 5.3rem)'
            }}
        >
            {children}
        </div>
    );
};