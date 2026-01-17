// src/pages/ClinicalRecord/ClinicalRecordsPage.tsx

import React from "react";
import { Helmet } from "react-helmet-async";
import ClinicalRecordManagement from "../../components/clinicalRecords/ClinicalRecordManagement";

/**
 * Página principal del módulo Historiales Clínicos (Formulario 033)
 * 
 * Features:
 * - Listado de historiales clínicos con paginación
 * - Filtrado por paciente activo desde contexto
 * - Búsqueda por nombre, cédula o motivo de consulta
 * - Filtros por estado (Borrador, Abierto, Cerrado)
 * - Modales para crear, editar, visualizar, cerrar y eliminar historiales
 * - Tabla responsive con indicadores de estado y acciones contextuales
 * - Integración completa con Form 033 del MSP Ecuador
 * 
 * @returns {JSX.Element} Página con gestión de historiales clínicos
 */
const ClinicalRecordsPage: React.FC = () => {
  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Historiales Clínicos | Plexident</title>
        <meta
          name="description"
          content="Gestiona los historiales clínicos odontológicos de tus pacientes. Sistema conforme al Formulario 033 del MSP Ecuador."
        />
      </Helmet>

      {/* Componente principal de gestión */}
      <ClinicalRecordManagement />
    </>
  );
};

export default ClinicalRecordsPage;
