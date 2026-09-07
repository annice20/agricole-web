import axios from "axios";

const API_URL = "https://agricole-backend.onrender.com/api/historique";

export const getHistoriqueActions = () => {
  return axios.get(API_URL);
};

export const ajouterHistoriqueAction = (historique) => {
  return axios.post(API_URL, historique);
};
