import axios from "axios";

const baseURL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/?$/, "/");

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  if (config.url?.startsWith("/")) {
    config.url = config.url.slice(1);
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
