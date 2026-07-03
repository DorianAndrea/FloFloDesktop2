import api from "./api";

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error al iniciar sesión" };
  }
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateMe = async (userData) => {
  const response = await api.put("/auth/me", userData);
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Error cambiando contraseña",
      }
    );
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", {
      email,
    });

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Error solicitando recuperación de contraseña",
      }
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
    throw (
      error.response?.data || {
        message: "Error restableciendo contraseña",
      }
    );
  }
};