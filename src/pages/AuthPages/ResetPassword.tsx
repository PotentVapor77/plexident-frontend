import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import AxiosInstance  from "../../services/api/axiosInstance";
import { ENDPOINTS } from "../../config/api";
import { getErrorMessage } from "../../types/api";

export default function ResetPassword() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim() || !confirmPassword.trim()) {
      setMessage("Por favor, completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await AxiosInstance.post(
        ENDPOINTS.auth.passwordResetConfirm,
        {
          uid,
          token,
          new_password: password,
        }
      );

      if (response.data?.success) {
        setMessage(
          response.data.message || "¡Contraseña actualizada exitosamente!"
        );
        setTimeout(() => navigate("/sign-in"), 2000);
      } else {
        setMessage(
          response.data?.message || "Error al resetear la contraseña."
        );
      }
    } catch (error) {
      const msg = getErrorMessage(error);
      setMessage(msg || "Error de conexión al resetear la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nueva Contraseña
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Ingresa y confirma tu nueva contraseña
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-lg border bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200">
            {message}
          </div>
        )}

        <div className="mb-6">
          <Label htmlFor="password">Nueva Contraseña *</Label>
          <Input
            id="password"
            type="password"
            value={password}
            placeholder="Mínimo 8 caracteres"
            onChange={(e) => {
              setPassword(e.target.value);
              if (message) setMessage("");
            }}
            required
          />
        </div>

        <div className="mb-6">
          <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            placeholder="Repite tu nueva contraseña"
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (message) setMessage("");
            }}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !password || !confirmPassword}
        >
          {loading ? "Actualizando..." : "Actualizar Contraseña"}
        </Button>

        <button
          type="button"
          onClick={() => navigate("/sign-in")}
          className="mt-4 w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          disabled={loading}
        >
          ← Volver al inicio de sesión
        </button>
      </form>
    </div>
  );
}
