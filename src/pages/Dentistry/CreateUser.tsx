// pages/Dentistry/CreatePatient.tsx
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import UserForm from "../../components/dentistry/CreateUsers/UserForm";
export default function CreatePatient() {

  const handleUserCreated = () => {
    console.log("Usuario creado exitosamente");
    // Opcional: redirigir a la lista de usuarios
    // navigate('/usuarios');
  };

 return (
    <>
      <PageMeta
        title="Registrar Usuario | Sistema Odontológico"
        description="Formulario para registrar nuevo usuario en el sistema"
      />
      <PageBreadcrumb 
        pageTitle="Registrar Usuario" 
      />
      
      <div className="max-w-4xl mx-auto">
        <UserForm onUserCreated={handleUserCreated} />
      </div>
    </>
  );
}