import axios from "axios";

const base = import.meta.env.VITE_API_URL || "http://54.89.92.120:30001";
if (import.meta.env.DEV) {
  // High-signal runtime hint when env points at wrong backend.
  // eslint-disable-next-line no-console
  console.log("[api] baseURL =", `${base}/api`);
}

const api = axios.create({
  baseURL: `${base}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
