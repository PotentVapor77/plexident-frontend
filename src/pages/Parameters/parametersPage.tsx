// src/pages/Patients/PatientsPage.tsx

import HorariosMain from "../../components/parameters/horarios/HorariosMain";
import { FullScreenLayout } from "../../layout/FullScreenLayout";

export default function PrametersPage() {
  return (
<FullScreenLayout className="relative bg-white rounded-xl shadow-sm">
<div className="container mx-auto px-4 py-6">
      <HorariosMain />
    </div>

  </FullScreenLayout>
    

  );
}