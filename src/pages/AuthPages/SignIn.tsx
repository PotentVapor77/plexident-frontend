// pages/AuthPages/SignIn.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/security/auth/forms/SignInForm";
import { useAuth } from '../../hooks/auth/useAuth';

export default function SignIn() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Si ya está autenticado, no mostrar el formulario
  if (user) {
    return null;
  }

  return (
    <>
      <PageMeta
        title="Iniciar Sesión - Plexident"
        description="Inicia sesión en tu cuenta de Plexident"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}