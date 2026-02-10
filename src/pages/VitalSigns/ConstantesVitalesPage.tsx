// src/pages/Patients/PatientsPage.tsx

import VitalSignsMain from "../../components/patients/vitalSigns/VitalSignsMain";
import { FullScreenLayout } from "../../layout/FullScreenLayout";

export default function PatientsPage() {
  return (
 <FullScreenLayout className="relative bg-white rounded-xl shadow-sm">

<div className="container mx-auto px-4 py-6">
      <VitalSignsMain />
    </div>

 </FullScreenLayout>
    
    
  );
}