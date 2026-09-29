import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { useFloFlo } from "../context/FloFloContext";
import { useFeedback } from "../context/FeedbackContext";
import { formatRut } from "../utils/formatRut";
import { validateImageFile } from "../utils/validateImageFile";
import {
  calculateAge,
  isBirthdayToday,
  formatAgeLabel,
} from "../utils/birthdayUtils";

const User = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rut, setRut] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("child");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useFloFlo();
  const { showFeedback } = useFeedback();
  const age = calculateAge(birthDate);
  const birthdayToday = isBirthdayToday(birthDate);
  const todayDate = new Date().toISOString().slice(0, 10);

  const cleanRut = (value) => {
    return value.replace(/\./g, "").replace(/-/g, "");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setAvatar(null);
      setPreview(null);
      return;
    }
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      e.target.value = "";
      setAvatar(null);
      setPreview(null);

      showFeedback(validation.feedback);
      return;
    }
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Nombre obligatorio",
        message: "Debes ingresar el nombre antes de registrarte.",
      });
      return;
    }

    if (!lastName.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Apellido obligatorio",
        message: "Debes ingresar el apellido antes de registrarte.",
      });
      return;
    }

    if (!rut.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "RUT obligatorio",
        message: "Debes ingresar el RUT antes de registrarte.",
      });
      return;
    }

    if (!birthDate) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Fecha de nacimiento obligatoria",
        message: "Debes ingresar la fecha de nacimiento.",
      });
      return;
    }

    if (age === null) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Fecha inválida",
        title: "Revisa la fecha de nacimiento",
        message: "La fecha de nacimiento no puede ser futura.",
      });
      return;
    }

    if (!email.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Correo obligatorio",
        message: "Debes ingresar un correo electrónico.",
      });
      return;
    }

    if (!password.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Contraseña obligatoria",
        message: "Debes ingresar una contraseña.",
      });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Contraseña débil",
        title: "Revisa tu contraseña",
        message:
          "La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula y número.",
      });
      return;
    }

    if (password !== confirmPassword) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Revisa la contraseña",
        title: "Las contraseñas no coinciden",
        message: "Ambas contraseñas deben ser iguales para crear la cuenta.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("rut", cleanRut(rut));
      formData.append("birth_date", birthDate);
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("role", role);

      if (avatar) {
        formData.append("avatar", avatar);
      }

      const data = await register(formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Cuenta creada",
        title: "Usuario registrado correctamente",
        message: "La cuenta fue creada y ya puedes usar FloFlo.",
      });

      navigate("/");
    } catch (error) {
      console.error(error);

      const mensaje =
        error.response?.data?.message ||
        error.message ||
        "Ocurrió un problema al registrar el usuario.";

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo registrar",
        message: mensaje,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-8 py-10">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-4xl font-light text-black-900 mb-10 text-center">
            Inscripción
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nombre"
              className="w-full py-3 text-gray-900 placeholder-black-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
            />

            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellido"
              className="w-full py-3 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
            />

            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(formatRut(e.target.value))}
              placeholder="Rut"
              className="w-full py-3 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
            />

            <input
              type="date"
              value={birthDate}
              max={todayDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full py-3 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
            />
            {birthDate && age !== null && (
              <div className="rounded-2xl border border-[#DCCCF8] bg-[#F3ECFF] p-4">
                <p className="font-bold text-[#4B367C]">
                  🎈 Edad: {formatAgeLabel(age)}
                </p>

                {birthdayToday && (
                  <p className="mt-2 font-bold text-[#5C4A00]">
                    🎂 ¡Hoy es su cumpleaños! Que tenga un día muy especial en
                    FloFlo.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block mb-2 font-bold text-[#4B367C]">
                Tipo de cuenta
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
              >
                <option value="child">Niño/a</option>
                <option value="parent">Adulto/a de apoyo</option>
              </select>

              {role === "parent" && (
                <p className="mt-3 rounded-2xl border border-[#DCCCF8] bg-[#F3ECFF] px-4 py-3 text-sm font-semibold text-[#6B5A95]">
                  Para familiares, cuidadores, terapeutas, profesores y otros
                  profesionales.
                </p>
              )}
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full py-3 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
            />

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="w-full py-3 text-gray-500"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full py-3 pr-12 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xl"
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

            <p className="text-sm text-gray-500">
              Mínimo 8 caracteres, con mayúscula, minúscula y número.
            </p>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar Contraseña"
                className="w-full py-3 pr-12 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xl"
                aria-label={
                  showConfirmPassword
                    ? "Ocultar confirmación de contraseña"
                    : "Mostrar confirmación de contraseña"
                }
                title={
                  showConfirmPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-cyan-700 font-medium border border-cyan-700 hover:bg-cyan-700 hover:text-white transition-all duration-300"
            >
              Enviar
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center">
          {preview ? (
            <img
              src={preview}
              alt="Vista previa"
              className="w-80 h-80 rounded-full object-cover border-4 border-cyan-700"
            />
          ) : (
            <div className="w-80 h-80 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
              Sin imagen
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;
