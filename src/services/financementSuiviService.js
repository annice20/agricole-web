import axios from "axios";

const API_URL = "https://agricole-backend.onrender.com/api/financements/suivi";

export const getSuiviFinancements = () => axios.get(API_URL);
