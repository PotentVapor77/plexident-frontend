// src/components/vitalSigns/forms/VitalSignsForm.tsx
// Wrapper sencillo por si quieres usar el formulario standalone

import type { IVitalSignsCreate } from "../../../../types/vitalSigns/IVitalSigns"; // [file:1]
import { VitalSignsFormFields } from "./VitalSignsFormFields";

interface VitalSignsFormProps {
  formData: IVitalSignsCreate;
  onChange: (field: keyof IVitalSignsCreate, value: string | number | null) => void;
  errors: Record<string, string>;
  mode: "create" | "edit";
  activo?: boolean;
  onActivoChange?: (checked: boolean) => void;
}

export function VitalSignsForm({
  formData,
  onChange,
  errors,
  mode,
  activo = true,
  onActivoChange,
}: VitalSignsFormProps) {
  return (
    <VitalSignsFormFields
      formData={formData}
      onChange={onChange}
      errors={errors}
      mode={mode}
      activo={activo}
      onActivoChange={onActivoChange}
    />
  );
}
