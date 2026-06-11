import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

import { useFloFlo } from "../context/FloFloContext";
import felixLogo from "../assets/svg/felix_cara_sonriendo.svg";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, logout, points, soundEnabled, setSoundEnabled } = useFloFlo();

  const linkClass = ({ isActive }) =>
    `font-semibold transition ${
      isActive ? "text-[#9B7BE8]" : "text-[#5B4B8A] hover:text-[#8B6FD6]"
    }`;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E3D9FF] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 flex-shrink-0">
          <img src={felixLogo} alt="FloFlo" className="w-12 h-12" />
          <span className="text-3xl font-bold text-[#4B367C]">FloFlo</span>
        </NavLink>

        <div className="hidden lg:flex items-center gap-7 flex-1 justify-center">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          {user && (
            <>
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

              <NavLink to="/logros" className={linkClass}>
                🏆 Logros
              </NavLink>
            </>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {!user ? (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>

              <NavLink
                to="/registro"
                className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-semibold px-5 py-3 rounded-full transition"
              >
                Registro
              </NavLink>
            </>
          ) : (
            <>
              <span className="font-semibold text-[#4B367C] whitespace-nowrap">
                Hola, {user.firstName}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="text-red-500 font-semibold hover:text-red-700 transition"
              >
                Cerrar sesión
              </button>

              <div className="bg-[#FFF3C4] text-[#5C4A00] font-bold px-4 py-2 rounded-full shadow-sm">
                ⭐ {points}
              </div>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="bg-[#E8DDFF] text-[#4B367C] font-bold px-4 py-2 rounded-full shadow-sm hover:shadow-md transition"
              >
                {soundEnabled ? "🔊" : "🔇"}
              </button>

              <NavLink
                to="/mi-perfil"
                className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-semibold px-5 py-3 rounded-full transition"
              >
                Mi Perfil
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-[#4B367C] text-2xl"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E3D9FF] px-6 py-5">
          <div className="flex flex-col gap-5">
            <NavLink
              to="/"
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to="/emociones"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Emociones
                </NavLink>

                <NavLink
                  to="/rutinas"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Rutinas
                </NavLink>

                <NavLink
                  to="/amigos"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Amigos
                </NavLink>

                <NavLink
                  to="/conversaciones"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Conversaciones
                </NavLink>

                <NavLink
                  to="/lugares"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Lugares
                </NavLink>

                <NavLink
                  to="/logros"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  🏆 Logros
                </NavLink>

                <div className="font-semibold text-[#4B367C]">
                  Hola, {user.firstName}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left text-red-500 font-semibold"
                >
                  Cerrar sesión
                </button>

                <div className="bg-[#FFF3C4] text-[#5C4A00] font-bold px-4 py-3 rounded-full w-fit">
                  ⭐ {points}
                </div>

                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="bg-[#E8DDFF] text-[#4B367C] font-bold px-4 py-3 rounded-full w-fit"
                >
                  {soundEnabled ? "🔊 Sonido activado" : "🔇 Sonido apagado"}
                </button>

                <NavLink
                  to="/mi-perfil"
                  onClick={() => setMenuOpen(false)}
                  className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-semibold px-5 py-3 rounded-full text-center transition"
                >
                  Mi Perfil
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </NavLink>

                <NavLink
                  to="/registro"
                  className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-semibold px-5 py-3 rounded-full text-center transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Registro
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;