// src/hooks/odontogram/useGuardarOdontogramaCompleto.ts
import { useState, useCallback } from 'react'
import { usePacienteActivo } from '../../context/PacienteContext'
import type { OdontogramaData } from '../../core/types/odontograma.types'
import { guardarOdontogramaCompleto, obtenerOdontogramaCompletoFrontend } from '../../services/odontogram/odontogramaService'
import { useOdontogramaData } from './useOdontogramaData'

export const useGuardarOdontogramaCompleto = () => {
    const [isSavingComplete, setIsSavingComplete] = useState(false)
    const [lastCompleteSave, setLastCompleteSave] = useState<Date | null>(null)
    const [saveResult, setSaveResult] = useState<any>(null)

    const { pacienteActivo } = usePacienteActivo()
    const { loadFromBackend } = useOdontogramaData()

    const guardarCompleto = useCallback(
        async (odontogramaData: OdontogramaData, 
            odontologoId?: number, 
            onSnapshotCreated?: (snapshotId: string) => Promise<void>) => {
            if (!pacienteActivo?.id) {
                throw new Error('No hay paciente activo')
            }

            setIsSavingComplete(true)

            try {
                // 1) Guardar todo el odontograma
                const resultado = await guardarOdontogramaCompleto(
                    pacienteActivo.id,
                    odontogramaData,
                    odontologoId
                );

                setSaveResult(resultado);
                setLastCompleteSave(new Date());

                // 2) Si hay callback para subir archivos con snapshot_id
                if (onSnapshotCreated && resultado.snapshot_id) {
                    await onSnapshotCreated(resultado.snapshot_id);
                }

                // 3) Recargar desde backend
                const frontendData = await obtenerOdontogramaCompletoFrontend(
                    pacienteActivo.id
                );

                if (frontendData) {
                    loadFromBackend(frontendData);
                }

                return resultado;
            } finally {
                setIsSavingComplete(false);
            }
        },
        [pacienteActivo?.id, loadFromBackend]
    )

    return {
        guardarCompleto,
        isSavingComplete,
        lastCompleteSave,
        saveResult,
        hasPacienteActivo: !!pacienteActivo?.id,
    }
}
