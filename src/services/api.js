import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    console.log("🔎 API ERROR DEBUG", {
      status,
      requestUrl,
      pathname: window.location.pathname,
    });

    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/reset-password");

    const isPublicInvitationRequest = requestUrl.includes(
      "/parent-child/team/invitations/",
    );

    if (status === 401 && !isAuthRequest && !isPublicInvitationRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("selectedChild");

      window.dispatchEvent(new Event("floflo:auth-expired"));

      if (window.location.pathname !== "/login") {
        console.log("🚨 REDIRECT AUTOMÁTICO A LOGIN", {
          status,
          requestUrl,
        });
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
