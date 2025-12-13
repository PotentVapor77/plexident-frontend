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
    // 1. Usar el hook para obtener toda la lógica y estados
    const diagnosticoLogic = useDiagnosticoSelect(props);

    // 2. Renderizar el componente de UI, pasándole la lógica y las props originales que necesita
    return (
        <DiagnosticoSelectUI
            {...props}
            {...diagnosticoLogic}
        />
    );
};