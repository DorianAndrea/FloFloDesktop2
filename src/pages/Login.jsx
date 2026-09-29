import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { login } from "../services/authService";
import { useFloFlo } from "../context/FloFloContext";
import { useFeedback } from "../context/FeedbackContext";
import felix from "../assets/webp/felix_cara_sonriendo.webp";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ""}${location.state.from.hash || ""}`
    : "/";
  const { setUser } = useFloFlo();
  const { showFeedback } = useFeedback();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Ingresa tu correo",
        message: "Debes ingresar tu correo electrónico para iniciar sesión.",
      });
      return;
    }

    if (!password.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Ingresa tu contraseña",
        message: "Debes ingresar tu contraseña para continuar.",
      });
      return;
    }

    try {
      const data = await login(email.trim(), password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      showFeedback({
        type: "success",
        icon: "💜",
        label: "Sesión iniciada",
        title: `Bienvenido ${data.user.firstName}`,
        message: "Entraste correctamente a FloFlo.",
      });

      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "No se pudo iniciar sesión",
        title: "Correo o contraseña incorrectos",
        message: error.message || "Revisa tus datos e intenta nuevamente.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F3ECFF] flex justify-center items-center px-6">
      <div className="bg-white rounded-[2rem] shadow-lg p-10 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={felix} alt="Felix" className="w-36 h-36 object-contain" />
        </div>

        <h1 className="text-4xl font-bold text-[#4B367C] text-center mb-2">
          Bienvenido a FloFlo
        </h1>

        <p className="text-center text-[#6B5A95] mb-8">
          Inicia sesión para continuar
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[#4B367C] font-semibold mb-2">
              Correo electrónico
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="felix@test.com"
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
            />
          </div>

          <div>
            <label className="block text-[#4B367C] font-semibold mb-2">
              Contraseña
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full p-4 pr-14 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                title={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="text-right mt-3">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-[#7C3AED] hover:underline"
              >
                Olvidé mi contraseña
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="
              w-full
              bg-[#9B7BE8]
              hover:bg-[#8B6FD6]
              text-white
              font-bold
              py-4
              rounded-2xl
              transition-all
              duration-300
              hover:scale-[1.02]
            "
          >
            Ingresar
          </button>
        </form>

        <p className="text-center text-sm text-[#6B5A95] mt-6">
          ¿No tienes cuenta?{" "}
          <Link
            to="/registro"
            className="text-[#7C3AED] font-bold hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
