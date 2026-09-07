import axios from "axios";
import { getSession } from "../utils/auth"; // Récupère la session (où le token est stocké)

const api = axios.create({
  baseURL: "https://agricole-backend.onrender.com",
});

// Cet intercepteur s'assure d'injecter le token TOUT JUSTE récupéré lors de l'OTP
api.interceptors.request.use(
  (config) => {
    const session = getSession();
    const token = session?.token || localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const getDashboard = () => {
  return api.get("/api/dashboard");
};
