import { NavLink } from "react-router-dom";
import { useFloFlo } from "../context/FloFloContext";

import logoFloFlo from "../assets/svg/felix_cara_sonriendo.svg";

const Navbar = () => {
  const { points, soundEnabled, setSoundEnabled } = useFloFlo();

  const linkClass = ({ isActive }) =>
    `font-semibold transition ${
      isActive
        ? "text-[#9B7BE8]"
        : "text-[#5B4B8A] hover:text-[#8B6FD6]"
    }`;

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-[#E3D9FF] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <NavLink to="/" className="flex items-center gap-3">
          <img src={logoFloFlo} alt="FloFlo" className="w-12 h-12" />

          <span className="text-3xl font-bold text-[#4B367C]">
            FloFlo
          </span>
        </NavLink>

        <div className="hidden md:flex items-center gap-7">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          <NavLink to="/emociones" className={linkClass}>
            Emociones
          </NavLink>

          <NavLink to="/rutinas" className={linkClass}>
            Rutinas
          </NavLink>

          <NavLink to="/amigos" className={linkClass}>
            Amigos
          </NavLink>

          <NavLink to="/conversaciones" className={linkClass}>
            Conversaciones
          </NavLink>

          <NavLink to="/lugares" className={linkClass}>
            Lugares
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block bg-[#FFF3C4] text-[#5C4A00] font-bold px-4 py-2 rounded-full shadow-sm">
            ⭐ {points}
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="hidden sm:block bg-white text-[#4B367C] font-bold px-4 py-2 rounded-full shadow-sm hover:shadow-md transition"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>

          <NavLink
            to="/registro"
            className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-semibold px-5 py-3 rounded-full transition"
          >
            Mi Perfil
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;