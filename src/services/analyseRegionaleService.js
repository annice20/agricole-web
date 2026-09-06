import axios from "axios";

const API_URL = "http://localhost:8081/api/regions/analyse";

export const getAnalyseRegionale = () => axios.get(API_URL);
