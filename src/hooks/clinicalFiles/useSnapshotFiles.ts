// src/hooks/clinicalFiles/useSnapshotFiles.ts
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api/axiosInstance';
import type { ClinicalFile } from '../../services/clinicalFiles/clinicalFilesService';


interface ApiResponse {
    success: boolean;
    status_code: number;
    message: string;
    data: {
        count: number;
        next: string | null;
        previous: string | null;
        results: ClinicalFile[];
    };
    errors: null | any;
}
interface UseSnapshotFilesOptions {
    pacienteId?: string;
    snapshotId?: string;
    enabled?: boolean;
}

export function useSnapshotFiles({
    pacienteId,
    snapshotId,
    enabled = true,
}: UseSnapshotFilesOptions) {
    const canFetch = !!pacienteId && !!snapshotId;

    const query = useQuery({
        queryKey: ['clinical-files', 'snapshot', { pacienteId, snapshotId }],
        enabled: enabled && canFetch,
        queryFn: async () => {
            console.log('[useSnapshotFiles] Fetching files for snapshot:', { pacienteId, snapshotId });
            const { data } = await api.get<ApiResponse>('/clinical-files/', {
                params: {
                    paciente_id: pacienteId,
                    snapshot_id: snapshotId
                },
            });

            console.log(' API Response:', data);

            const files = data.data?.results || [];

            console.log(` Found ${files.length} files for snapshot`);

            return files;
        },
    });

    return {
        files: (query.data ?? []) as ClinicalFile[],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}
