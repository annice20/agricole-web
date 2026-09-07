import axios from "axios";

const API_URL = "https://agricole-backend.onrender.com/api/distributions";

export const getDistributions = () => axios.get(API_URL);

export const createDistribution = (data) => axios.post(API_URL, data);

export const updateDistribution = (id, data) =>
  axios.put(`${API_URL}/${id}`, data);

export const deleteDistribution = (id) => axios.delete(`${API_URL}/${id}`);

export const getMesAides = async (agriculteurId) => {
  const response = await axios.get(`${API_URL}/agriculteur/${agriculteurId}`);

  return response.data;
};

export const getDistributionsParRegion = async (regionId) => {
  const response = await axios.get(`${API_URL}/region/${regionId}`);
  return response.data;
};
