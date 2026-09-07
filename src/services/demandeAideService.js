import axios from "axios";

const API_URL = "https://agricole-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

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

export const getDemandes = () => {
  return api.get("/demandes");
};

export const createDemande = (data) => {
  return api.post("/demandes", data);
};

export const deleteDemande = (id) => {
  return api.delete(`/demandes/${id}`);
};

export const updateDemande = (id, data) => {
  return api.put(`/demandes/${id}`, data);
};
