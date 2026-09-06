import axios from "axios";

const API_URL = "http://localhost:8081/api/aides/repartition";

export const getRepartitionAides = () => axios.get(API_URL);
