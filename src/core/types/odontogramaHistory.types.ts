export interface OdontogramaSnapshot {
    id: string;
    fecha: Date;
    descripcion: string;
    odontogramaData: any; // Estructura de datos del odontograma
    profesionalId: string;
    profesionalNombre: string;
}

export interface TimelineEvent {
    id: string;
    fecha: Date;
    titulo: string;
    descripcion: string;
    isActive: boolean;
}