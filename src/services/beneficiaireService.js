import axios from "axios";

const API_URL = "http://localhost:8081/api/agriculteurs";

export const getBeneficiairesParRegion = async (regionId) => {
  const response = await axios.get(
    `${API_URL}/beneficiaires/region/${regionId}`,
  );

  return response.data;
};
