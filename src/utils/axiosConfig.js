import axios from "axios";

// Fonction unifiée pour lire le token sans conflit de clé
function lireToken() {
  const sessionBrute =
    localStorage.getItem("session") ||
    sessionStorage.getItem("session") ||
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  if (!sessionBrute) return null;

  try {
    const data = JSON.parse(sessionBrute);
    return data?.token || null;
  } catch (e) {
    return null;
  }
}

// Configuration globale de l'URL de base (optionnel mais recommandé)
axios.defaults.baseURL = "https://agricole-backend.onrender.com";

// Intercepteur de Requête : Attache "Authorization: Bearer <token>"
axios.interceptors.request.use(
  (config) => {
    const token = lireToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Intercepteur de Réponse : Gère la déconnexion automatique proprement
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const tokenPresent = lireToken();

      // On ne vide et ne redirige QUE si le token est réellement absent/expiré
      if (
        !tokenPresent &&
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/"
      ) {
        localStorage.removeItem("session");
        sessionStorage.removeItem("session");
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axios;
