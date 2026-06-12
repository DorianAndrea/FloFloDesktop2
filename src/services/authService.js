import api from "./api";

export const login = async (email, password) =>{
    try {
        const response = await api.post("/auth/login",{
        email,
        password
    });
    return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error al iniciar sesión" };
    }  
}

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "No se pudo registrar el usuario";

    throw new Error(message);
  }
};
export const getMe = async () => {
    const response = await api.get("/auth/me");
    return response.data;
}
export const updateMe = async(userData) =>{
    const response = await api.put("/auth/me", userData);
    return response.data;
}