import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";

import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";
import {
  getMyDashboard,
  getChildDashboard,
} from "../services/parentDashboardService";
import felixLogo from "../assets/webp/felix_cara_sonriendo.webp";
import { clearFloFloCache } from "../utils/cache";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [achievementCount, setAchievementCount] = useState(0);

  const { user, logout, soundEnabled, setSoundEnabled } = useFloFlo();

  const {
    parentChildren,
    selectedChild,
    selectedChildId,
    loadingChildren,
    selectChild,
    getChildDisplayName,
  } = useSelectedChild();

  const isParent = user?.role === "parent";
  const isParentMode = isParent && Boolean(selectedChildId);
  const intelligentReportPath = selectedChildId
    ? `/informe-inteligente?childId=${selectedChildId}`
    : "/informe-inteligente";

  const activityLinks = [
    { name: "Emociones", path: "/emociones", emoji: "😊" },
    { name: "Rutinas", path: "/rutinas", emoji: "🕒" },
    { name: "Amigos", path: "/amigos", emoji: "👨‍👩‍👧" },
    { name: "Conversaciones", path: "/conversaciones", emoji: "💬" },
    { name: "Lugares", path: "/lugares", emoji: "📍" },
    { name: "Perfil Sensorial", path: "/perfil-sensorial", emoji: "🧩" },
  ];

  useEffect(() => {
    const loadNavbarAchievements = async () => {
      try {
        if (!user?.id) {
          setAchievementCount(0);
          return;
        }

        if (isParent && loadingChildren) {
          return;
        }

        if (isParent && !selectedChildId) {
          setAchievementCount(0);
          return;
        }

        const data = isParentMode
          ? await getChildDashboard(selectedChildId)
          : await getMyDashboard();

        setAchievementCount(data?.achievements || 0);
      } catch (error) {
        console.error("Error cargando logros navbar:", error);
        setAchievementCount(0);
      }
    };

    loadNavbarAchievements();
  }, [
    user?.id,
    user?.role,
    isParent,
    isParentMode,
    selectedChildId,
    loadingChildren,
  ]);

  const linkClass = ({ isActive }) =>
    `font-semibold transition ${
      isActive ? "text-[#9B7BE8]" : "text-[#5B4B8A] hover:text-[#8B6FD6]"
    }`;

  const closeMenus = () => {
    setMenuOpen(false);
    setActivitiesOpen(false);
  };

  const handleLogout = () => {
    clearFloFloCache();
    logout();
    setAchievementCount(0);
    closeMenus();
  };

  const renderSelectedChildDesktop = () => {
    if (!isParent) return null;

    return (
      <div className="mt-1 bg-[#CFEFD9] border border-[#9ED5B3] rounded-xl px-3 py-2">
        <p className="text-xs font-semibold text-[#2F6B4F]">Niño activo</p>

        {loadingChildren ? (
          <p className="text-sm font-bold text-[#1F4F39]">Cargando...</p>
        ) : parentChildren.length === 0 ? (
          <p className="text-sm font-bold text-[#1F4F39]">
            Sin niño/a asociado
          </p>
        ) : parentChildren.length > 1 ? (
          <select
            value={selectedChildId}
            onChange={(e) => selectChild(e.target.value)}
            className="mt-1 max-w-[150px] rounded-xl border border-[#9ED5B3] bg-white px-2 py-1 text-sm font-bold text-[#1F4F39] focus:outline-none"
          >
            {parentChildren.map((child) => (
              <option key={child.id} value={child.id}>
                {getChildDisplayName(child)}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm font-bold text-[#1F4F39]">
            👧 {getChildDisplayName(selectedChild)}
          </p>
        )}
      </div>
    );
  };

  const renderSelectedChildMobile = () => {
    if (!isParent) return null;

    return (
      <div className="mt-3 bg-[#CFEFD9] border border-[#9ED5B3] rounded-2xl px-4 py-3">
        <p className="text-xs font-semibold text-[#2F6B4F] uppercase tracking-wide">
          Niño activo
        </p>

        {loadingChildren ? (
          <p className="text-lg font-bold text-[#1F4F39] mt-1">Cargando...</p>
        ) : parentChildren.length === 0 ? (
          <p className="text-lg font-bold text-[#1F4F39] mt-1">
            Sin niño/a asociado
          </p>
        ) : parentChildren.length > 1 ? (
          <select
            value={selectedChildId}
            onChange={(e) => selectChild(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#9ED5B3] bg-white px-3 py-2 text-[#1F4F39] font-bold focus:outline-none"
          >
            {parentChildren.map((child) => (
              <option key={child.id} value={child.id}>
                {getChildDisplayName(child)}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-lg font-bold text-[#1F4F39] mt-1">
            👧 {getChildDisplayName(selectedChild)}
          </p>
        )}
      </div>
    );
  };

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md border-b shadow-sm transition ${
        user
          ? isParent
            ? "bg-[#CFEFD9]/95 border-[#9ED5B3]"
            : "bg-[#F3ECFF]/95 border-[#D6C7FF]"
          : "bg-white/90 border-[#E3D9FF]"
      }`}
    >
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

              {isParent && (
                <NavLink
                  to="/mi-familia"
                  className={({ isActive }) =>
                    `font-semibold px-4 py-2 rounded-full transition ${
                      isActive
                        ? "bg-[#FFF3C4] text-[#6B5A00] border border-[#E8D785]"
                        : "bg-[#FFF9DF] text-[#6B5A00] border border-[#E8D785] hover:bg-[#FFF3C4]"
                    }`
                  }
                >
                  Mi familia
                </NavLink>
              )}

              {isParentMode && (
                <NavLink
                  to="/equipo-floflo"
                  className={({ isActive }) =>
                    `font-semibold px-4 py-2 rounded-full transition ${
                      isActive
                        ? "bg-[#E8DDFF] text-[#6B4FC3] border border-[#CDBBFF]"
                        : "bg-[#F3ECFF] text-[#6B4FC3] border border-[#D6C7FF] hover:bg-[#E8DDFF]"
                    }`
                  }
                >
                  Equipo FloFlo
                </NavLink>
              )}

              {isParent && (
                <NavLink
                  to="/panel-padres"
                  className={({ isActive }) =>
                    `font-semibold px-4 py-2 rounded-full transition ${
                      isActive
                        ? "bg-[#CFEFD9] text-[#2F6B4F] border border-[#9ED5B3]"
                        : "bg-[#EAF8EF] text-[#2F6B4F] border border-[#9ED5B3] hover:bg-[#CFEFD9]"
                    }`
                  }
                >
                  Panel de Apoyo
                </NavLink>
              )}
              {isParent && (
                <NavLink
                  to={intelligentReportPath}
                  className={({ isActive }) =>
                    `font-semibold px-4 py-2 rounded-full transition ${
                      isActive
                        ? "bg-[#E8DDFF] text-[#6B4FC3] border border-[#CDBBFF]"
                        : "bg-[#F3ECFF] text-[#6B4FC3] border border-[#D6C7FF] hover:bg-[#E8DDFF]"
                    }`
                  }
                >
                  Informe Inteligente
                </NavLink>
              )}
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
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-[#4B367C] whitespace-nowrap">
                  Hola, {user.firstName}
                </span>

                {renderSelectedChildDesktop()}

                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full w-fit mt-1 ${
                    isParent
                      ? "bg-[#CFEFD9] text-[#2F6B4F] border border-[#9ED5B3]"
                      : "bg-[#E8DDFF] text-[#6B4FC3]"
                  }`}
                >
                  {isParent ? "Padre/Cuidador" : "Niño"}
                </span>
              </div>

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
        <div className="lg:hidden bg-white border-t border-[#E3D9FF] px-6 py-5 max-h-[calc(100vh-90px)] overflow-y-auto">
          <div className="flex flex-col gap-5">
            <NavLink to="/" className={linkClass} onClick={closeMenus}>
              Home
            </NavLink>

            {user ? (
              <>
                <div className="bg-[#F7F3FF] rounded-2xl p-4">
                  <p className="font-bold text-[#4B367C]">
                    Hola, {user.firstName}
                  </p>

                  {renderSelectedChildMobile()}

                  <p
                    className={`text-sm font-bold px-3 py-2 rounded-full w-fit mt-2 ${
                      isParent
                        ? "bg-[#CFEFD9] text-[#2F6B4F] border border-[#9ED5B3]"
                        : "bg-[#E8DDFF] text-[#6B4FC3]"
                    }`}
                  >
                    Perfil: {isParent ? "Padre/Cuidador" : "Niño"}
                  </p>
                </div>

                <div>
                  <p className="font-bold text-[#4B367C] mb-3">Actividades</p>

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

                {isParent && (
                  <NavLink
                    to="/mi-familia"
                    onClick={closeMenus}
                    className="bg-[#FFF9DF] text-[#6B5A00] border border-[#E8D785] font-bold px-4 py-3 rounded-full w-fit"
                  >
                    👨‍👩‍👧‍👦 Mi familia
                  </NavLink>
                )}

                {isParentMode && (
                  <NavLink
                    to="/equipo-floflo"
                    onClick={closeMenus}
                    className="bg-[#F3ECFF] text-[#6B4FC3] border border-[#D6C7FF] font-bold px-4 py-3 rounded-full w-fit"
                  >
                    👥 Equipo FloFlo
                  </NavLink>
                )}

                {isParent && (
                  <NavLink
                    to="/panel-padres"
                    onClick={closeMenus}
                    className="bg-[#CFEFD9] text-[#2F6B4F] border border-[#9ED5B3] font-bold px-4 py-3 rounded-full w-fit"
                  >
                    👨‍👩‍👧 Panel de Apoyo
                  </NavLink>
                )}
                {isParent && (
                  <NavLink
                    to={intelligentReportPath}
                    onClick={closeMenus}
                    className="bg-[#F3ECFF] text-[#6B4FC3] border border-[#D6C7FF] font-bold px-4 py-3 rounded-full w-fit"
                  >
                    🧠 Informe Inteligente
                  </NavLink>
                )}

                <NavLink
                  to="/logros"
                  onClick={closeMenus}
                  className="bg-[#FFF3C4] text-[#5C4A00] font-bold px-4 py-3 rounded-full w-fit"
                >
                  ⭐ {achievementCount} Logros
                </NavLink>

                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="bg-[#E8DDFF] text-[#4B367C] font-bold px-4 py-3 rounded-full w-fit"
                >
                  {soundEnabled ? "🔊 Sonido activado" : "🔇 Sonido apagado"}
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
                  className="bg-red-50 border-2 border-red-200 text-red-600 font-bold px-5 py-3 rounded-full text-center hover:bg-red-100 transition"
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
