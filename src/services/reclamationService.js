import axios from "axios";

const API_URL = "http://localhost:8081/api/reclamations";

/**
 * Récupérer toutes les réclamations de l'agriculteur connecté
 */
export const getMesReclamations = async (agriculteurId) => {
  const response = await axios.get(`${API_URL}/agriculteur/${agriculteurId}`);

  return response.data;
};

/**
 * Ajouter une nouvelle réclamation
 */
export const ajouterReclamation = async (reclamation) => {
  const response = await axios.post(API_URL, reclamation);

  return response.data;
};

/**
 * Récupérer une réclamation par son id
 */
export const getReclamationById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);

  return response.data;
};

export const getReclamationsParRegion = async (regionId) => {
  const response = await axios.get(`${API_URL}/region/${regionId}`);
  return response.data;
};

/**
 * Modifier une réclamation
 */
export const modifierReclamation = async (id, reclamation) => {
  const response = await axios.put(`${API_URL}/${id}`, reclamation);

  return response.data;
};

/**
 * Supprimer une réclamation
 */
export const supprimerReclamation = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);

  return response.data;
};
