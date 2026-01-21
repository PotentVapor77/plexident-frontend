export interface OdontogramaSnapshot {
    id: string;
    version_id: string;
    fecha: Date;
    snapshotId: string; 
    descripcion: string;
    odontogramaData: any; 
    profesionalId: string;
    pacienteNombre?: string;
    profesionalNombre: string;
}

export interface TimelineEvent {
    id: string;
    fecha: Date;
    titulo: string;
    descripcion: string;
    isActive: boolean;
}

