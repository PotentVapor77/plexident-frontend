import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import AxiosInstance  from "../../services/api/axiosInstance";
import { ENDPOINTS } from "../../config/api";
import { getErrorMessage } from "../../types/api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Por favor, ingresa tu email");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await AxiosInstance.post(
        ENDPOINTS.auth.passwordReset,
        { email }
      );

      setMessage(
        response.data?.message ||
          "Si el email existe, recibirás instrucciones para recuperar tu contraseña."
      );
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg || "Error al enviar la solicitud de recuperación.");
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
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Recuperar contraseña
        </h1>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Ingresa tu email para recibir instrucciones
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-300">
              {message}
            </p>
          </div>
        )}

        <div className="mb-6">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            placeholder="tu@email.com"
            onChange={(e) => {
              setEmail(e.target.value);
              if (error || message) {
                setError("");
                setMessage("");
              }
            }}
            disabled={loading}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !email.trim()}
        >
          {loading ? "Enviando..." : "Enviar email de recuperación"}
        </Button>

        <button
          type="button"
          onClick={() => navigate("/sign-in")}
          className="mt-4 w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          disabled={loading}
        >
          ← Volver al login
        </button>
      </form>
    </div>
  );
}
