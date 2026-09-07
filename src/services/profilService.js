import axios from "axios";

const API_URL = "https://agricole-backend.onrender.com/api/profil";

export const getProfil = (id) => axios.get(`${API_URL}/${id}`);
export const modifierProfil = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const changerMotDePasse = (id, data) =>
  axios.put(`${API_URL}/${id}/mot-de-passe`, data);
