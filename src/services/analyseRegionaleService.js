import axios from "axios";

const API_URL = "https://agricole-backend.onrender.com/api/regions/analyse";

export const getAnalyseRegionale = () => axios.get(API_URL);
