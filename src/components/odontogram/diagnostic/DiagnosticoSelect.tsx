// src/components/odontogram/diagnostic/DiagnosticoSelect.tsx
import type { Dispatch, SetStateAction } from "react";
import type { OdontoColorKey, AreaAfectada, DiagnosticoCategory } from "../../../core/types/typeOdontograma";
import { DiagnosticoSelectUI, type PrincipalArea } from "..";
import { useDiagnosticoSelect } from "../../../hooks/odontogram/useDiagnosticoSelect";



type DiagnosticoSelectProps = {
    onApply: (
        diagnosticoId: string,
        colorKey: OdontoColorKey,
        atributosClinicosSeleccionados: Record<string, string>,
        descripcion: string,
        areasAfectadas: AreaAfectada[]
    ) => void;
    onCancel: () => void;
    onPreviewChange: Dispatch<SetStateAction<string | null>>;
    onPreviewOptionsChange: Dispatch<SetStateAction<Record<string, string>>>;
    currentArea: PrincipalArea;
    categorias: DiagnosticoCategory[];
};

export const DiagnosticoSelect = (props: DiagnosticoSelectProps) => {
    const diagnosticoLogic = useDiagnosticoSelect(props);

    return (
        <DiagnosticoSelectUI
            {...props}
            {...diagnosticoLogic}
        />
    );
};