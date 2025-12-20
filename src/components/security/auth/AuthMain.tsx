/**
 * ============================================================================
 * COMPONENTE: AuthMain
 * ============================================================================
 * Componente principal que puede orquestar diferentes vistas de autenticación
 * (opcional, para casos donde necesites lógica compartida)
 */
import { SignInForm } from './forms';

export function AuthMain() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <SignInForm />
      </div>
    </div>
  );
}

export default AuthMain;
