import axios from "axios";

const API_URL = "https://agricole-backend.onrender.com/api/aides/repartition";

export const getRepartitionAides = () => axios.get(API_URL);
