import axios from "axios";

const SILENT_ENDPOINTS = ["/users/me", "/auth/"];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isSilentEndpoint = SILENT_ENDPOINTS.some((path) =>
      requestUrl.includes(path)
    );

    if (error.response?.status === 401 && !isSilentEndpoint) {
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
