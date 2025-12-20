/**
 * ============================================================================
 * COMPONENT: SignInForm - ✅ SIN RATE LIMITING CLIENTE
 * ============================================================================
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../../../icons";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Checkbox from "../../../form/input/Checkbox";
import Button from "../../../ui/button/Button";
import { useAuth } from "../../../../hooks/auth/useAuth";
import { logger } from "../../../../utils/logger";
import { getErrorMessage } from "../../../../types/api";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  /**
   * Manejar cambios en inputs
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  /**
   * Manejar cambio de checkbox
   */
  const handleCheckboxChange = (checked: boolean) => {
    if (!loading) {
      setIsChecked(checked);
    }
  };

  /**
   * Submit: Login
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validación básica
    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Por favor, completa todos los campos");
      setLoading(false);
      return;
    }

    try {
      logger.info('Intentando login');
      
      await login({
        username: formData.username,
        password: formData.password
      });
      
      logger.info('Login exitoso');
    } catch (error) {
      logger.error('Error en login', error);
      
      // Extraer mensaje de error
      const errorMessage = getErrorMessage(error);

      // Personalizar mensajes según el error
      if (errorMessage.includes('Usuario o contraseña incorrectos')) {
        setError('Usuario o contraseña incorrectos');
      } else if (errorMessage.includes('Cuenta desactivada')) {
        setError('Tu cuenta está desactivada. Contacta al administrador.');
      } else if (errorMessage.includes('Demasiados intentos')) {
        // ✅ El servidor maneja rate limiting
        setError(errorMessage);
      } else if (errorMessage.includes('Network Error')) {
        setError('Error de conexión. Verifica que el servidor esté ejecutándose.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          ¡Introduce tu Usuario!
        </p>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Campo: Usuario */}
      <div className="mb-4">
        <Label htmlFor="username">Usuario *</Label>
        <Input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Ingresa tu usuario"
          disabled={loading}
          autoComplete="username"
        />
      </div>

      {/* Campo: Contraseña */}
      <div className="mb-4">
        <Label htmlFor="password">Contraseña *</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Ingresa tu contraseña"
            disabled={loading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => !loading && setShowPassword(!showPassword)}
            className={`absolute z-10 -translate-y-1/2 right-4 top-1/2 ${
              loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            disabled={loading}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeCloseIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      {/* Recordarme y olvidé contraseña */}
      <div className="flex items-center justify-between mb-6">
        <Checkbox
          label="Mantenerme conectado"
          checked={isChecked}
          onChange={handleCheckboxChange}
          disabled={loading}
        />
        <Link
          to="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={(e) => loading && e.preventDefault()}
        >
          ¿Has olvidado tu contraseña?
        </Link>
      </div>

      {/* Botón Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>

      {/* Link a registro */}
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        ¿No tienes una cuenta?{" "}
        <Link
          to="/signup"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          onClick={(e) => loading && e.preventDefault()}
        >
          Regístrate aquí
        </Link>
      </p>
    </form>
  );
}
