// src/components/odontogram/diagnostic/DiagnosticoSelect.tsx

import type { Dispatch, SetStateAction } from "react";
import type {
  OdontoColorKey,
  AreaAfectada,
  DiagnosticoCategory,
} from "../../../core/types/typeOdontograma";

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
  onPreviewOptionsChange: Dispatch<SetStateAction<Record<string, any>>>;

  currentArea: PrincipalArea;
  categorias: DiagnosticoCategory[];

  onFormValidChange?: (isValid: boolean) => void;
};

export type { DiagnosticoSelectProps };

export const DiagnosticoSelect = (props: DiagnosticoSelectProps) => {
  const diagnosticoLogic = useDiagnosticoSelect(props);

  return (
    <DiagnosticoSelectUI
      {...diagnosticoLogic}
      currentArea={props.currentArea}
      onFormValidChange={props.onFormValidChange}
    />
  );
};