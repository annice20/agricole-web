import axios from "axios";

const API_URL = "https://agricole-backend.onrender.com/api/regions";

export const getRegions = async () => {
  const response = await axios.get(API_URL);

  return response.data;
};
