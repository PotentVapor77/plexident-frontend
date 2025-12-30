// src/components/auth/forms/SignInForm.tsx
import {  useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../../../icons";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Checkbox from "../../../form/input/Checkbox";
import Button from "../../../ui/button/Button";
import { useAuth } from "../../../../hooks/auth/useAuth";
import { logger } from "../../../../utils/logger";
import { getErrorMessage } from "../../../../types/api";
import { useNotification } from "../../../../context/notifications/NotificationContext";

const SignInForm = () => {
  const { login, isLoading } = useAuth();
  const { notify } = useNotification();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await login({
        username,
        password,
      });
      
      const displayName = username || "usuario";
      
      notify({
        type: "success",
        title: "Inicio de sesión exitoso",
        message: `Bienvenido nuevamente, ${displayName}.`,

      });
    } catch (error) {
      logger.error("Error al iniciar sesión", error);
      const message = getErrorMessage(error);

      notify({
        type: "error",
        title: "Error de autenticación",
        message:
          message || "No se pudo iniciar sesión. Verifica tus credenciales.",
      });
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
        <p className="mt-1 text-sm text-gray-500">
          ¡Introduce tu Usuario!
        </p>
      </div>

      <div className="space-y-4">
        {/* Usuario */}
        <div>
          <Label htmlFor="username">Usuario *</Label>
          <Input
            id="username"
            type="text"
            placeholder="Ingresa tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Contraseña */}
        <div>
          <Label htmlFor="password">Contraseña *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <EyeCloseIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Recordarme + Olvidaste contraseña */}
        <div className="flex items-center justify-between">
          <Checkbox
            id="remember"
            label="Mantenerme conectado"
            checked={remember}
            onChange={setRemember}
          />

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            ¿Has olvidado tu contraseña?
          </Link>
        </div>
      </div>

      {/* Botón enviar */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        loading={isLoading}
      >
        Iniciar sesión
      </Button>

      {/* Registro */}
      <p className="text-center text-sm text-gray-500">
        ¿No tienes una cuenta?{" "}
        <Link
          to="/sign-up"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Contáctanos
        </Link>
      </p>
    </form>
  );
};

export default SignInForm;
