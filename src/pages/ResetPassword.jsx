import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { resetPassword } from "../services/authService";
import { useFeedback } from "../context/FeedbackContext";
import felix from "../assets/webp/felix_cara_sonriendo.webp";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showFeedback } = useFeedback();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!token) {
      showFeedback({
        type: "error",
        icon: "❌",
        label: "Enlace inválido",
        title: "No se puede restablecer",
        message: "El enlace de recuperación no es válido o está incompleto.",
      });
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Completa ambas contraseñas",
        message: "Debes ingresar y confirmar tu nueva contraseña.",
      });
      return;
    }

    if (newPassword.length < 6) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Contraseña muy corta",
        title: "Usa al menos 6 caracteres",
        message: "La nueva contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Revisa la contraseña",
        title: "Las contraseñas no coinciden",
        message: "Ambas contraseñas deben ser iguales para continuar.",
      });
      return;
    }

    try {
      setLoading(true);

      await resetPassword(token, newPassword);

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Contraseña actualizada",
        title: "Clave guardada correctamente",
        message: "Ya puedes iniciar sesión con tu nueva contraseña.",
      });

      navigate("/login");
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo restablecer",
        message:
          error.message ||
          "No fue posible restablecer la contraseña. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3ECFF] flex justify-center items-center px-6">
      <div className="bg-white rounded-[2rem] shadow-lg p-10 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src={felix}
            alt="Felix"
            className="w-32 h-32 object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold text-[#4B367C] text-center mb-2">
          Crear nueva contraseña
        </h1>

        <p className="text-center text-[#6B5A95] mb-8">
          Escribe una nueva clave para volver a ingresar a FloFlo.
        </p>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="block text-[#4B367C] font-semibold mb-2">
              Nueva contraseña
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
            />
          </div>

          <div>
            <label className="block text-[#4B367C] font-semibold mb-2">
              Confirmar contraseña
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-[#9B7BE8]
              hover:bg-[#8B6FD6]
              disabled:opacity-50
              text-white
              font-bold
              py-4
              rounded-2xl
              transition-all
              duration-300
            "
          >
            {loading ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-[#7C3AED] font-bold hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;