// src/pages/odontogram/IndicadoresSaludBucalPage.tsx

import React from "react";
import { IndicatorsMain } from "../../components/odontogram/indicator/IndicatorsMain";
import { FullScreenLayout } from "../../layout/FullScreenLayout";

const IndicadoresSaludBucalPage: React.FC = () => {
  return (
    <FullScreenLayout className="relative bg-white rounded-xl shadow-sm">
      <div className="bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <IndicatorsMain />
      </div>
    </div>
    </FullScreenLayout>
    
  );
};

export default IndicadoresSaludBucalPage;
