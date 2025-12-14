import type { Dispatch, SetStateAction } from "react";
import type { OdontoColorKey, AreaAfectada } from "../../../core/types/typeOdontograma";
import { type PrincipalArea, useDiagnosticoSelect } from "../../../hooks/odontogram/useDiagnosticoSelect";
import { DiagnosticoSelectUI } from "../selection/DiagnosticoSelectUI";



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