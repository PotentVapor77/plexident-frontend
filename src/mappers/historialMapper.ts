// src/mappers/historialMapper.ts

import type {
    OdontogramaSnapshot,
    TimelineEvent,
} from "../core/types/odontogramaHistory.types";
import type { HistorialOdontogramaBackend } from "../types/odontogram/typeBackendOdontograma";
import type { OdontogramaData, DiagnosticoEntry } from "../core/types/odontograma.types";
import { superficieBackendToFrontend } from "./odontogramaMapper";

/**
 * Transforma datos_nuevos del historial al formato OdontogramaData
 * con todas las propiedades requeridas (colorHex, priority, etc.)
 */
function transformHistorialData(datosNuevos: Record<string, any>): OdontogramaData {
    //console.log('[MAPPER][DEBUG] datosNuevos RAW:', JSON.stringify(datosNuevos, null, 2));
    const data: OdontogramaData = {};

    Object.entries(datosNuevos).forEach(([codigoFdi, superficies]) => {
        if (!data[codigoFdi]) data[codigoFdi] = {};
        //console.log(`[MAPPER][DEBUG] Diente ${codigoFdi} superficies:`, superficies);


        Object.entries(superficies as Record<string, any[]>).forEach(
            ([nombreSuperficie, diagnosticos]) => {
                const surfaceId = superficieBackendToFrontend(nombreSuperficie);

                if (!Array.isArray(diagnosticos)) return;
                //console.log(`[MAPPER][DEBUG] Diente ${codigoFdi} superficie ${surfaceId} diagnósticos:`, diagnosticos);

                // Transformar cada diagnóstico asegurando campos requeridos
                data[codigoFdi][surfaceId] = diagnosticos.map((diag: any) => {
                    //console.log('[MAPPER][DEBUG] Diagnóstico individual:', {
                       // tiene_colorHex: !!diag.colorHex,
                       // colorHex: diag.colorHex,
                      //  todas_propiedades: Object.keys(diag)
                   // });
                    const entry: DiagnosticoEntry = {
                        id: diag.id,
                        key: diag.key || diag.procedimientoId,
                        procedimientoId: diag.procedimientoId,
                        colorHex: diag.colorHex || '#808080',
                        priority: diag.prioridad ?? diag.priority ?? 3,
                        siglas: diag.siglas || '?',
                        nombre: diag.nombre || 'Desconocido',
                        areasafectadas: diag.afectaArea || diag.areasafectadas || ['general'],
                        secondaryOptions: diag.secondaryOptions || {},
                        descripcion: diag.descripcion || '',
                        superficieId: surfaceId,
                        prioridadKey: diag.prioridadKey || 'MEDIA',
                    };

                    return entry;
                });
            }
        );
    });

    return data;
}

