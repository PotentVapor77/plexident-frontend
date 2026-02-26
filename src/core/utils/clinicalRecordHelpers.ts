// src/utils/clinicalRecordHelpers.ts

export const extractOdontologoNombre = (record: any): string => {
  // Caso 1: Ya viene formateado como string
  if (typeof record.odontologo_nombre === 'string' && record.odontologo_nombre.trim()) {
    return record.odontologo_nombre.trim();
  }

  // Caso 2: Objeto odontologo_info
  if (record.odontologo_info && typeof record.odontologo_info === 'object') {
    const nombres = (record.odontologo_info.nombres || record.odontologo_info.first_name || '').trim();
    const apellidos = (record.odontologo_info.apellidos || record.odontologo_info.last_name || '').trim();
    const full = `${nombres} ${apellidos}`.trim();
    if (full) return full;
  }

  // Caso 3: Campos separados en el record raíz
  {
    const nombres = (record.odontologo_nombres || '').trim();
    const apellidos = (record.odontologo_apellidos || '').trim();
    const full = `${nombres} ${apellidos}`.trim();
    if (full) return full;
  }

  // Caso 4: odontologo_responsable anidado como objeto
  if (record.odontologo_responsable && typeof record.odontologo_responsable === 'object') {
    const o = record.odontologo_responsable;
    const nombres = (o.nombres || o.first_name || '').trim();
    const apellidos = (o.apellidos || o.last_name || '').trim();
    const full = `${nombres} ${apellidos}`.trim();
    if (full) return full;
    return 'Odontólogo asignado';
  }

  if (record.odontologo_responsable || record.odontologo_responsable_id) {
    return 'Odontólogo asignado';
  }

  return 'No asignado';
};

export const extractPacienteNombre = (record: any): string => {
  // Caso 1: Ya viene formateado
  if (record.paciente_nombre) return record.paciente_nombre;
  
  // Caso 2: Objeto paciente_info
  if (record.paciente_info) {
    if (record.paciente_info.nombre_completo) {
      return record.paciente_info.nombre_completo;
    }
    const nombres = record.paciente_info.nombres || '';
    const apellidos = record.paciente_info.apellidos || '';
    if (nombres || apellidos) {
      return `${nombres} ${apellidos}`.trim();
    }
  }
  
  // Caso 3: Campos separados en el record
  if (record.paciente_nombres || record.paciente_apellidos) {
    const nombres = record.paciente_nombres || '';
    const apellidos = record.paciente_apellidos || '';
    return `${nombres} ${apellidos}`.trim();
  }
  
  // Caso 4: Objeto paciente anidado
  if (record.paciente) {
    if (typeof record.paciente === 'object') {
      const nombres = record.paciente.nombres || '';
      const apellidos = record.paciente.apellidos || '';
      if (nombres || apellidos) {
        return `${nombres} ${apellidos}`.trim();
      }
    }
  }
  
  return "Nombre no disponible";
};

export const extractPacienteCedula = (record: any): string => {
  // Caso 1: Ya viene formateado
  if (record.paciente_cedula) return record.paciente_cedula;
  
  // Caso 2: Objeto paciente_info
  if (record.paciente_info?.cedula_pasaporte) {
    return record.paciente_info.cedula_pasaporte;
  }
  
  // Caso 3: Campo directo en el record
  if (record.cedula_pasaporte) return record.cedula_pasaporte;
  
  // Caso 4: Objeto paciente anidado
  if (record.paciente) {
    if (typeof record.paciente === 'object') {
      if (record.paciente.cedula_pasaporte) {
        return record.paciente.cedula_pasaporte;
      }
    }
  }
  
  return "S/N";
};