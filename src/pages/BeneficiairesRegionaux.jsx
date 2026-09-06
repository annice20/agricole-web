import { useEffect, useState } from "react";
import { Users, Search, MapPin, Phone, User } from "lucide-react";
import { toast } from "react-toastify";
import { getBeneficiairesParRegion } from "../services/beneficiaireService";
import { getRegions } from "../services/RegionService";
import { getSession } from "../utils/auth";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

export default function BeneficiairesRegionaux() {
  const session = getSession();
  const isResponsableRegional = session?.role === "RESPONSABLE_REGIONAL";

  const [regions, setRegions] = useState([]);
  const [regionId, setRegionId] = useState(
    isResponsableRegional ? session?.regionId || "" : "",
  );
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chargerRegions();
  }, []);

  // Pour un responsable régional : charge automatiquement sa propre région
  // au montage, sans attendre une sélection manuelle.
  useEffect(() => {
    if (isResponsableRegional && session?.regionId) {
      chargerBeneficiaires(session.regionId);
    }
  }, []);

  const chargerRegions = async () => {
    try {
      const data = await getRegions();
      setRegions(data);
    } catch {
      toast.error("Erreur lors du chargement des régions");
    }
  };

  const chargerBeneficiaires = async (idRegion) => {
    if (!idRegion) return;
    try {
      setLoading(true);
      const data = await getBeneficiairesParRegion(idRegion);
      setBeneficiaires(data);
    } catch {
      toast.error("Erreur lors du chargement des bénéficiaires");
    } finally {
      setLoading(false);
    }
  };

  const beneficiairesFiltres = beneficiaires.filter(
    (b) =>
      b.nom?.toLowerCase().includes(search.toLowerCase()) ||
      b.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      b.telephone?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col">
        <MyNavbar />

        <div className="flex flex-1 pt-16">
          <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 lg:ml-64">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-green-900 tracking-tight">
                Bénéficiaires Régionaux
              </h1>
              <p className="text-green-700 mt-1">
                {isResponsableRegional
                  ? "Consultation des agriculteurs de votre région ayant reçu une aide."
                  : "Consultation des agriculteurs ayant reçu une aide par région."}
              </p>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-700/80 font-semibold text-sm uppercase tracking-wider">
                      Bénéficiaires
                    </p>
                    <h2 className="text-4xl font-black text-green-950 mt-1">
                      {beneficiaires.length}
                    </h2>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl text-green-700">
                    <Users size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-700/80 font-semibold text-sm uppercase tracking-wider">
                      Région {isResponsableRegional ? "" : "sélectionnée"}
                    </p>
                    <h2 className="text-xl font-bold text-green-950 mt-1 truncate max-w-[180px]">
                      {regions.find((r) => r.id == regionId)?.nom || "-"}
                    </h2>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl text-green-700">
                    <MapPin size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-700/80 font-semibold text-sm uppercase tracking-wider">
                      Résultats filtrés
                    </p>
                    <h2 className="text-4xl font-black text-green-950 mt-1">
                      {beneficiairesFiltres.length}
                    </h2>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl text-green-700">
                    <Search size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* FILTRES */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Le sélecteur de région n'est visible que pour l'admin national.
                    Un responsable régional est verrouillé sur sa propre région. */}
                {isResponsableRegional ? (
                  <div className="border border-green-200 bg-green-50/70 rounded-xl p-3 text-green-900 font-semibold flex items-center gap-2">
                    <MapPin size={16} className="text-green-700 shrink-0" />
                    {regions.find((r) => r.id == regionId)?.nom ||
                      session?.regionNom ||
                      "Votre région"}
                  </div>
                ) : (
                  <select
                    value={regionId}
                    onChange={(e) => {
                      setRegionId(e.target.value);
                      chargerBeneficiaires(e.target.value);
                    }}
                    className="border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl p-3 text-green-900 font-medium transition w-full"
                  >
                    <option value="">Sélectionner une région</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.nom}
                      </option>
                    ))}
                  </select>
                )}

                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Rechercher un agriculteur..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl p-3 pl-10 text-green-900 transition"
                  />
                  <Search
                    className="absolute left-3 top-3.5 text-green-600/60"
                    size={18}
                  />
                </div>
              </div>
            </div>

            {/* TABLEAU */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-md border border-white/40 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-green-800 font-medium animate-pulse">
                  Chargement des données...
                </div>
              ) : beneficiairesFiltres.length === 0 ? (
                <div className="p-12 text-center text-green-700 font-medium">
                  Aucun bénéficiaire trouvé.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-green-800 text-white border-b border-green-900">
                        <th className="p-4 text-left font-semibold tracking-wide">
                          Nom
                        </th>
                        <th className="p-4 text-left font-semibold tracking-wide">
                          Prénom
                        </th>
                        <th className="p-4 text-left font-semibold tracking-wide">
                          Téléphone
                        </th>
                        <th className="p-4 text-left font-semibold tracking-wide">
                          Adresse
                        </th>
                        <th className="p-4 text-left font-semibold tracking-wide">
                          Culture
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-100">
                      {beneficiairesFiltres.map((beneficiaire) => (
                        <tr
                          key={beneficiaire.id}
                          className="hover:bg-white/40 transition-colors"
                        >
                          <td className="p-4 font-semibold text-green-950">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-green-600" />
                              {beneficiaire.nom}
                            </div>
                          </td>
                          <td className="p-4 text-green-900">
                            {beneficiaire.prenom}
                          </td>
                          <td className="p-4 text-green-900">
                            <div className="flex items-center gap-2">
                              <Phone size={16} className="text-green-600" />
                              {beneficiaire.telephone}
                            </div>
                          </td>
                          <td className="p-4 text-green-800/90">
                            {beneficiaire.adresse}
                          </td>
                          <td className="p-4">
                            <span className="inline-block bg-green-200/60 text-green-900 px-3 py-1 rounded-full text-xs font-bold border border-green-300/30">
                              {beneficiaire.typeCulture || "Non spécifiée"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
