import axios from "axios";

const API_URL = "http://localhost:8081/api/programmes";

export const createProgramme = (data) => axios.post(API_URL, data);

export const getProgrammes = () => axios.get(API_URL);

export const getProgramme = (id) => axios.get(`${API_URL}/${id}`);

export const updateProgramme = (id, data) =>
  axios.put(`${API_URL}/${id}`, data);

export const deleteProgramme = (id) => axios.delete(`${API_URL}/${id}`);
