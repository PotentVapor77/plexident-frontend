// src/pages/ClinicalRecord/ClinicalRecordsPage.tsx

import React from "react";
import { Helmet } from "react-helmet-async";
import ClinicalRecordManagement from "../../components/clinicalRecords/ClinicalRecordManagement";



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

      <ClinicalRecordManagement />
    </>

    
  );
};

export default ClinicalRecordsPage;
