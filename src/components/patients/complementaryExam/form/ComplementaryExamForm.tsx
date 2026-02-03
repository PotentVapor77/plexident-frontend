// src/components/complementaryExam/form/ComplementaryExamForm.tsx

import type { UseFormReturn } from 'react-hook-form';
import { ComplementaryExamFormFields } from './ComplementaryExamFormFields';
import type { IComplementaryExamCreate } from '../../../../types/complementaryExam/IComplementaryExam';

interface ComplementaryExamFormProps {
  form: UseFormReturn<IComplementaryExamCreate>;
  mode?: 'create' | 'edit';
  activo?: boolean;
  onActivoChange?: (checked: boolean) => void;
}

export function ComplementaryExamForm({ 
  form, 
  mode = 'create',
  activo = true,
  onActivoChange 
}: ComplementaryExamFormProps) {
  return (
    <ComplementaryExamFormFields 
      form={form} 
      mode={mode}
      activo={activo}
      onActivoChange={onActivoChange}
    />
  );
}
