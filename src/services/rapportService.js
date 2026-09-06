import axios from "axios";

const API_URL = "http://localhost:8081/api/rapports/national";

export const telechargerRapportPdf = () =>
  axios.get(`${API_URL}/pdf`, { responseType: "blob" });
