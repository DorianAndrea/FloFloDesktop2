import { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../services/authService";
import felix from "../assets/webp/felix_cara_sonriendo.webp";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setResetUrl("");

      const data = await forgotPassword(email);

      setMessage(
        data.message ||
          "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.",
      );

      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || "No fue posible solicitar la recuperación.");
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
          Recuperar contraseña
        </h1>

        <p className="text-center text-[#6B5A95] mb-8">
          Ingresa tu correo y te ayudaremos a crear una nueva clave.
        </p>

        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <label className="block text-[#4B367C] font-semibold mb-2">
              Correo electrónico
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
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
            {loading ? "Enviando..." : "Solicitar recuperación"}
          </button>
        </form>

        {message && (
          <div className="mt-6 bg-purple-50 border border-purple-100 rounded-2xl p-4">
            <p className="text-[#4B367C] font-semibold">{message}</p>

            {resetUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Link temporal de desarrollo:
                </p>

                <Link
                  to={resetUrl.replace(window.location.origin, "")}
                  className="text-[#7C3AED] font-bold underline break-all"
                >
                  Crear nueva contraseña
                </Link>
              </div>
            )}
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

export default ForgotPassword;