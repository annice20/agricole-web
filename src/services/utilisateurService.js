import axios from "axios";
const API_URL = "http://localhost:8081/api/utilisateurs";

export const creerUtilisateur = (data) => axios.post(API_URL, data);

export const getUtilisateurs = () => axios.get(API_URL);

export const updateUtilisateur = (id, data) =>
  axios.put(`${API_URL}/${id}`, data);

export const changerRoleUtilisateur = (id, roleName, regionId = null) =>
  axios.patch(`${API_URL}/${id}`, { roleName, regionId });

export const supprimerUtilisateur = (id) => axios.delete(`${API_URL}/${id}`);
