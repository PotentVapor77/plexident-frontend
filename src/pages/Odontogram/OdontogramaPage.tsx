// src/pages/Odontogram/OdontogramaPage.tsx
import { useEffect, useState } from "react";
import { OdontogramaViewer } from "../../components/odontogram";
import { PacienteProvider } from "../../context/PacienteContext";
import { useClinicalFiles } from "../../hooks/clinicalFiles/useClinicalFiles";
import { ClinicalFilesContainer } from "../../components/odontogram/files/ClinicalFilesContainer";
import { ClinicalFilesProvider } from "../../context/ClinicalFilesContext";

const OdontogramaInner = () => {
    const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
    const [isFilePanelOpen, setIsFilePanelOpen] = useState(false);

    const {
        pendingFiles,
    } = useClinicalFiles();

    useEffect(() => {
        const el = document.getElementById("layout-content");
        if (!el) return;

        const prev = {
            padding: el.style.padding,
            maxWidth: el.style.maxWidth,
            overflow: el.style.overflow,
        };

        el.style.padding = "0";
        el.style.maxWidth = "100%";
        el.style.overflow = "hidden";

        return () => {
            el.style.padding = prev.padding;
            el.style.maxWidth = prev.maxWidth;
            el.style.overflow = prev.overflow;
        };
    }, []);

    return (
        <div
            id="odontograma-root"
            className="relative w-full h-[calc(100vh-5.3rem)] overflow-hidden rounded-xl bg-white shadow-sm"

        >
            <OdontogramaViewer
                onSelectTooth={setSelectedTooth}
                freezeResize={false}
                onOpenFileUpload={() => setIsFilePanelOpen((prev) => !prev)}
                pendingFilesCount={pendingFiles.length}
            />

            <ClinicalFilesContainer
                isOpen={isFilePanelOpen}
                onClose={() => setIsFilePanelOpen(false)}
            />
        </div>
    );
};

const OdontogramaPage = () => {
    return (
        <PacienteProvider>
            <ClinicalFilesProvider>
                <OdontogramaInner />
            </ClinicalFilesProvider>

        </PacienteProvider>
    );
};

export default OdontogramaPage;
