import axios from "axios";

const API_URL = "http://localhost:8081/api/financements";

export const getAllFinancements = () => axios.get(API_URL);

export const getFinancementById = (id) => axios.get(`${API_URL}/${id}`);

export const createFinancement = (data) => axios.post(API_URL, data);

export const updateFinancement = (id, data) =>
  axios.put(`${API_URL}/${id}`, data);

export const deleteFinancement = (id) => axios.delete(`${API_URL}/${id}`);
