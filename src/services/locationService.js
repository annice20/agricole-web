import axios from "axios";

const API_URL = "http://localhost:8081/api";

export const getRegions = () => axios.get(`${API_URL}/regions`);
export const getDistrictsByRegion = (regionId) =>
  axios.get(`${API_URL}/districts/region/${regionId}`);
