// src/pages/Patients/PatientsPage.tsx
import PatientMain from '../../components/patients/patient/PatientMain';
import { FullScreenLayout } from '../../layout/FullScreenLayout';

export default function PatientsPage() {
  return (
 <FullScreenLayout className="relative bg-white rounded-xl shadow-sm">
<div className="container mx-auto px-4 py-3">
      <PatientMain />
    </div>


 </FullScreenLayout>
    
  );
}