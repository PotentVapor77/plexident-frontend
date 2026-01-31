// src/pages/ClinicalRecord/ClinicalRecordsPage.tsx

import React from "react";
import { Helmet } from "react-helmet-async";
import ClinicalRecordManagement from "../../components/clinicalRecords/ClinicalRecordManagement";
import { FullScreenLayout } from "../../layout/FullScreenLayout";


const ClinicalRecordsPage: React.FC = () => {
  return (
<FullScreenLayout className="relative bg-white rounded-xl shadow-sm">
<>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Historiales Clínicos | Plexident</title>
        <meta
          name="description"
          content="Gestiona los historiales clínicos odontológicos de tus pacientes. Sistema conforme al Formulario 033 del MSP Ecuador."
        />
      </Helmet>

      <ClinicalRecordManagement />
    </>

</FullScreenLayout>
    
  );
};

export default ClinicalRecordsPage;
