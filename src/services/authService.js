import api from "./api";

const getApiError = (error, fallbackMessage) => {
  return (
    error.response?.data || {
      message: fallbackMessage,
    }
  );
};

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw getApiError(error, "Error al iniciar sesión");
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData, {
      headers:
        userData instanceof FormData
          ? {
              "Content-Type": "multipart/form-data",
            }
          : undefined,
    });

    return response.data;
  } catch (error) {
    throw getApiError(error, "Error al registrar usuario");
  }
};

export const getMe = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    throw getApiError(error, "Error obteniendo perfil");
  }
};

export const updateMe = async (userData) => {
  try {
    const response = await api.put("/auth/me", userData, {
      headers:
        userData instanceof FormData
          ? {
              "Content-Type": "multipart/form-data",
            }
          : undefined,
    });

    return response.data;
  } catch (error) {
    throw getApiError(error, "Error actualizando perfil");
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });

    return response.data;
  } catch (error) {
    throw getApiError(error, "Error cambiando contraseña");
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", {
      email,
    });

    return response.data;
  } catch (error) {
    throw getApiError(
      error,
      "Error solicitando recuperación de contraseña",
    );
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });

    return response.data;
  } catch (error) {
    throw getApiError(error, "Error restableciendo contraseña");
  }
};