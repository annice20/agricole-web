import axios from "axios";

const API_URL = "http://localhost:8081/api/historique";

export const getHistoriqueActions = () => {
  return axios.get(API_URL);
};

export const ajouterHistoriqueAction = (historique) => {
  return axios.post(API_URL, historique);
};
