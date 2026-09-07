import axios from "axios";

const API_URL = "https://agricole-backend.onrender.com/api/rapports/national";

export const telechargerRapportPdf = () =>
  axios.get(`${API_URL}/pdf`, { responseType: "blob" });
