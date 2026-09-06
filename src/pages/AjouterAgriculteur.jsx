import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, MapPin, ArrowLeft, Globe, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { getSession } from "../utils/auth";
import { getRegions, getDistrictsByRegion } from "../services/locationService";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

export default function AjouterAgriculteur() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [coordonnees, setCoordonnees] = useState(null); // { latitude, longitude }

  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedRegionNom, setSelectedRegionNom] = useState("");
  const [selectedDistrictNom, setSelectedDistrictNom] = useState("");

  // Stocke l'utilisateur connecté avec son rôle extrait de la session
  const [currentUser, setCurrentUser] = useState({
    nom: "Utilisateur",
    role: "",
  });

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    genre: "Masculin",
    dateNaissance: "",
    cin: "",
    telephone: "",
    email: "",
    adresse: "",
    culturePrincipale: "Maïs",
    superficie: "",
    actif: false,
    districtId: "",
  });

  // Extraction des données de session utilisateur pour l'affichage de la Navbar
  useEffect(() => {
    const session = getSession();
    setCurrentUser({
      nom: session.nom || "Utilisateur",
      role: session.role || "",
    });
  }, []);

  useEffect(() => {
    const chargerRegions = async () => {
      try {
        const response = await getRegions();
        setRegions(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Impossible de charger les régions");
      }
    };
    chargerRegions();
  }, []);

  useEffect(() => {
    if (!selectedRegionId) {
      setDistricts([]);
      return;
    }
    const chargerDistricts = async () => {
      try {
        const response = await getDistrictsByRegion(selectedRegionId);
        setDistricts(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Impossible de charger les districts");
      }
    };
    chargerDistricts();
  }, [selectedRegionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "adresse") setCoordonnees(null);
  };

  // GÉOCODAGE AUTOMATIQUE via OpenStreetMap Nominatim
  const geocoderAdresse = async (adresse, districtNom, regionNom) => {
    const query = `${adresse}, ${districtNom}, ${regionNom}, Madagascar`;

    try {
      setGeoLoading(true);
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: query,
            format: "json",
            limit: 1,
            countrycodes: "mg",
          },
          headers: {
            "Accept-Language": "fr",
          },
        },
      );

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const coords = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        };
        setCoordonnees(coords);
        toast.success(
          `Localisation trouvée : ${parseFloat(result.lat).toFixed(4)}, ${parseFloat(result.lon).toFixed(4)}`,
        );
        return coords;
      } else {
        const fallbackQuery = `${districtNom}, ${regionNom}, Madagascar`;
        const fallbackResponse = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: fallbackQuery,
              format: "json",
              limit: 1,
              countrycodes: "mg",
            },
          },
        );

        if (fallbackResponse.data && fallbackResponse.data.length > 0) {
          const result = fallbackResponse.data[0];
          const coords = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
          };
          setCoordonnees(coords);
          toast.warning(
            `Adresse approximative (district) : ${parseFloat(result.lat).toFixed(4)}, ${parseFloat(result.lon).toFixed(4)}`,
          );
          return coords;
        } else {
          toast.warning(
            "Localisation introuvable — l'agriculteur sera enregistré sans coordonnées GPS.",
          );
          return null;
        }
      }
    } catch (error) {
      console.error("Erreur Nominatim :", error);
      toast.warning(
        "Service de géolocalisation indisponible — enregistrement sans GPS.",
      );
      return null;
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.districtId) {
      toast.warning("Veuillez sélectionner un district pour la localisation.");
      return;
    }

    setLoading(true);
    let agentEmail = null;

    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        agentEmail = user.email;
      }
    } catch (error) {
      console.error("Erreur lecture session :", error);
    }

    let coords = coordonnees;
    if (!coords) {
      coords = await geocoderAdresse(
        formData.adresse,
        selectedDistrictNom,
        selectedRegionNom,
      );
    }

    const donneesAEnvoyer = {
      nom: formData.nom,
      prenom: formData.prenom,
      genre: formData.genre,
      sexe: formData.genre,
      dateNaissance: formData.dateNaissance,
      cin: formData.cin,
      telephone: formData.telephone,
      email: formData.email,
      adresse: formData.adresse,
      culturePrincipale: formData.culturePrincipale,
      typeCulture: formData.culturePrincipale,
      superficie: formData.superficie ? parseFloat(formData.superficie) : null,
      actif: false,
      districtId: parseInt(formData.districtId, 10),
      createurEmail: agentEmail,
      latitude: coords ? coords.latitude : null,
      longitude: coords ? coords.longitude : null,
    };

    try {
      await axios.post(
        "http://localhost:8081/api/agriculteurs",
        donneesAEnvoyer,
      );
      toast.success("Producteur enregistré avec succès !");
      navigate("/agriculteurs");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Échec de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        {/* NAVBAR */}
        <div className="flex flex-1 pt-16">
          <MyNavbar />

          {/* CONTENU PRINCIPAL DE LA PAGE */}
          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64 flex justify-center items-start">
            <div className="bg-white/50 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl w-full max-w-3xl p-6 sm:p-10 relative">
              <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 text-green-800 hover:text-green-950 flex items-center gap-1 text-sm font-bold transition"
              >
                <ArrowLeft size={16} /> Retour
              </button>

              <div className="flex flex-col items-center mb-6 mt-4 sm:mt-0">
                <div className="bg-green-700 p-3 rounded-2xl shadow-md text-white mb-2">
                  <UserPlus size={24} />
                </div>
                <h1 className="text-2xl font-black text-green-900 tracking-tight">
                  Nouveau Producteur
                </h1>
                <p className="text-xs text-green-700/80 font-medium mt-1 text-center max-w-md">
                  Le producteur sera enregistré comme non-bénéficiaire. La
                  localisation GPS sera détectée automatiquement via l'adresse.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Identité */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      className="w-full border border-white/60 bg-white/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                      className="w-full border border-white/60 bg-white/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-1">
                      Genre
                    </label>
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      className="w-full border border-white/60 bg-white/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none cursor-pointer"
                    >
                      <option value="Masculin">Masculin</option>
                      <option value="Féminin">Féminin</option>
                    </select>
                  </div>
                </div>

                {/* Naissance, CIN, Téléphone */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-1">
                      Date de Naissance
                    </label>
                    <input
                      type="date"
                      name="dateNaissance"
                      value={formData.dateNaissance}
                      onChange={handleChange}
                      required
                      className="w-full border border-white/60 bg-white/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-1">
                      Numéro CIN
                    </label>
                    <input
                      type="text"
                      name="cin"
                      value={formData.cin}
                      onChange={handleChange}
                      maxLength="12"
                      required
                      className="w-full border border-white/60 bg-white/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      required
                      className="w-full border border-white/60 bg-white/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none"
                    />
                  </div>
                </div>

                {/* Email, Adresse */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border border-white/60 bg-white/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-1">
                      Adresse (Ville/Commune)
                    </label>
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Ambohimanarina"
                      className="w-full border border-white/60 bg-white/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none"
                    />
                  </div>
                </div>

                {/* Données Agricoles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-green-900/5 p-4 rounded-xl border border-green-900/10">
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-800 mb-1">
                      Culture Principale
                    </label>
                    <select
                      name="culturePrincipale"
                      value={formData.culturePrincipale}
                      onChange={handleChange}
                      className="w-full border border-white/60 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none cursor-pointer"
                    >
                      <option value="Maïs">Maïs</option>
                      <option value="Vanille">Vanille</option>
                      <option value="Riz">Riz</option>
                      <option value="Girofle">Girofle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-800 mb-1">
                      Superficie Exploitation (Ha)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="superficie"
                      value={formData.superficie}
                      onChange={handleChange}
                      placeholder="Ex: 0.05"
                      className="w-full border border-white/60 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none"
                    />
                  </div>
                </div>

                {/* Localisation Géographique */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-1 flex items-center gap-1">
                      <Globe size={12} /> Région
                    </label>
                    <select
                      value={selectedRegionId}
                      onChange={(e) => {
                        const regionSelectionnee = regions.find(
                          (r) => r.id === parseInt(e.target.value, 10),
                        );
                        setSelectedRegionId(e.target.value);
                        setSelectedRegionNom(regionSelectionnee?.nom || "");
                        setFormData({ ...formData, districtId: "" });
                        setSelectedDistrictNom("");
                        setCoordonnees(null);
                      }}
                      required
                      className="w-full border border-white/60 bg-white/50 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-green-700 outline-none cursor-pointer"
                    >
                      <option value="">-- Choisir la région --</option>
                      {regions.map((reg) => (
                        <option key={reg.id} value={reg.id}>
                          {reg.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-900 mb-1 flex items-center gap-1">
                      <MapPin size={12} /> District de liaison
                    </label>
                    <select
                      name="districtId"
                      value={formData.districtId}
                      onChange={(e) => {
                        const districtSelectionne = districts.find(
                          (d) => d.id === parseInt(e.target.value, 10),
                        );
                        setSelectedDistrictNom(districtSelectionne?.nom || "");
                        setFormData({
                          ...formData,
                          districtId: e.target.value,
                        });
                        setCoordonnees(null);
                      }}
                      disabled={!selectedRegionId}
                      required
                      className="w-full border border-white/60 bg-white/50 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-green-700 outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="">-- Sélectionner le district --</option>
                      {districts.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* STATUT GPS */}
                {formData.districtId && (
                  <div
                    className={`rounded-xl p-3 border flex items-center gap-3 text-xs font-semibold transition-all ${
                      coordonnees
                        ? "bg-green-100/80 border-green-400 text-green-800"
                        : "bg-orange-50/80 border-orange-300 text-orange-800"
                    }`}
                  >
                    {coordonnees ? (
                      <>
                        <CheckCircle
                          size={16}
                          className="text-green-600 shrink-0"
                        />
                        <span>
                          GPS détecté automatiquement :{" "}
                          <strong>{coordonnees.latitude.toFixed(5)}</strong>,{" "}
                          <strong>{coordonnees.longitude.toFixed(5)}</strong>
                        </span>
                      </>
                    ) : (
                      <>
                        <MapPin
                          size={16}
                          className="text-orange-500 shrink-0"
                        />
                        <span>
                          La localisation GPS sera détectée automatiquement lors
                          de l'enregistrement.
                        </span>
                      </>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || geoLoading}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-bold transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {loading || geoLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>
                        {geoLoading
                          ? "Détection GPS en cours..."
                          : "Enregistrement..."}
                      </span>
                    </div>
                  ) : (
                    "Enregistrer le Producteur"
                  )}
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
