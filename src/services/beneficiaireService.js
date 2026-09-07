import axios from "axios";

const API_URL = "https://agricole-backend.onrender.com/api/agriculteurs";

export const getBeneficiairesParRegion = async (regionId) => {
  const response = await axios.get(
    `${API_URL}/beneficiaires/region/${regionId}`,
  );

  return response.data;
};
