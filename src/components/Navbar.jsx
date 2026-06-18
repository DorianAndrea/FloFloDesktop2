import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";

import { useFloFlo } from "../context/FloFloContext";
import { getParentDashboard } from "../services/parentDashboardService";
import felixLogo from "../assets/webp/felix_cara_sonriendo.webp";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [achievementCount, setAchievementCount] = useState(0);

  const { user, logout, soundEnabled, setSoundEnabled } = useFloFlo();

  const activityLinks = [
    { name: "Emociones", path: "/emociones", emoji: "😊" },
    { name: "Rutinas", path: "/rutinas", emoji: "🕒" },
    { name: "Amigos", path: "/amigos", emoji: "👨‍👩‍👧" },
    { name: "Conversaciones", path: "/conversaciones", emoji: "💬" },
    { name: "Lugares", path: "/lugares", emoji: "📍" },
  ];

  useEffect(() => {
    const loadNavbarAchievements = async () => {
      try {
        if (!user?.id) {
          setAchievementCount(0);
          return;
        }

        const data = await getParentDashboard(user.id);
        setAchievementCount(data.achievements || 0);
      } catch (error) {
        console.error("Error cargando logros navbar:", error);
      }
    };

    loadNavbarAchievements();
  }, [user]);

  const linkClass = ({ isActive }) =>
    `font-semibold transition ${
      isActive
        ? "text-[#9B7BE8]"
        : "text-[#5B4B8A] hover:text-[#8B6FD6]"
    }`;

  const closeMenus = () => {
    setMenuOpen(false);
    setActivitiesOpen(false);
  };

  const handleLogout = () => {
    logout();
    setAchievementCount(0);
    closeMenus();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E3D9FF] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 flex-shrink-0">
          <img src={felixLogo} alt="FloFlo" className="w-12 h-12" />

          <span className="text-3xl font-bold text-[#4B367C]">
            FloFlo
          </span>
        </NavLink>

        <div className="hidden lg:flex items-center gap-7 flex-1 justify-center">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          {user && (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActivitiesOpen(!activitiesOpen)}
                  className="font-semibold text-[#5B4B8A] hover:text-[#8B6FD6] transition flex items-center gap-2"
                >
                  Actividades
                  <FaChevronDown
                    className={`text-sm transition ${
                      activitiesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activitiesOpen && (
                  <div className="absolute top-9 left-0 bg-white border border-[#E3D9FF] shadow-lg rounded-2xl p-3 w-56">
                    {activityLinks.map((link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => setActivitiesOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
                            isActive
                              ? "bg-[#F1EBFF] text-[#9B7BE8]"
                              : "text-[#5B4B8A] hover:bg-[#F7F3FF]"
                          }`
                        }
                      >
                        <span>{link.emoji}</span>
                        <span>{link.name}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              <NavLink
                to="/panel-padres"
                className={({ isActive }) =>
                  `font-semibold px-4 py-2 rounded-full transition ${
                    isActive
                      ? "bg-[#E8DDFF] text-[#4B367C]"
                      : "bg-[#F5F0FF] text-[#5B4B8A] hover:bg-[#E8DDFF]"
                  }`
                }
              >
                Panel Padres
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

              <NavLink
                to="/logros"
                className="bg-[#FFF3C4] text-[#5C4A00] font-bold px-4 py-2 rounded-full shadow-sm hover:shadow-md transition flex items-center gap-2"
              >
                <span>⭐</span>
                <span>{achievementCount}</span>
              </NavLink>

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

              <button
                type="button"
                onClick={handleLogout}
                className="text-red-500 font-semibold hover:text-red-700 transition"
              >
                Salir
              </button>
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
            <NavLink to="/" className={linkClass} onClick={closeMenus}>
              Home
            </NavLink>

            {user ? (
              <>
                <div>
                  <p className="font-bold text-[#4B367C] mb-3">
                    Actividades
                  </p>

                  <div className="flex flex-col gap-3 pl-3">
                    {activityLinks.map((link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={closeMenus}
                        className={linkClass}
                      >
                        {link.emoji} {link.name}
                      </NavLink>
                    ))}
                  </div>
                </div>

                <NavLink
                  to="/panel-padres"
                  onClick={closeMenus}
                  className="bg-[#F5F0FF] text-[#4B367C] font-bold px-4 py-3 rounded-full w-fit"
                >
                  👨‍👩‍👧 Panel Padres
                </NavLink>

                <NavLink
                  to="/logros"
                  onClick={closeMenus}
                  className="bg-[#FFF3C4] text-[#5C4A00] font-bold px-4 py-3 rounded-full w-fit"
                >
                  ⭐ {achievementCount} Logros
                </NavLink>

                <div className="font-semibold text-[#4B367C]">
                  Hola, {user.firstName}
                </div>

                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="bg-[#E8DDFF] text-[#4B367C] font-bold px-4 py-3 rounded-full w-fit"
                >
                  {soundEnabled
                    ? "🔊 Sonido activado"
                    : "🔇 Sonido apagado"}
                </button>

                <NavLink
                  to="/mi-perfil"
                  onClick={closeMenus}
                  className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-semibold px-5 py-3 rounded-full text-center transition"
                >
                  Mi Perfil
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left text-red-500 font-semibold"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass} onClick={closeMenus}>
                  Login
                </NavLink>

                <NavLink
                  to="/registro"
                  className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-semibold px-5 py-3 rounded-full text-center transition"
                  onClick={closeMenus}
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