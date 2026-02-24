// src/pages/Odontogram/OdontogramaPage.tsx
//
// CAMBIO: Eliminado el useEffect que manipulaba #layout-content directamente.
// Eso lo maneja FullScreenLayout via fullscreenLock para evitar condiciones de carrera.

import { useState } from "react";
import { OdontogramaViewer } from "../../components/odontogram";
import { PacienteProvider } from "../../context/PacienteContext";
import { useClinicalFiles } from "../../hooks/clinicalFiles/useClinicalFiles";
import { ClinicalFilesContainer } from "../../components/odontogram/files/ClinicalFilesContainer";
import { ClinicalFilesProvider } from "../../context/ClinicalFilesContext";
import { FullScreenLayout } from "../../layout/FullScreenLayout";

const OdontogramaInner = () => {
    const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
    const [isFilePanelOpen, setIsFilePanelOpen] = useState(false);

    const { pendingFiles } = useClinicalFiles();

    return (
        <FullScreenLayout className="relative bg-white rounded-xl shadow-sm">
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
        </FullScreenLayout>
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