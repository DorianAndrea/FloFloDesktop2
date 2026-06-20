import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../services/authService";
import { useFloFlo } from "../context/FloFloContext";
import felix from "../assets/webp/felix_cara_sonriendo.webp";


const Login = () =>{
    const navigate = useNavigate();
    const { setUser } = useFloFlo();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
    e.preventDefault();

  try {
    const data = await login(email, password);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);

    alert(`Bienvenido ${data.user.firstName}`);

    navigate("/");
  } catch (error) {
    console.error(error);
    alert(error.message || "Correo o contraseña incorrectos");
  }
};
    return(
        <div className="min-h-screen bg-[#F3ECFF] flex justify-center items-center px-6">
      <div className="bg-white rounded-[2rem] shadow-lg p-10 w-full max-w-md">

        <div className="flex justify-center mb-6">
          <img
            src={felix}
            alt="Felix"
            className="w-36 h-36 object-contain"
          />
        </div>

        <h1 className="text-4xl font-bold text-[#4B367C] text-center mb-2">
          Bienvenido a FloFlo
        </h1>

        <p className="text-center text-[#6B5A95] mb-8">
          Inicia sesión para continuar
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >
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

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
            />
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
      </div>
    </div>
  );
};

export default Login;

    

