import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { useFloFlo } from "../context/FloFloContext";
import { formatRut } from "../utils/formatRut";

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

  const navigate = useNavigate();
  const { setUser } = useFloFlo();

  const cleanRut = (value) => {
    return value.replace(/\./g, "").replace(/-/g, "");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    setAvatar(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const userData = {
        firstName,
        lastName,
        rut: cleanRut(rut),
        birth_date: birthDate,
        email,
        avatar: avatar ? avatar.name : null,
        password,
        role,
      };

      const data = await register(userData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      alert("Usuario registrado correctamente");
      navigate("/");
    } catch (error) {
      console.error(error);

      const mensaje =
        error.response?.data?.message ||
        error.message ||
        "Ocurrió un problema al registrar el usuario.";

      alert(mensaje);
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
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full py-3 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
            >
              <option value="child">Niño</option>
              <option value="parent">Padre/Cuidador</option>
            </select>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full py-3 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full py-3 text-gray-500"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full py-3 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar Contraseña"
              className="w-full py-3 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
            />

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