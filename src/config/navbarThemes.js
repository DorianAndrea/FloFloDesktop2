export const navbarThemes = {
  child: {
    label: "Niño/a",
    background: "#7955B8",
    foreground: "#FFFFFF",
    border: "#62429D",
    hover: "#6945A5",
    active: "#513285",
  },

  primary_caregiver: {
    label: "Cuidador/a principal",
    background: "#DCECFB",
    foreground: "#285D91",
    border: "#B0CFEA",
    hover: "#C9E0F5",
    active: "#B5D2F0",
  },

  caregiver: {
    label: "Cuidador/a",
    background: "#DDF2E7",
    foreground: "#28694F",
    border: "#AED9C1",
    hover: "#CBE9D8",
    active: "#B1DCC4",
  },

  family: {
    label: "Familiar",
    background: "#FCE4EC",
    foreground: "#963E65",
    border: "#EAB9CF",
    hover: "#F6D2E1",
    active: "#EDBDD3",
  },

  therapist: {
    label: "Terapeuta",
    background: "#FBEAD8",
    foreground: "#925B24",
    border: "#E9CAA7",
    hover: "#F7DEC3",
    active: "#EFCBA5",
  },

  teacher: {
    label: "Profesor/a",
    background: "#FFF1CC",
    foreground: "#896619",
    border: "#E9D590",
    hover: "#FCE6B0",
    active: "#F2D88B",
  },

  professional: {
    label: "Profesional",
    background: "#DDEFF0",
    foreground: "#28676D",
    border: "#AFD6D9",
    hover: "#CAE5E7",
    active: "#B1D8DC",
  },

  default: {
    label: "FloFlo",
    background: "#F3F0F8",
    foreground: "#5B4B8A",
    border: "#DCD4E9",
    hover: "#E9E2F3",
    active: "#DCD1EF",
  },
};

export const getNavbarTheme = (role, accessProfile) => {
  if (role === "child") {
    return navbarThemes.child;
  }

  if (role === "parent") {
    return Object.prototype.hasOwnProperty.call(navbarThemes, accessProfile) &&
      accessProfile !== "child"
      ? navbarThemes[accessProfile]
      : navbarThemes.default;
  }

  return navbarThemes.default;
};
