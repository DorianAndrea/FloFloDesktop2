import {
  FaHome,
  FaSmile,
  FaClock,
  FaUserFriends,
  FaComments,
  FaMapMarkerAlt,
  FaPuzzlePiece,
  FaUsers,
  FaUserMd,
  FaChartBar,
  FaBrain,
  FaStar,
  FaUserCircle,
  FaVolumeUp,
  FaVolumeMute,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

export const navbarNavigation = {
  home: {
    label: "Inicio",
    path: "/",
    icon: FaHome,
    end: true,
  },

  activities: [
    {
      label: "Emociones",
      path: "/emociones",
      icon: FaSmile,
    },
    {
      label: "Rutinas",
      path: "/rutinas",
      icon: FaClock,
    },
    {
      label: "Amigos",
      path: "/amigos",
      icon: FaUserFriends,
    },
    {
      label: "Conversaciones",
      path: "/conversaciones",
      icon: FaComments,
    },
    {
      label: "Lugares",
      path: "/lugares",
      icon: FaMapMarkerAlt,
    },
    {
      label: "Perfil Sensorial",
      path: "/perfil-sensorial",
      icon: FaPuzzlePiece,
    },
  ],

  family: {
    label: "Mi familia",
    path: "/mi-familia",
    icon: FaUsers,
  },

  supportTeam: {
    label: "Equipo FloFlo",
    path: "/equipo-floflo",
    icon: FaUserMd,
  },

  dashboard: {
    label: "Panel de Apoyo",
    path: "/panel-padres",
    icon: FaChartBar,
  },

  intelligentReport: {
    label: "Informe Inteligente",
    path: "/informe-inteligente",
    icon: FaBrain,
  },

  achievements: {
    label: "Logros",
    path: "/logros",
    icon: FaStar,
  },

  profile: {
    label: "Mi Perfil",
    path: "/mi-perfil",
    icon: FaUserCircle,
  },

  sound: {
    enabledIcon: FaVolumeUp,
    disabledIcon: FaVolumeMute,
    enabledLabel: "Desactivar sonido",
    disabledLabel: "Activar sonido",
  },

  logout: {
    label: "Cerrar sesión",
    icon: FaSignOutAlt,
  },

  login: {
    label: "Iniciar sesión",
    path: "/login",
    icon: FaSignInAlt,
  },

  register: {
    label: "Registro",
    path: "/registro",
    icon: FaUserPlus,
  },
};

export const getNavbarLinks = ({
  user,
  canAccessMiFamilia,
  isParentMode,
  selectedChildId,
}) => {
  const links = [navbarNavigation.home];

  if (!user) {
    return links;
  }

  links.push(...navbarNavigation.activities);

  if (user.role === "parent") {
    if (canAccessMiFamilia) {
      links.push(navbarNavigation.family);
    }

    if (isParentMode) {
      links.push(navbarNavigation.supportTeam);
    }

    links.push(navbarNavigation.dashboard);

    links.push({
      ...navbarNavigation.intelligentReport,
      path: selectedChildId
        ? `/informe-inteligente?childId=${encodeURIComponent(
            selectedChildId,
          )}`
        : "/informe-inteligente",
    });
  }

  return links;
};