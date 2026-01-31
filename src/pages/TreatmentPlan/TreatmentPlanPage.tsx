// src/pages/TreatmentPlan/TreatmentPlanPage.tsx
import React from "react";
import { Helmet } from "react-helmet-async";
import TreatmentPlanManagement from "../../components/treatment-plan/TreatmentPlanManagement";
import { FullScreenLayout } from "../../layout/FullScreenLayout";

/**
 * Página principal del módulo Plan de Tratamiento
 * 
 * Features:
 * - Listado de planes de tratamiento con paginación
 * - Filtrado por paciente activo desde contexto
 * - Modales para crear, editar, ver y eliminar planes
 * - Tabla responsive con estadísticas visuales
 * 
 * @returns {JSX.Element} Página con listado de planes de tratamiento
 */
const TreatmentPlanPage: React.FC = () => {
  return (
<FullScreenLayout className="relative bg-white rounded-xl shadow-sm">
<>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Planes de Tratamiento | Plexident</title>
        <meta
          name="description"
          content="Gestión de planes de tratamiento odontológico. Crea, edita y da seguimiento a los planes de tratamiento de tus pacientes."
        />
      </Helmet>

      {/* Contenedor principal con padding responsivo */}
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <TreatmentPlanManagement />
      </div>
    </>
  
</FullScreenLayout>
    

  );
};

export default TreatmentPlanPage;
