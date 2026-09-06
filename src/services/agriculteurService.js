import axios from "axios";

const API_URL = "http://localhost:8081/api";

const api = axios.create({
  baseURL: API_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

// Ajout automatique JWT

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error),
);

export const getAgriculteurs = () => {
  return api.get("/agriculteurs");
};

export const getAgriculteurById = (id) => {
  return api.get(`/agriculteurs/${id}`);
};

export const getAgriculteurByUtilisateurId = (utilisateurId) => {
  return api.get(`/agriculteurs/utilisateur/${utilisateurId}`);
};

export const createAgriculteur = (data) => {
  return api.post("/agriculteurs", data);
};

export const updateAgriculteur = (id, data) => {
  return api.put(`/agriculteurs/${id}`, data);
};

export const deleteAgriculteur = (id) => {
  return api.delete(`/agriculteurs/${id}`);
};
