import { useEffect, useState, useRef } from "react";
import {
  Map,
  PieChart,
  MapPin,
  Filter,
  RefreshCw,
  Search,
  Locate,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import MyNavbar from "./MyNavbar";
import { ThemeProvider } from "../context/ThemeContext";

// Correction icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const iconeActive = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const iconeInactive = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Composant interne : permet de contrôler la carte (flyTo) depuis l'extérieur
function MapController({ cibleRef }) {
  const map = useMap();
  cibleRef.current = map;
  return null;
}

export default function CarteAgricole() {
  const [exploitations, setExploitations] = useState([]);
  const [statsRegions, setStatsRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("tous");

  const [sansGeo, setSansGeo] = useState([]);
  const [geocodageEnCours, setGeocodageEnCours] = useState(null);

  // ── Recherche d'agriculteur sur la carte ──────────────────────
  const [recherche, setRecherche] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const mapRef = useRef(null);
  const markerRefs = useRef({}); // { id: markerInstance }

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const [resGeo, resStats, resTous] = await Promise.all([
        axios.get("http://localhost:8081/api/geo/exploitations"),
        axios.get("http://localhost:8081/api/geo/statistiques-region"),
        axios.get("http://localhost:8081/api/agriculteurs"),
      ]);
      setExploitations(resGeo.data);
      setStatsRegions(resStats.data);
      const localises = new Set(resGeo.data.map((e) => e.id));
      setSansGeo(resTous.data.filter((a) => !localises.has(a.id)));
    } catch (error) {
      console.error(error);
      toast.error("Impossible de charger les données cartographiques");
    } finally {
      setLoading(false);
    }
  };

  const localiserAutomatiquement = async (agriculteur) => {
    setGeocodageEnCours(agriculteur.id);
    const query = `${agriculteur.adresse || ""}, Madagascar`;

    try {
      let response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        { params: { q: query, format: "json", limit: 1, countrycodes: "mg" } },
      );

      let coords = null;

      if (response.data && response.data.length > 0) {
        coords = {
          latitude: parseFloat(response.data[0].lat),
          longitude: parseFloat(response.data[0].lon),
        };
      } else {
        toast.warning(
          `Adresse "${agriculteur.adresse}" non trouvée, tentative avec Madagascar...`,
        );
        response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: "Madagascar",
              format: "json",
              limit: 1,
              countrycodes: "mg",
            },
          },
        );
        if (response.data && response.data.length > 0) {
          coords = {
            latitude: parseFloat(response.data[0].lat),
            longitude: parseFloat(response.data[0].lon),
          };
        }
      }

      if (coords) {
        await axios.put(
          `http://localhost:8081/api/geo/localiser/${agriculteur.id}`,
          null,
          {
            params: { latitude: coords.latitude, longitude: coords.longitude },
          },
        );
        toast.success(
          `${agriculteur.nom} ${agriculteur.prenom} localisé automatiquement !`,
        );
        chargerDonnees();
      } else {
        toast.error(
          `Impossible de localiser ${agriculteur.nom} — adresse introuvable sur OpenStreetMap.`,
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la géolocalisation automatique.");
    } finally {
      setGeocodageEnCours(null);
    }
  };

  // ── Logique de recherche ───────────────────────────────────────
  const handleRechercheChange = (valeur) => {
    setRecherche(valeur);
    if (!valeur.trim()) {
      setSuggestions([]);
      return;
    }
    const q = valeur.toLowerCase();
    const resultats = exploitations.filter((exp) =>
      `${exp.nom} ${exp.prenom}`.toLowerCase().includes(q),
    );
    setSuggestions(resultats.slice(0, 6));
  };

  const allerVersAgriculteur = (exp) => {
    if (!mapRef.current) return;

    mapRef.current.flyTo([exp.latitude, exp.longitude], 14, {
      duration: 1.2,
    });

    setTimeout(() => {
      const marker = markerRefs.current[exp.id];
      if (marker) {
        marker.openPopup();
      }
    }, 1300);

    setRecherche(`${exp.nom} ${exp.prenom}`);
    setSuggestions([]);
  };

  const exploitationsFiltrees =
    filtre === "beneficiaires"
      ? exploitations.filter((e) => e.actif)
      : exploitations;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
        <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-10 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700 mb-4"></div>
          <p className="text-lg font-semibold text-green-900 animate-pulse">
            Chargement des données cartographiques...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex flex-col font-sans antialiased text-green-950">
        <div className="flex flex-1 pt-16">
          <MyNavbar />

          {/* CONTENU PRINCIPAL */}
          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8 lg:ml-64">
            <div className="mb-6">
              <h1 className="text-3xl font-black text-green-900 tracking-tight">
                Cartographie Agricole
              </h1>
              <p className="text-green-800/80 text-sm font-medium mt-1">
                Localisation GPS automatique des exploitations via
                OpenStreetMap.
              </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-4 shadow-xl">
                <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                  Total localisés
                </p>
                <p className="text-3xl font-black text-green-950 mt-1">
                  {exploitations.length}
                </p>
                <p className="text-xs text-green-700 font-semibold mt-1">
                  sur la carte
                </p>
              </div>
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-4 shadow-xl">
                <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                  Bénéficiaires
                </p>
                <p className="text-3xl font-black text-green-950 mt-1">
                  {exploitations.filter((e) => e.actif).length}
                </p>
                <p className="text-xs text-green-700 font-semibold mt-1">
                  actifs localisés
                </p>
              </div>
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-4 shadow-xl">
                <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                  Non localisés
                </p>
                <p className="text-3xl font-black text-green-950 mt-1">
                  {sansGeo.length}
                </p>
                <p className="text-xs text-orange-700 font-semibold mt-1">
                  à géocoder
                </p>
              </div>
              <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-4 shadow-xl">
                <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
                  Régions couvertes
                </p>
                <p className="text-3xl font-black text-green-950 mt-1">
                  {statsRegions.filter((r) => r.totalLocalises > 0).length}
                </p>
                <p className="text-xs text-green-700 font-semibold mt-1">
                  sur {statsRegions.length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* CARTE */}
              <div className="lg:col-span-2 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/30 flex-wrap gap-3">
                  <h2 className="text-base font-extrabold text-green-900 flex items-center gap-2">
                    <Map size={18} /> Carte des exploitations
                  </h2>
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-green-700" />
                    <button
                      onClick={() => setFiltre("tous")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filtre === "tous" ? "bg-green-700 text-white" : "bg-white/60 text-green-800 hover:bg-white/80"}`}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setFiltre("beneficiaires")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filtre === "beneficiaires" ? "bg-green-700 text-white" : "bg-white/60 text-green-800 hover:bg-white/80"}`}
                    >
                      Bénéficiaires
                    </button>
                  </div>
                </div>

                {/* BARRE DE RECHERCHE D'AGRICULTEUR */}
                <div className="px-4 pt-4 relative">
                  <div className="flex items-center gap-2 bg-white/70 border border-white/50 rounded-xl px-3 py-2">
                    <Search size={16} className="text-green-700 shrink-0" />
                    <input
                      type="text"
                      value={recherche}
                      onChange={(e) => handleRechercheChange(e.target.value)}
                      placeholder="Rechercher un agriculteur par nom..."
                      className="bg-transparent outline-none text-sm flex-1 text-green-900 placeholder:text-green-800/40"
                    />
                    {recherche && (
                      <button
                        onClick={() => {
                          setRecherche("");
                          setSuggestions([]);
                        }}
                        className="text-green-700/60 hover:text-green-900"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {suggestions.length > 0 && (
                    <div className="absolute left-4 right-4 mt-1 bg-white rounded-xl border border-green-200 shadow-xl z-[1000] overflow-hidden">
                      {suggestions.map((exp) => (
                        <button
                          key={exp.id}
                          onClick={() => allerVersAgriculteur(exp)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-green-50 transition border-b border-green-100 last:border-0"
                        >
                          <Locate
                            size={14}
                            className="text-green-700 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-green-950 truncate">
                              {exp.nom} {exp.prenom}
                            </p>
                            <p className="text-xs text-green-700/70 truncate">
                              {exp.nomDistrict} — {exp.nomRegion}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {recherche && suggestions.length === 0 && (
                    <div className="absolute left-4 right-4 mt-1 bg-white rounded-xl border border-green-200 shadow-xl z-[1000] p-3 text-xs text-green-700/60 text-center">
                      Aucun agriculteur localisé trouvé pour "{recherche}"
                    </div>
                  )}
                </div>

                <div className="h-[480px] mx-4 my-4 rounded-xl overflow-hidden border border-white/30">
                  <MapContainer
                    center={[-18.9249, 47.5185]}
                    zoom={6}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <MapController cibleRef={mapRef} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {exploitationsFiltrees.map((exp) => (
                      <Marker
                        key={exp.id}
                        position={[exp.latitude, exp.longitude]}
                        icon={exp.actif ? iconeActive : iconeInactive}
                        ref={(ref) => {
                          if (ref) markerRefs.current[exp.id] = ref;
                        }}
                      >
                        <Popup>
                          <div className="text-sm min-w-[180px]">
                            <p className="font-bold text-green-900 text-base">
                              {exp.nom} {exp.prenom}
                            </p>
                            <p className="text-green-700 font-medium">
                              {exp.typeCulture}
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                              {exp.adresse}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {exp.nomDistrict} — {exp.nomRegion}
                            </p>
                            {exp.superficie && (
                              <p className="text-gray-600 text-xs">
                                Superficie : {exp.superficie} Ha
                              </p>
                            )}
                            <p className="text-gray-400 text-xs mt-1">
                              GPS : {exp.latitude?.toFixed(4)},{" "}
                              {exp.longitude?.toFixed(4)}
                            </p>
                            <span
                              className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold ${exp.actif ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                            >
                              {exp.actif ? "Bénéficiaire" : "Non bénéficiaire"}
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>

                {/* Légende */}
                <div className="px-4 pb-4 flex items-center gap-4 text-xs font-semibold text-green-800">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-600 inline-block"></span>
                    Bénéficiaire actif
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-gray-400 inline-block"></span>
                    Non bénéficiaire
                  </span>
                </div>
              </div>

              {/* PANNEAU DROIT */}
              <div className="flex flex-col gap-4">
                {/* Agriculteurs à localiser */}
                <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-4 shadow-xl flex-1">
                  <h2 className="text-sm font-extrabold text-green-900 flex items-center gap-2 mb-3">
                    <MapPin size={16} className="text-orange-600" />À localiser
                    ({sansGeo.length})
                  </h2>

                  {sansGeo.length === 0 ? (
                    <p className="text-xs text-green-700/60 text-center py-6">
                      Tous les agriculteurs sont localisés
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {sansGeo.map((ag) => (
                        <div
                          key={ag.id}
                          className="flex items-center justify-between p-2.5 bg-white/40 rounded-xl border border-white/30 hover:bg-white/60 transition"
                        >
                          <div className="flex-1 min-w-0 mr-2">
                            <p className="text-xs font-bold text-green-950 truncate">
                              {ag.nom} {ag.prenom}
                            </p>
                            <p className="text-xs text-green-700/70 truncate">
                              {ag.adresse || "Adresse non renseignée"}
                            </p>
                          </div>
                          <button
                            onClick={() => localiserAutomatiquement(ag)}
                            disabled={geocodageEnCours === ag.id}
                            className="px-2 py-1.5 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-800 transition disabled:opacity-50 flex items-center gap-1 shrink-0"
                          >
                            {geocodageEnCours === ag.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-white"></div>
                            ) : (
                              <RefreshCw size={12} />
                            )}
                            {geocodageEnCours === ag.id ? "..." : "GPS auto"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Statistiques par région */}
                <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-4 shadow-xl">
                  <h2 className="text-sm font-extrabold text-green-900 flex items-center gap-2 mb-3">
                    <PieChart size={16} /> Analyse par région
                  </h2>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {statsRegions
                      .filter((r) => r.total > 0)
                      .map((region, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white/40 rounded-xl border border-white/30"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-green-950 truncate">
                              {region.nomRegion}
                            </span>
                            <span className="text-xs font-bold text-green-700 shrink-0 ml-1">
                              {region.totalActifs} bénéf.
                            </span>
                          </div>
                          <div className="w-full bg-green-900/10 rounded-full h-1.5 mb-1">
                            <div
                              className="bg-green-700 h-1.5 rounded-full transition-all duration-500"
                              style={{
                                width: `${region.total > 0 ? (region.totalActifs / region.total) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-green-700/70">
                            <span>{region.total} inscrits</span>
                            <span>{region.totalLocalises} localisés</span>
                            <span>
                              {Number(region.superficieTotale || 0).toFixed(1)}{" "}
                              Ha
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
