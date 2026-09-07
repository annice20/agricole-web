import axios from "axios";
const API_URL = "https://agricole-backend.onrender.com/api/notifications";

export const getNotifications = async (utilisateurId) => {
  if (!utilisateurId) {
    console.warn("getNotifications annulé : utilisateurId est manquant.");
    return [];
  }
  const response = await axios.get(`${API_URL}/utilisateur/${utilisateurId}`);
  return response.data;
};

export const marquerCommeLu = async (id) => {
  if (!id) return;
  await axios.put(`${API_URL}/${id}/lu`);
};

export const créerNotification = async (
  utilisateurId,
  message,
  titre = null,
) => {
  await axios.post(API_URL, {
    utilisateurId,
    titre,
    message,
  });
};
