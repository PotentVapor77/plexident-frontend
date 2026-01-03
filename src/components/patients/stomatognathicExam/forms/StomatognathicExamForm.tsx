// src/components/stomatognathicExam/forms/StomatognathicExamForm.tsx

import type { IStomatognathicExamCreate } from "../../../../types/stomatognathicExam/IStomatognathicExam";
import { StomatognathicExamFormFields } from "./StomatognathicExamFormFields";

interface StomatognathicExamFormProps {
  formData: IStomatognathicExamCreate;
  onChange: (field: keyof IStomatognathicExamCreate, value: any) => void;
  errors: Record<string, string>;
  mode: "create" | "edit";
  activo?: boolean;
  onActivoChange?: (checked: boolean) => void;
}

export function StomatognathicExamForm({
  formData,
  onChange,
  errors,
  mode,
  activo = true,
  onActivoChange,
}: StomatognathicExamFormProps) {
  return (
    <StomatognathicExamFormFields
      formData={formData}
      onChange={onChange}
      errors={errors}
      mode={mode}
      activo={activo}
      onActivoChange={onActivoChange}
    />
  );
}