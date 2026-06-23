import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { resetPassword } from "../services/authService";
import felix from "../assets/webp/felix_cara_sonriendo.webp";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      setMessage("");

      if (!token) {
        setMessage("El enlace de recuperación no es válido.");
        return;
      }

      if (!newPassword || !confirmPassword) {
        setMessage("Debes completar ambas contraseñas.");
        return;
      }

      if (newPassword.length < 6) {
        setMessage("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setMessage("Las contraseñas no coinciden.");
        return;
      }

      setLoading(true);

      await resetPassword(token, newPassword);

      alert("Contraseña actualizada correctamente");
      navigate("/login");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "No fue posible restablecer la contraseña.");
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

        {message && (
          <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-red-600 font-semibold">{message}</p>
          </div>
        )}

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