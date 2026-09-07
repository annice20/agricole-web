import axios from "axios";

const API_URL = "https://agricole-backend.onrender.com/api";

export const getRegions = () => axios.get(`${API_URL}/regions`);
export const getDistrictsByRegion = (regionId) =>
  axios.get(`${API_URL}/districts/region/${regionId}`);
