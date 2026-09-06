import axios from "axios";

const API_URL = "http://localhost:8081/api/equipements";

export const getEquipements = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getEquipementById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const ajouterEquipement = async (equipement) => {
  const response = await axios.post(API_URL, equipement);
  return response.data;
};

export const updateEquipement = async (id, equipement) => {
  const response = await axios.put(`${API_URL}/${id}`, equipement);
  return response.data;
};

export const deleteEquipement = async (id) => {
  return axios.delete(`${API_URL}/${id}`);
};
