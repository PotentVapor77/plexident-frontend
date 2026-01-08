// src/pages/Odontogram/OdontogramaPage.tsx

import { useEffect, useState } from "react";
import { OdontogramaViewer } from "../../components/odontogram";
import { PacienteProvider } from "../../context/PacienteContext";

const OdontogramaPage = () => {
    const [selectedTooth, setSelectedTooth] = useState<string | null>(null);

    useEffect(() => {
        const el = document.getElementById("layout-content");
        if (!el) return;

        // Guardamos estilos previos
        const prev = {
            padding: el.style.padding,
            maxWidth: el.style.maxWidth,
        };

        el.style.padding = "0";
        el.style.maxWidth = "100%";

        return () => {
            el.style.padding = prev.padding;
            el.style.maxWidth = prev.maxWidth;
        };
    }, []);

    return (
        <PacienteProvider>
            <div
                id="odontograma-root"
                className="relative w-full h-[calc(100vh-4.8rem)] overflow-hidden rounded-xl bg-white shadow-sm"
            >
                <OdontogramaViewer
                    onSelectTooth={setSelectedTooth}
                    freezeResize={false}
                />
            </div>
        </PacienteProvider>
    );
};

export default OdontogramaPage;
