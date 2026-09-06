import axios from "axios";

const API_URL = "http://localhost:8081/api/financements/suivi";

export const getSuiviFinancements = () => axios.get(API_URL);
