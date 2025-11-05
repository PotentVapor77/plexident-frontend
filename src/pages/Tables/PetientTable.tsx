// pages/Dentistry/PatientTable.tsx
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PatientTablePage from "../Tables/PetientTable";

export default function PatientTableView() {
  return (
    <>
      <PageMeta
        title="Tabla de Pacientes | Sistema Odontológico"
        description="Visualización en tabla de todos los pacientes del sistema"
      />
      <PageBreadcrumb pageTitle="Tabla de Pacientes" />
      <PatientTablePage />
    </>
  );
}