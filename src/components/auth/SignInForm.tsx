import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import Spinner from "../ui/spinner/Spinner";
import { useAuth, type User } from "../../context/AuthContext";

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginResponse {
  status: number;
  message: string;
  data: {
    user: User;
    tokens: {
      access: string;
      refresh: string;
    };
  };
  error?: string;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();
 
  const spinnerTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (loading) {
      // Esperar 2 segundos antes de mostrar el spinner
      
      spinnerTimeoutRef.current = window.setTimeout(() => {
        setShowSpinner(true);
      }, 1000); //  2000ms = 2 segundos
    } else {
      // Limpiar el timeout si loading se vuelve false antes de 2 segundos
      if (spinnerTimeoutRef.current) {
        window.clearTimeout(spinnerTimeoutRef.current);
        spinnerTimeoutRef.current = null;
      }
      setShowSpinner(false);
    }

    return () => {
      // Limpieza del timeout al desmontar
      if (spinnerTimeoutRef.current) {
        window.clearTimeout(spinnerTimeoutRef.current);
      }
    };
  }, [loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowSpinner(false); // Resetear estado del spinner

    // Validación básica
    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Por favor, completa todos los campos");
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Intentando login...');
      console.log('⏱️ Spinner aparecerá después de 2 segundos si el login sigue cargando');

      // ✅ Agregar demora mínima de 2 segundos para poder probar el spinner
      const [response] = await Promise.all([
        fetch('http://localhost:8000/api/users/auth/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        }),
        new Promise(resolve => setTimeout(resolve, 2000)) // 2segundos mínimo para poder probar
      ]);

      const data: LoginResponse = await response.json();
      console.log('📨 Respuesta del servidor:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }

      if (data.data?.user && data.data?.tokens?.access) {
        console.log('✅ Login exitoso');
        login(data.data.user, data.data.tokens.access);
      } else {
        throw new Error('Respuesta del servidor inválida');
      }
      
    } catch (error: unknown) {
      console.error('❌ Error en login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión con el servidor';
      setError(errorMessage);
    } finally {
      // Limpiar timeout si existe
      if (spinnerTimeoutRef.current) {
        window.clearTimeout(spinnerTimeoutRef.current);
        spinnerTimeoutRef.current = null;
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* ✅ Spinner overlay - aparece después de 2 segundos de loading */}
      {showSpinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 animate-fade-in">
          <Spinner 
            size="lg" 
            text="Iniciando sesión, por favor espera..." 
          />
        </div>
      )}

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-center text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¡Introduce tu Usuario!
            </p>
          </div>
          <div>
            {error && (
              <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-300">
                ❌ {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username">
                    Usuario <span className="text-error-500">*</span>
                  </Label>
                  <Input 
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Introduce tu usuario" 
                    required
                    disabled={loading}
                    className={loading ? "opacity-50 cursor-not-allowed" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="password">
                    Contraseña <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Introduce tu contraseña"
                      required
                      disabled={loading}
                      className={loading ? "opacity-50 cursor-not-allowed" : ""}
                    />
                    <button
                      type="button"
                      onClick={() => !loading && setShowPassword(!showPassword)}
                      className={`absolute z-30 -translate-y-1/2 right-4 top-1/2 ${
                        loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                      disabled={loading}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={isChecked} 
                      onChange={setIsChecked}
                      disabled={loading}
                    />
                    <span className={`block font-normal text-gray-700 text-theme-sm dark:text-gray-400 ${
                      loading ? "opacity-50" : ""
                    }`}>
                      Mantenme conectado
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className={`text-sm ${
                      loading 
                        ? "text-gray-400 cursor-not-allowed dark:text-gray-600" 
                        : "text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    }`}
                    onClick={(e) => loading && e.preventDefault()}
                  >
                    ¿Has olvidado tu contraseña?
                  </Link>
                </div>
                <div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    disabled={loading}
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}