export function mapHistorialToSnapshots(
    historial?: HistorialOdontogramaBackend[] | null,
): OdontogramaSnapshot[] {
    if (!Array.isArray(historial)) {
        ///console.warn(
            //"[MAPPER][Historial] mapHistorialToSnapshots → historial no es array",
          //  historial,
        //);
        return [];
    }

    const soloVersiones = historial.filter(
  (h) => !!h.version_id && 
  (h.tipo_cambio === 'snapshot_completo' || h.tipo_cambio === 'SNAPSHOT_COMPLETO')
);

    //console.log("[MAPPER][Historial] soloVersiones", {
      //  rawCount: historial.length,
      //  versionedCount: soloVersiones.length,
   // });

    const grupos: Record<string, HistorialOdontogramaBackend[]> = {};

    soloVersiones.forEach((h) => {
        const key = h.version_id!;
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(h);
    });

    const snapshots: OdontogramaSnapshot[] = Object.values(grupos).map(
        (grupo) => {
            const snapshotCompleto = grupo.find(
                (h) => h.tipo_cambio === 'snapshot_completo' || 
                       h.tipo_cambio === 'SNAPSHOT_COMPLETO'
            );
            
            const first = snapshotCompleto || grupo[0];

            let datosNuevosCombinados: Record<string, any> = {};

            if (snapshotCompleto && snapshotCompleto.datos_nuevos) {
                // Usar el snapshot completo directamente
                datosNuevosCombinados = snapshotCompleto.datos_nuevos;
               // console.log("[MAPPER][Historial] Usando snapshot completo:", {
                  //  version_id: first.version_id,
                  //  dientes: Object.keys(datosNuevosCombinados).length,
               // });
            } else {
                // Fallback: Combinar todos los datos_nuevos del grupo (comportamiento anterior)
               // console.log("[MAPPER][Historial] Combinando cambios individuales:", {
                //   version_id: first.version_id,
                 //   cambios: grupo.length,
               // });
                
                grupo.forEach((h) => {
                    const datosNuevos = h.datos_nuevos || {};
                    Object.entries(datosNuevos).forEach(([codigoFdi, superficies]) => {
                        if (!datosNuevosCombinados[codigoFdi]) {
                            datosNuevosCombinados[codigoFdi] = {};
                        }
                        Object.entries(superficies as Record<string, any>).forEach(
                            ([surfaceId, lista]) => {
                                if (!datosNuevosCombinados[codigoFdi][surfaceId]) {
                                    datosNuevosCombinados[codigoFdi][surfaceId] = [];
                                }
                                
                                if (Array.isArray(lista)) {
                                    datosNuevosCombinados[codigoFdi][surfaceId] = [
                                        ...datosNuevosCombinados[codigoFdi][surfaceId],
                                        ...lista,
                                    ];
                                } else {
                                    datosNuevosCombinados[codigoFdi][surfaceId] = lista;
                                }
                            },
                        );
                    });
                });
            }

            const odontogramaData = transformHistorialData(datosNuevosCombinados);

            const totalDiagnosticos = Object.values(odontogramaData).reduce<number>(
                (acc, superficies) => {
                    const superficiesObj = superficies as Record<string, any[]>;
                    return acc + Object.values(superficiesObj).reduce<number>(
                        (sum: number, diags: any) => 
                            sum + (Array.isArray(diags) ? diags.length : 0), 
                        0
                    );
                }, 
                0
            );

            //console.log("[MAPPER][Historial] Snapshot procesado:", {
             //   version_id: first.version_id,
              //  esSnapshotCompleto: !!snapshotCompleto,
              //  dientes: Object.keys(odontogramaData).length,
              //  primerDiente: Object.keys(odontogramaData)[0],
               // totalDiagnosticos,
             //   sample: odontogramaData[Object.keys(odontogramaData)[0]]?.[
              //      Object.keys(odontogramaData[Object.keys(odontogramaData)[0]])[0]
                //]?.[0],
           // });

            let descripcion = first.descripcion || first.tipo_cambio_display || "Odontograma guardado";
            
            // Si es snapshot completo y no tiene descripción clara, generar una
            if (snapshotCompleto && !first.descripcion?.includes("guardado")) {
                const totalDientes = Object.keys(odontogramaData).length;
                descripcion = `Odontograma guardado: ${totalDiagnosticos} diagnósticos en ${totalDientes} dientes`;
            }

            return {
                id: first.version_id!,
                fecha: new Date(first.fecha),
                descripcion,
                odontogramaData,
                profesionalId: first.odontologo,
                profesionalNombre: first.odontologo_nombre ?? "N/A",
            } as OdontogramaSnapshot;
        },
    );

    return snapshots;
}

export function mapHistorialToTimeline(
    historial?: HistorialOdontogramaBackend[] | null,
): TimelineEvent[] {
    if (!Array.isArray(historial)) {
        console.warn(
            "[MAPPER][Historial] mapHistorialToTimeline → historial no es array",
            historial,
        );
        return [];
    }

    const snapshots = mapHistorialToSnapshots(historial);

    return snapshots.map((s) => ({
        id: s.id,
        fecha: s.fecha,
        titulo: s.descripcion || "Cambio de odontograma",
        descripcion: s.descripcion,
        isActive: false,
        // metadata: {
        //     totalDientes: Object.keys(s.odontogramaData).length,
        //     profesional: s.profesionalNombre,
        // }
    }));
}