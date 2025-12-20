/**
 * ============================================================================
 * HOOK: useAuth
 * ============================================================================
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { login as loginService, logout as logoutService, getCurrentUser } from '../../services/auth/authService';
import type { ILoginCredentials, IAuthState } from '../../types/auth/IAuth';
import { logger } from '../../utils/logger';

// ============================================================================
// CONTEXT
// ============================================================================

interface AuthContextType extends IAuthState {
  login: (credentials: ILoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<IAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // VERIFICAR AUTENTICACIÓN AL CARGAR - ✅ UNA SOLA VEZ
  // ========================================================================

  useEffect(() => {
    const checkAuth = async () => {
      try {
        logger.info('🔍 Verificando autenticación...');
        
        const user = await getCurrentUser();
        
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        logger.info(`✅ Usuario autenticado: ${user.username}`);
      } catch {
        // No hay sesión activa
        logger.info('ℹ️ No hay sesión activa');
        
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []); // ✅ Solo se ejecuta al montar el componente

  // ========================================================================
  // LOGIN
  // ========================================================================

  const login = async (credentials: ILoginCredentials) => {
    try {
      setError(null);
      setState(prev => ({ ...prev, isLoading: true }));
      
      logger.info('🔐 Iniciando login...');
      
      const { user } = await loginService(credentials);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      logger.info(`✅ Login exitoso: ${user.username}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al iniciar sesión';
      
      setError(errorMessage);
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      logger.error('❌ Error en login', err);
      throw err;
    }
  };

  // ========================================================================
  // LOGOUT
  // ========================================================================

  const logout = async () => {
    try {
      logger.info('🚪 Cerrando sesión...');
      
      // Limpiar caché de React Query
      queryClient.clear();
      
      // Llamar al servicio de logout (limpia cookies en backend)
      await logoutService();
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      setError(null);
      
      logger.info('✅ Logout exitoso');
    } catch (err) {
      logger.error('❌ Error en logout', err);
      
      // Aunque falle, limpiamos el estado local
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  // ========================================================================
  // REFETCH USER
  // ========================================================================

  const refetchUser = async () => {
    try {
      const user = await getCurrentUser();
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
      }));
    } catch (err) {
      logger.error('Error al refrescar usuario', err);
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  // ========================================================================
  // CLEAR ERROR
  // ========================================================================

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refetchUser,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
}
