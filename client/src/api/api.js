import axios from "axios";

const FALLBACK_PRODUCTION_API_URL = "https://jms-public-school-chaudiha-gayq.onrender.com";
const isLocalHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (isLocalHost ? "http://localhost:5000" : FALLBACK_PRODUCTION_API_URL)
).replace(/\/$/, "");

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
