// pages/Dentistry/CreatePatient.tsx
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PatientForm from "../../components/dentistry/CreatePatients/PatientForm";

export default function CreatePatient() {
  const handlePatientCreated = () => {
    // Esto podría usarse para mostrar un mensaje de éxito o redirigir
    console.log("Paciente creado exitosamente");
    // Opcional: redirigir a la lista de pacientes
    // navigate('/pacientes');
  };

  return (
    <>
      <PageMeta
        title="Registrar Paciente | Sistema Odontológico"
        description="Formulario para registrar nuevo paciente en el sistema odontológico"
      />
      <PageBreadcrumb pageTitle="Registrar Paciente" />
      
      <div className="max-w-4xl mx-auto">
        <PatientForm onPatientCreated={handlePatientCreated} />
      </div>
    </>
  );
}